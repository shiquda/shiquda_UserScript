// ==UserScript==
// @name         AI Chat URL Prompt Auto Submit
// @namespace    https://github.com/shiquda/shiquda_Userscript
// @version      2.0.0
// @description  Automatically submits prompts passed via ?q= or ?prompt= on ChatGPT and Gemini. ChatGPT pre-fills its composer; Gemini has no such URL parameter, so the script fills its Quill composer itself.
// @author       shiquda
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @match        https://gemini.google.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const TAG = '[AI URL Auto Submit]';
    const POLL_INTERVAL_MS = 200;
    // 一直等不到可用发送按钮时的总时限
    const GIVE_UP_MS = 30_000;
    // 输入框已有内容，但迟迟找不到发送按钮（UI 又改版）时，改用回车提交
    const ENTER_FALLBACK_AFTER_MS = 5_000;

    // 发送按钮的本地化名称。两个站点都只靠 aria-label 辨认发送按钮
    const SEND_LABEL_RE = /^(send|发送|傳送|送信|보내기|enviar|envoyer|senden|invia|отправить|verzenden)/i;
    // composer 主操作位上还可能是语音/听写/停止生成按钮，绝不能点
    const NON_SEND_LABEL_RE = /stop|voice|dictation|microphone|语音|語音|听写|聽寫|音声|マイク|음성|voz|voix|stimme|sprache|голос/i;

    const IS_GEMINI = location.hostname === 'gemini.google.com'
        || location.hostname.endsWith('.gemini.google.com');

    // 站点载入后可能会改写/保留查询参数，因此优先读当前 URL，
    // 读不到再回退到导航记录里的原始 URL（脚本被延迟注入时用得上）
    function readPromptParam() {
        const hrefs = [];
        try { hrefs.push(window.location.href); } catch (e) { /* ignore */ }
        try {
            const entry = performance.getEntriesByType('navigation')[0];
            if (entry && entry.name) hrefs.push(entry.name);
        } catch (e) { /* ignore */ }

        for (const href of hrefs) {
            try {
                const params = new URL(href).searchParams;
                const value = params.get('q') || params.get('prompt');
                if (value && value.trim()) return value;
            } catch (e) { /* ignore */ }
        }
        return null;
    }

    const promptText = readPromptParam();
    if (!promptText) return;

    // ---------- ChatGPT ----------

    // 旧版 UI：textarea#prompt-textarea；新版 UI：ProseMirror contenteditable
    function getChatGPTEditor() {
        return document.querySelector('textarea#prompt-textarea')
            || document.querySelector('#prompt-textarea')
            || document.querySelector('form[data-chatgpt-composer] div.ProseMirror[contenteditable="true"]')
            || document.querySelector('div.ProseMirror[contenteditable="true"]')
            || document.querySelector('[contenteditable="true"][role="textbox"]');
    }

    function getChatGPTComposerRoot(editor) {
        if (editor && editor.closest('form')) return editor.closest('form');
        return document.querySelector('form[data-chatgpt-composer]');
    }

    function findChatGPTSendButton(editor) {
        // 1) 明确标了 id/data-testid 的发送按钮（旧版 UI 曾用 #composer-submit-button）
        const explicit = document.querySelector('#composer-submit-button')
            || document.querySelector('button[data-testid="send-button"]')
            || document.querySelector('button[data-testid="composer-send-button"]');
        if (isUsable(explicit)) return explicit;

        const root = getChatGPTComposerRoot(editor);
        if (!root) return null;

        // 2) 新版 UI 靠 aria-label 辨认（如「发送消息」/「Send message」）
        for (const button of root.querySelectorAll('button[aria-label]')) {
            const label = (button.getAttribute('aria-label') || '').trim();
            if (SEND_LABEL_RE.test(label) && isUsable(button)) return button;
        }

        // 3) 兜底：composer 的主操作按钮（新版 UI：button.size-token-button-composer.bg-composer-primary）。
        //    输入框为空时这个位置是「开始语音」，有内容时才切换成发送按钮，所以只排除语音/听写类按钮
        for (const button of root.querySelectorAll('button')) {
            if (!/size-token-button-composer|bg-composer-primary/.test(String(button.className))) continue;
            const label = (button.getAttribute('aria-label') || '').trim();
            if (NON_SEND_LABEL_RE.test(label)) continue;
            if (isUsable(button)) return button;
        }

        return null;
    }

    // ---------- Gemini ----------

    // Gemini 只把 ?q= 当成普通查询参数丢掉，不会预填输入框，所以脚本自己填。
    // 只处理新会话首页 /app，避免刷新已发送的 /app/<conversationId> 时重复提交
    function onGeminiHome() {
        return location.pathname.replace(/\/+$/, '') === '/app';
    }

    function getGeminiEditor() {
        return document.querySelector('rich-textarea div.ql-editor[contenteditable="true"]')
            || document.querySelector('div.ql-editor[contenteditable="true"]');
    }

    function findGeminiSendButton(editor) {
        const root = editor.closest('.input-area') || editor.closest('form') || document;
        for (const button of root.querySelectorAll('button[aria-label]')) {
            const label = (button.getAttribute('aria-label') || '').trim();
            if (!SEND_LABEL_RE.test(label) || NON_SEND_LABEL_RE.test(label)) continue;
            if (isUsable(button)) return button;
        }
        return null;
    }

    // Quill 只认真实的输入事件。先试 execCommand；后台标签页拿不到焦点时退回
    // 「构造段落 + input 事件」，两条路都能让 Angular 渲染出发送按钮
    function fillGeminiEditor(editor, text) {
        editor.focus();
        try {
            document.execCommand('insertText', false, text);
        } catch (e) { /* fall through */ }
        if (editorText(editor)) return true;

        const fragment = document.createDocumentFragment();
        for (const line of text.split('\n')) {
            const p = document.createElement('p');
            if (line) p.textContent = line;
            else p.appendChild(document.createElement('br'));
            fragment.appendChild(p);
        }
        editor.replaceChildren(fragment);
        editor.dispatchEvent(new InputEvent('input', {
            bubbles: true,
            inputType: 'insertText',
            data: text
        }));
        return !!editorText(editor);
    }

    // ---------- shared helpers ----------

    function isUsable(button) {
        if (!button) return false;
        if (button.disabled) return false;
        if (button.getAttribute('aria-disabled') === 'true') return false;
        return button.getClientRects().length > 0;
    }

    function editorText(editor) {
        if (!editor) return '';
        const raw = typeof editor.value === 'string'
            ? editor.value
            : (editor.innerText || editor.textContent || '');
        // 空段落里可能残留零宽字符
        return raw.replace(/[\u200b\u200c\u200d\ufeff]/g, '').trim();
    }

    function pressEnter(editor) {
        editor.focus();
        const event = new KeyboardEvent('keydown', {
            key: 'Enter',
            code: 'Enter',
            bubbles: true,
            cancelable: true,
            composed: true
        });
        // keyCode / which 不在 KeyboardEventInit 里，需要单独定义，兼容按键码实现的监听
        Object.defineProperty(event, 'keyCode', { get: () => 13 });
        Object.defineProperty(event, 'which', { get: () => 13 });
        editor.dispatchEvent(event);
    }

    // 提交后去掉 q/prompt，防止刷新页面（Gemini 会保留这两个参数）再发一遍
    let stripping = false;
    function stripPromptParams() {
        if (stripping) return;
        try {
            const url = new URL(location.href);
            if (!url.searchParams.has('q') && !url.searchParams.has('prompt')) return;
            url.searchParams.delete('q');
            url.searchParams.delete('prompt');
            stripping = true;
            history.replaceState(history.state, '', url.toString());
        } catch (e) { /* ignore */ } finally {
            stripping = false;
        }
    }

    let submitted = false;
    let timer = null;
    let textSeenAt = 0;
    let geminiFilled = false;
    let geminiAttempts = 0;
    let geminiLastAttemptAt = 0;
    let geminiButtonSeenAt = 0;
    const startedAt = Date.now();

    function stop(reason) {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
        if (reason) console.log(TAG, reason);
    }

    function timedOut(what) {
        if (Date.now() - startedAt <= GIVE_UP_MS) return false;
        stop('timeout: ' + what + ', nothing submitted');
        return true;
    }

    function submit(editor, button) {
        submitted = true;
        if (button) {
            console.log(TAG, 'clicking submit button', button);
            button.click();
        } else {
            console.log(TAG, 'no usable submit button found, pressing Enter');
            pressEnter(editor);
        }
        stripPromptParams();
        stop();
    }

    function tickChatGPT() {
        const editor = getChatGPTEditor();
        if (!editorText(editor)) {
            // ?q= 的预填还没落到输入框，等 ChatGPT 自己填好再提交
            timedOut('composer stayed empty');
            return;
        }

        if (!textSeenAt) textSeenAt = Date.now();

        const button = findChatGPTSendButton(editor);
        if (button) {
            submit(editor, button);
            return;
        }

        if (Date.now() - textSeenAt >= ENTER_FALLBACK_AFTER_MS) submit(editor, null);
    }

    function finishGemini() {
        submitted = true;
        stripPromptParams();
        stop('submitted');
    }

    function geminiSendStarted(editor) {
        if (!editorText(editor)) return true;
        const root = editor.closest('.input-area') || document;
        for (const button of root.querySelectorAll('button[aria-label]')) {
            const label = (button.getAttribute('aria-label') || '').trim();
            if (/^(stop|停止)/i.test(label) && isUsable(button)) return true;
        }
        // 用户消息已经出现，说明发出去了（编辑器可能还没来得及清空）
        const needle = promptText.replace(/\s+/g, ' ').trim().slice(0, 32);
        if (!needle) return false;
        return [...document.querySelectorAll('user-query')].some((node) =>
            node.textContent.replace(/\s+/g, ' ').indexOf(needle) !== -1);
    }

    function clickGeminiButton(button) {
        geminiAttempts += 1;
        geminiLastAttemptAt = Date.now();
        console.log(TAG, 'clicking submit button', button);
        button.click();
    }

    function tickGemini() {
        if (!onGeminiHome()) {
            // 发送成功后 Gemini 会把地址换成 /app/<conversationId>
            if (geminiAttempts > 0 && location.pathname.startsWith('/app/')) finishGemini();
            else timedOut('left the new-chat page');
            return;
        }

        const editor = getGeminiEditor();
        if (!editor) {
            timedOut('composer never appeared');
            return;
        }

        // 点过发送/回车之后编辑器被清空、出现停止按钮或用户消息，说明真的发出去了
        if (geminiAttempts > 0 && geminiSendStarted(editor)) {
            finishGemini();
            return;
        }

        if (!geminiFilled) {
            if (editorText(editor)) {
                // 用户在加载期间自己敲了内容，不抢着提交
                stop('composer already has text before fill, skipped');
                return;
            }
            if (!fillGeminiEditor(editor, promptText)) {
                timedOut('failed to fill composer');
                return;
            }
            geminiFilled = true;
            textSeenAt = Date.now();
            // 发送按钮要等 Angular 下一次变更检测才渲染出来
            return;
        }

        // Angular 重渲染可能清空编辑器 DOM，重新填一次
        if (!editorText(editor)) {
            if (!fillGeminiEditor(editor, promptText)) {
                timedOut('failed to refill composer');
                return;
            }
            textSeenAt = Date.now();
            return;
        }

        const button = findGeminiSendButton(editor);
        if (!button) {
            if (Date.now() - textSeenAt < ENTER_FALLBACK_AFTER_MS) {
                timedOut('no usable submit button');
                return;
            }
            if (geminiAttempts === 0) {
                geminiAttempts = 1;
                geminiLastAttemptAt = Date.now();
                console.log(TAG, 'no usable submit button found, pressing Enter');
                pressEnter(editor);
                return;
            }
            if (Date.now() - geminiLastAttemptAt >= 1500) {
                if (geminiAttempts >= 3) timedOut('send had no effect');
                else {
                    geminiAttempts += 1;
                    geminiLastAttemptAt = Date.now();
                    pressEnter(editor);
                }
            }
            return;
        }

        if (!geminiButtonSeenAt) geminiButtonSeenAt = Date.now();

        if (geminiAttempts === 0) {
            // 按钮刚渲染出来的那一帧 Angular 可能还没挂上 click 处理器，等一拍再点
            if (Date.now() - geminiButtonSeenAt < 800) return;
            clickGeminiButton(button);
            return;
        }

        // 点过但输入框还有内容：可能是点击丢了，重试；最多 3 次
        if (Date.now() - geminiLastAttemptAt < 1500) return;
        if (geminiAttempts >= 3) {
            timedOut('send click had no effect');
            return;
        }
        clickGeminiButton(button);
    }

    function tick() {
        if (submitted) return;
        if (IS_GEMINI) tickGemini();
        else tickChatGPT();
    }

    // Gemini 要等到开始回复才把 /app 换成 /app/<conversationId>，并把 q/prompt
    // 原样带回来。拦截 history 写入，在路由落地后立刻清掉，刷新时就不会重发
    if (IS_GEMINI) {
        for (const method of ['pushState', 'replaceState']) {
            const original = history[method];
            if (typeof original !== 'function') continue;
            history[method] = function () {
                const result = original.apply(this, arguments);
                if (submitted) stripPromptParams();
                return result;
            };
        }
    }

    timer = setInterval(tick, POLL_INTERVAL_MS);
    tick();
})();
