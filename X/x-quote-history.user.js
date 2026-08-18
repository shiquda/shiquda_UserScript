// ==UserScript==
// @name         X 引用 | 快速引用帖子
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @version      1.0.4
// @description  在 X 发帖或回复时搜索帖子，并把选中的链接插入当前草稿。
// @author       shiquda
// @match        https://x.com/*
// @match        https://twitter.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// @license       MIT
// ==/UserScript==

(() => {
    'use strict';

    const DEBUG = false;
    const PREFIX = 'xquote_';
    const PICKER_PREFIX = 'x_quote_picker_';
    const PENDING_TTL_MS = 10 * 60 * 1000;
    const LAST_USERNAME_KEY = 'xquote:lastKnownUsername';
    const ONLY_ORIGINAL_KEY = 'xquote:onlyOriginalPosts';

    // X has kept tweetTextarea_0 as its primary composer hook; the other
    // entries are scoped fallbacks from open-source X extensions.
    const SELECTORS = {
        composers: [
            '[data-testid="tweetTextarea_0"]',
            '[data-testid^="tweetTextarea_"]',
            'article [contenteditable="true"]',
            '[role="dialog"] [contenteditable="true"]',
            'div[contenteditable="true"][role="textbox"]',
        ],
        profileLink: ['a[data-testid="AppTabBar_Profile_Link"]'],
        accountSwitcher: ['[data-testid="SideNav_AccountSwitcher_Button"]'],
        tweet: ['article[data-testid="tweet"]', 'article[role="article"]'],
        statusLink: ['a[href*="/status/"]'],
        toolbar: [
            '[data-testid="toolBar"]',
            '[role="toolbar"]',
            '[data-testid="tweetButtonInline"]',
        ],
        composerActions: [
            '[data-testid="mediaButton"]',
            '[data-testid="fileInput"]',
            '[data-testid="gifButton"]',
            '[data-testid="emojiButton"]',
            '[aria-label="Add photos or video"]',
            '[aria-label="Add a GIF"]',
            '[aria-label="Add GIF"]',
            '[aria-label="Add emoji"]',
        ],
    };

    const pendingRequests = new Map();
    const composerState = new WeakMap();
    let scanScheduled = false;
    let activePopover = null;

    function debug(...values) {
        if (DEBUG) console.debug('[XQuote]', ...values);
    }

    function queryFirst(selectors, root = document) {
        for (const selector of selectors) {
            const result = root.querySelector(selector);
            if (result) return result;
        }
        return null;
    }

    function queryAll(selectors, root = document) {
        const result = new Set();
        for (const selector of selectors) {
            root.querySelectorAll(selector).forEach((element) => result.add(element));
        }
        return [...result];
    }

    function normalizeUsername(candidate) {
        if (!candidate) return null;
        const match = String(candidate).match(/(?:^|\s|\/)@?([A-Za-z0-9_]{1,15})(?:$|[/?\s])/);
        return match ? match[1] : null;
    }

    function usernameFromHref(href) {
        if (!href) return null;
        try {
            const pathname = new URL(href, location.origin).pathname;
            const handle = pathname.split('/').filter(Boolean)[0];
            return handle && !['home', 'search', 'compose', 'settings', 'i', 'explore', 'notifications', 'messages'].includes(handle)
                ? normalizeUsername(handle)
                : null;
        } catch {
            return null;
        }
    }

    function resolveCurrentUsername() {
        const profile = queryFirst(SELECTORS.profileLink);
        const profileUsername = profile && usernameFromHref(profile.getAttribute('href'));
        if (profileUsername) return rememberUsername(profileUsername);

        const switcher = queryFirst(SELECTORS.accountSwitcher);
        if (switcher) {
            const switcherUsername = normalizeUsername(switcher.textContent)
                || usernameFromHref(switcher.querySelector('a[href]')?.getAttribute('href'));
            if (switcherUsername) return rememberUsername(switcherUsername);
        }

        const cached = normalizeUsername(sessionStorage.getItem(LAST_USERNAME_KEY));
        if (cached) {
            debug('username fallback:', cached);
            return cached;
        }
        return null;
    }

    function rememberUsername(username) {
        sessionStorage.setItem(LAST_USERNAME_KEY, username);
        debug('username resolved:', username);
        return username;
    }

    function isPickerMode() {
        return window.name.startsWith(PICKER_PREFIX);
    }

    function pickerRequestId() {
        return isPickerMode() ? window.name.slice(PICKER_PREFIX.length) : null;
    }

    function makeRequestId() {
        const entropy = globalThis.crypto?.randomUUID?.() || `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        return `${PREFIX}${entropy}`;
    }

    function isVisible(element) {
        const style = getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
    }

    function editableComposer(candidate) {
        if (!(candidate instanceof HTMLElement)) return null;
        if (candidate.isContentEditable) return candidate;
        return candidate.querySelector?.('div[contenteditable="true"]') || null;
    }

    function isComposer(element) {
        return element instanceof HTMLElement
            && element.isContentEditable
            && isVisible(element)
            && !element.closest('[data-xquote-ui]');
    }

    function composerRoot(composer) {
        let current = composer;
        for (let depth = 0; current && depth < 7; depth += 1, current = current.parentElement) {
            if (current.matches?.('[data-testid^="tweetTextarea_"]')) return current;
        }
        return composer;
    }

    function composerContainer(composer) {
        const root = composerRoot(composer);
        // The editor and its action bar are siblings. Walk only its local
        // ancestry so an inline reply cannot mount into the page composer.
        for (let current = root; current && current !== document.body; current = current.parentElement) {
            // A tweet article also owns the original tweet's action bar. It
            // is not the reply editor's toolbar, so fall back beside the
            // editor rather than attach there.
            if (current !== root && current.matches?.('article[data-testid="tweet"], article[role="article"]')) break;
            if (queryFirst([...SELECTORS.toolbar, ...SELECTORS.composerActions], current)) return current;
        }
        return root.closest('[role="dialog"]')
            || root.closest('form')
            || root.closest('article')
            || root.parentElement;
    }

    function findToolbar(composer) {
        const container = composerContainer(composer);
        if (!container) return null;

        const explicit = queryFirst(SELECTORS.toolbar, container);
        if (explicit && explicit !== composer) return explicit;

        const action = queryFirst(SELECTORS.composerActions, container);
        if (!action) return null;
        return action.closest('[role="group"]')
            || action.closest('[role="toolbar"]')
            || action.parentElement;
    }

    function fallbackMount(composer) {
        const root = composerRoot(composer);
        const nextSibling = root.nextElementSibling;
        if (nextSibling?.dataset.xquoteUi === 'composer-fallback') return nextSibling;

        const slot = document.createElement('div');
        slot.className = 'xquote-composer-fallback';
        slot.dataset.xquoteUi = 'composer-fallback';
        root.insertAdjacentElement('afterend', slot);
        return slot;
    }

    function injectionMount(composer) {
        return findToolbar(composer) || fallbackMount(composer);
     }

    function captureSelection(composer) {
        const selection = window.getSelection();
        if (!selection?.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (composer.contains(range.commonAncestorContainer)) {
            const state = composerState.get(composer) || {};
            state.range = range.cloneRange();
            composerState.set(composer, state);
        }
    }

    function quoteButtonShouldBeVisible(composer) {
        return composer.dataset.xquotePointerFocused === 'true'
            && document.activeElement === composer;
    }

    function setQuoteButtonVisibility(composer, visible) {
        const composerId = composer.dataset.xquoteId;
        if (!composerId) return;
        document.querySelectorAll(`[data-xquote-ui="composer-button"][data-xquote-composer="${composerId}"]`)
            .forEach((button) => { button.hidden = !visible; });
    }

    function installComposerListeners(composer) {
        if (composer.dataset.xQuoteListeners) return;
        composer.dataset.xQuoteListeners = 'true';
        ['input', 'keyup', 'mouseup'].forEach((eventName) => {
            composer.addEventListener(eventName, () => captureSelection(composer), true);
        });
        composer.addEventListener('pointerdown', () => {
            composer.dataset.xquotePointerFocused = 'true';
            requestAnimationFrame(() => {
                if (quoteButtonShouldBeVisible(composer)) setQuoteButtonVisibility(composer, true);
                else {
                    delete composer.dataset.xquotePointerFocused;
                    setQuoteButtonVisibility(composer, false);
                }
            });
        }, true);
        composer.addEventListener('focus', () => captureSelection(composer), true);
        composer.addEventListener('blur', () => {
            delete composer.dataset.xquotePointerFocused;
            setQuoteButtonVisibility(composer, false);
        }, true);
    }

    function createQuoteButton(composer, composerId) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'xquote-composer-button';
        button.dataset.xquoteUi = 'composer-button';
        button.dataset.xquoteComposer = composerId;
        button.hidden = !quoteButtonShouldBeVisible(composer);
        button.title = '引用帖子';
        button.setAttribute('aria-label', '引用帖子');
        button.innerHTML = '<span aria-hidden="true">↗</span><span>引用</span>';
        button.addEventListener('mousedown', (event) => event.preventDefault());
        button.addEventListener('click', () => openSearchPopover(composer, button));
        return button;
    }

    function enhanceComposer(composer) {
        if (!isComposer(composer)) return;
        installComposerListeners(composer);

        const composerId = composer.dataset.xquoteId ||= makeRequestId();
        const mount = injectionMount(composer);
        let button = document.querySelector(`[data-xquote-ui="composer-button"][data-xquote-composer="${composerId}"]`);
        if (button && !mount.contains(button)) mount.append(button);
        if (button) button.hidden = !quoteButtonShouldBeVisible(composer);
        if (!button) {
            button = createQuoteButton(composer, composerId);
            mount.append(button);
        }
        composer.dataset.xQuoteEnhanced = 'true';
        debug('composer detected', { mount: mount.dataset.testid || mount.getAttribute('role') || mount.className });
    }

    function scanComposers() {
        const composers = new Set();
        queryAll(SELECTORS.composers).forEach((candidate) => {
            const composer = editableComposer(candidate);
            if (composer) composers.add(composer);
        });
        composers.forEach(enhanceComposer);
    }

    function scheduleScan() {
        if (scanScheduled) return;
        scanScheduled = true;
        requestAnimationFrame(() => {
            scanScheduled = false;
            scanComposers();
            if (isPickerMode()) scanTweets();
        });
    }

    function closePopover() {
        activePopover?.remove();
        activePopover = null;
    }

    function createPopover(composer, trigger) {
        const popover = document.createElement('section');
        popover.className = 'xquote-popover';
        popover.dataset.xquoteUi = 'popover';
        popover.innerHTML = `
            <div class="xquote-popover-header">
                <strong>引用</strong>
                <button type="button" class="xquote-close" aria-label="关闭">×</button>
            </div>
            <p class="xquote-account"></p>
            <label class="xquote-target-row">引用用户
                <input class="xquote-target-username" type="text" maxlength="15" placeholder="@username" autocomplete="off">
            </label>
            <label class="xquote-search-label">搜索帖子
                <input class="xquote-search-input" type="search" maxlength="280" placeholder="搜索帖子…" autocomplete="off">
            </label>
            <label class="xquote-original-filter"><input type="checkbox"> 仅显示非回复帖子</label>
            <p class="xquote-error" role="alert" hidden></p>
            <div class="xquote-popover-actions"><button type="button" class="xquote-search-button">搜索</button></div>
        `;

        const username = resolveCurrentUsername();
        const account = popover.querySelector('.xquote-account');
        const targetUsername = popover.querySelector('.xquote-target-username');
        const originalFilter = popover.querySelector('.xquote-original-filter input');
        originalFilter.checked = sessionStorage.getItem(ONLY_ORIGINAL_KEY) === 'true';
        targetUsername.value = username ? `@${username}` : '';
        account.textContent = username
            ? `默认使用当前账号 @${username}，可修改`
            : '请输入要引用的用户';

        function currentUsername() {
            return normalizeUsername(targetUsername.value);
        }

        function showError(text) {
            const error = popover.querySelector('.xquote-error');
            error.textContent = text;
            error.hidden = false;
        }

        function search() {
            const handle = currentUsername();
            if (!handle) {
                showError('请输入要引用的用户');
                targetUsername.focus();
                return;
            }
            sessionStorage.setItem(ONLY_ORIGINAL_KEY, String(originalFilter.checked));
            launchPicker(composer, handle, popover.querySelector('.xquote-search-input').value, originalFilter.checked);
        }

        popover.querySelector('.xquote-close').addEventListener('click', closePopover);
        popover.querySelector('.xquote-search-button').addEventListener('click', search);
        popover.querySelector('.xquote-search-input').addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                search();
            } else if (event.key === 'Escape') {
                closePopover();
            }
        });
        targetUsername.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') search();
        });

        const rect = trigger.getBoundingClientRect();
        popover.style.top = `${Math.min(window.innerHeight - 360, Math.max(12, rect.bottom + 8))}px`;
        popover.style.left = `${Math.min(window.innerWidth - 340, Math.max(12, rect.left))}px`;
        return popover;
    }

    function openSearchPopover(composer, trigger) {
        captureSelection(composer);
        if (activePopover && activePopover.dataset.xquoteComposer === composer.dataset.xquoteId) {
            closePopover();
            return;
        }
        closePopover();
        composer.dataset.xquoteId ||= makeRequestId();
        activePopover = createPopover(composer, trigger);
        activePopover.dataset.xquoteComposer = composer.dataset.xquoteId;
        document.body.append(activePopover);
        activePopover.querySelector('.xquote-search-input').focus();
    }

    function buildSearchUrl(username, keyword, originalsOnly) {
        const terms = [`from:${username}`];
        const cleanedKeyword = keyword.trim();
        if (cleanedKeyword) terms.push(cleanedKeyword);
        if (originalsOnly) terms.push('-filter:replies');
        const query = terms.join(' ');
        return `${location.origin}/search?q=${encodeURIComponent(query)}&src=typed_query&f=live`;
    }

    function launchPicker(composer, username, keyword, originalsOnly) {
        if (!composer.isConnected) {
            toast('原编辑框已经关闭');
            closePopover();
            return;
        }
        const requestId = makeRequestId();
        const popup = window.open(
            buildSearchUrl(username, keyword, originalsOnly),
            `${PICKER_PREFIX}${requestId}`,
            'popup=yes,width=720,height=850,resizable=yes,scrollbars=yes',
        );
        if (!popup) {
            toast('无法打开搜索窗口，请允许 x.com 弹出窗口');
            return;
        }
        pendingRequests.set(requestId, {
            composer,
            container: composerContainer(composer),
            popup,
            createdAt: Date.now(),
        });
        closePopover();
        debug('request created:', requestId);
        debug('picker opened');
    }

    function canonicalStatusUrl(href) {
        if (!href) return null;
        try {
            const url = new URL(href, location.origin);
            if (url.origin !== location.origin) return null;
            const match = url.pathname.match(/^\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/);
            return match ? `${location.origin}/${match[1]}/status/${match[2]}` : null;
        } catch {
            return null;
        }
    }

    function extractTweetUrl(article) {
        const timeLink = article.querySelector('a[href*="/status/"] time')?.closest('a');
        return canonicalStatusUrl(timeLink?.getAttribute('href'))
            || canonicalStatusUrl(queryFirst(SELECTORS.statusLink, article)?.getAttribute('href'));
    }

    function addPickerNotice() {
        if (document.querySelector('[data-xquote-ui="picker-notice"]')) return;
        const notice = document.createElement('aside');
        notice.className = 'xquote-picker-notice';
        notice.dataset.xquoteUi = 'picker-notice';
        notice.textContent = '正在选择要引用的帖子 · 点击“引用”返回原编辑器 · 关闭窗口可取消';
        document.body.append(notice);
    }

    function enhanceTweet(article) {
        if (article.dataset.xQuoteEnhanced === 'true') return;
        const url = extractTweetUrl(article);
        if (!url) return;
        article.dataset.xQuoteEnhanced = 'true';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'xquote-pick-button';
        button.dataset.xquoteUi = 'pick-button';
        button.textContent = '引用';
        button.title = '引用此帖';
        button.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            sendSelection(url);
        });
        const actionBar = article.querySelector('[role="group"]:last-of-type')
            || article.querySelector('[data-testid="reply"]')?.parentElement?.parentElement
            || article;
        actionBar.append(button);
    }

    function scanTweets() {
        addPickerNotice();
        queryAll(SELECTORS.tweet).forEach(enhanceTweet);
    }

    function sendSelection(postUrl) {
        const requestId = pickerRequestId();
        if (!requestId || !canonicalStatusUrl(postUrl)) return;
        if (!window.opener || window.opener.closed) {
            copyText(postUrl);
            toast('无法返回原编辑器，帖子链接已复制');
            return;
        }
        window.opener.postMessage({ source: 'x-quote-picker', requestId, postUrl }, location.origin);
        debug('tweet selected:', postUrl);
        window.close();
    }

    function eventIsSelection(event) {
        const { data } = event;
        return event.origin === location.origin
            && data
            && data.source === 'x-quote-picker'
            && typeof data.requestId === 'string'
            && typeof data.postUrl === 'string'
            && canonicalStatusUrl(data.postUrl) === data.postUrl;
    }

    function replaceComposer(request) {
        const active = document.activeElement;
        if (isComposer(active) && request.container?.contains(active)) return active;
        const candidates = request.container ? queryAll(SELECTORS.composers, request.container).filter(isComposer) : [];
        return candidates.length === 1 ? candidates[0] : null;
    }

    async function receiveSelection(event) {
        if (!eventIsSelection(event)) return;
        const { requestId, postUrl } = event.data;
        const request = pendingRequests.get(requestId);
        if (!request) return;
        pendingRequests.delete(requestId);
        if (request.popup && event.source !== request.popup) {
            copyText(postUrl);
            toast('无法确认搜索窗口，帖子链接已复制');
            return;
        }

        const target = request.composer.isConnected && isComposer(request.composer)
            ? request.composer
            : replaceComposer(request);
        if (!target || !await insertPostUrl(target, postUrl)) {
            copyText(postUrl);
            toast('未能写入编辑器，帖子链接已复制');
            return;
        }
        debug('selection received');
        debug('url inserted');
    }

    function textForInsertion(composer, postUrl) {
        const existing = (composer.innerText || composer.textContent || '').replace(/\u200B/g, '').trim();
        return existing ? (existing.endsWith('\n') || existing.endsWith(' ') ? postUrl : `\n${postUrl}`) : postUrl;
    }

    function restoreCaret(composer) {
        const range = composerState.get(composer)?.range;
        if (!range || !composer.contains(range.commonAncestorContainer)) return false;
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
    }

    function moveCaretToEnd(composer) {
        const range = document.createRange();
        range.selectNodeContents(composer);
        range.collapse(false);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }

    function normalizedComposerText(composer) {
        return (composer.innerText || composer.textContent || '')
            .replace(/\u200B/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function waitOneFrame() {
        return new Promise((resolve) => requestAnimationFrame(resolve));
    }

    function pasteIntoComposer(composer, text) {
        try {
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/plain', text);
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData,
            });
            return !composer.dispatchEvent(pasteEvent);
        } catch {
            return false;
        }
    }

    async function insertPostUrl(composer, postUrl) {
        if (!isComposer(composer) || !canonicalStatusUrl(postUrl)) return false;
        const text = textForInsertion(composer, postUrl);
        const before = normalizedComposerText(composer);
        composer.focus();
        if (!restoreCaret(composer)) moveCaretToEnd(composer);

        // X's Lexical editor owns the draft state. A paste event follows its
        // native React path; direct DOM mutation can leave the placeholder
        // visible because X never receives a state update.
        const pasteHandled = pasteIntoComposer(composer, text);
        await waitOneFrame();
        if (pasteHandled && normalizedComposerText(composer).includes(postUrl)) {
            captureSelection(composer);
            return true;
        }

        // Older hosts may not handle synthetic paste. execCommand is the
        // only fallback because it produces the browser input transaction;
        // do not assign textContent, which would again bypass X's state.
        if (!restoreCaret(composer)) moveCaretToEnd(composer);
        let inserted = false;
        try {
            inserted = document.execCommand('insertText', false, text);
        } catch {
            inserted = false;
        }
        await waitOneFrame();
        const after = normalizedComposerText(composer);
        if (!inserted || !after.includes(postUrl) || (before === after && !before.includes(postUrl))) return false;
        captureSelection(composer);
        return true;
    }

    function copyText(text) {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.append(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
    }

    function toast(message) {
        const existing = document.querySelector('[data-xquote-ui="toast"]');
        existing?.remove();
        const element = document.createElement('div');
        element.className = 'xquote-toast';
        element.dataset.xquoteUi = 'toast';
        element.setAttribute('role', 'status');
        element.textContent = message;
        document.body.append(element);
        window.setTimeout(() => element.remove(), 4500);
    }

    function cleanupPendingRequests() {
        const now = Date.now();
        for (const [requestId, request] of pendingRequests) {
            if (now - request.createdAt > PENDING_TTL_MS || request.popup?.closed) pendingRequests.delete(requestId);
        }
    }

    function installStyles() {
        if (document.getElementById('xquote-styles')) return;
        const style = document.createElement('style');
        style.id = 'xquote-styles';
        style.textContent = `
            .xquote-composer-button,.xquote-pick-button,.xquote-search-button,.xquote-close{font:inherit;cursor:pointer}
            .xquote-composer-button{align-items:center;background:transparent;border:0;border-radius:9999px;color:rgb(29,155,240);display:inline-flex;font-size:13px;font-weight:700;gap:5px;margin:0 4px;padding:7px 10px}.xquote-composer-button:hover{background:rgba(29,155,240,.1)}.xquote-composer-fallback{display:flex;justify-content:flex-start;margin:4px 0}
            .xquote-composer-button[hidden]{display:none!important}
            .xquote-popover{background:var(--xquote-bg,#fff);border:1px solid rgba(83,100,113,.35);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.22);box-sizing:border-box;color:var(--xquote-fg,#0f1419);font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:14px;position:fixed;width:320px;z-index:2147483647}.xquote-popover-header{align-items:center;display:flex;justify-content:space-between}.xquote-close{background:transparent;border:0;color:inherit;font-size:22px;line-height:1}.xquote-account{color:#536471;margin:9px 0}.xquote-search-label,.xquote-manual-row label{display:grid;font-weight:600;gap:6px}.xquote-search-input,.xquote-manual-username{border:1px solid #536471;border-radius:6px;box-sizing:border-box;color:inherit;font:inherit;padding:9px;width:100%}.xquote-original-filter{display:block;margin:12px 0}.xquote-manual-row{margin-bottom:10px}.xquote-error{color:#f4212e;margin:8px 0}.xquote-popover-actions{display:flex;justify-content:flex-end}.xquote-search-button{background:#0f1419;border:0;border-radius:999px;color:#fff;font-weight:700;padding:8px 18px}
            .xquote-target-row{display:grid;font-weight:600;gap:6px;margin:9px 0}.xquote-target-username{border:1px solid #536471;border-radius:6px;box-sizing:border-box;color:inherit;font:inherit;padding:8px;width:100%}
            .xquote-picker-notice{background:#1d9bf0;border-radius:0 0 10px 10px;color:#fff;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;left:50%;max-width:calc(100% - 30px);padding:9px 14px;position:fixed;text-align:center;top:0;transform:translateX(-50%);z-index:2147483647}.xquote-pick-button{background:transparent;border:1px solid rgb(29,155,240);border-radius:999px;color:rgb(29,155,240);font-weight:700;margin:0 0 0 8px;padding:5px 12px}.xquote-pick-button:hover{background:rgba(29,155,240,.1)}.xquote-toast{background:#0f1419;border-radius:8px;bottom:24px;color:#fff;font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;left:50%;max-width:calc(100% - 32px);padding:12px 16px;position:fixed;transform:translateX(-50%);z-index:2147483647}
            @media (prefers-color-scheme:dark){.xquote-popover{--xquote-bg:#16181c;--xquote-fg:#eff3f4}.xquote-search-button{background:#eff3f4;color:#0f1419}}
        `;
        document.head.append(style);
    }

    function hookHistory() {
        for (const method of ['pushState', 'replaceState']) {
            const original = history[method];
            history[method] = function (...args) {
                const result = original.apply(this, args);
                scheduleScan();
                return result;
            };
        }
        addEventListener('popstate', scheduleScan);
    }

    function observeDom() {
        new MutationObserver(scheduleScan).observe(document.documentElement, { childList: true, subtree: true });
    }

    function initializePicker() {
        installStyles();
        scanTweets();
        observeDom();
    }

    function initializeComposerPage() {
        installStyles();
        addEventListener('message', receiveSelection);
        addEventListener('click', (event) => {
            if (activePopover && !activePopover.contains(event.target) && !event.target.closest('[data-xquote-ui="composer-button"]')) closePopover();
        }, true);
        scanComposers();
        observeDom();
        hookHistory();
        window.setInterval(cleanupPendingRequests, 30 * 1000);
    }

    if (isPickerMode()) initializePicker();
    else initializeComposerPage();
})();
