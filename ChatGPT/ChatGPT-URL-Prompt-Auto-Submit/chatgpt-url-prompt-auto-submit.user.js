// ==UserScript==
// @name         ChatGPT URL Prompt Auto Submit
// @namespace    https://github.com/shiquda/shiquda_Userscript
// @version      1.1.0
// @description  Automatically submits the prefilled prompt when ChatGPT URL contains ?q= or ?prompt= parameters. Supports both the classic composer and the new ProseMirror composer.
// @author       shiquda
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const TAG = '[ChatGPT Auto Submit]';
    const POLL_INTERVAL_MS = 200;
    // 一直等不到可用发送按钮时的总时限
    const GIVE_UP_MS = 30_000;
    // 输入框已有内容，但迟迟找不到发送按钮（UI 又改版）时，改用回车提交
    const ENTER_FALLBACK_AFTER_MS = 5_000;

    // 发送按钮的本地化名称。新版 UI 的发送按钮已经没有 id/data-testid，只剩 aria-label
    const SEND_LABEL_RE = /^(send|发送|傳送|送信|보내기|enviar|envoyer|senden|invia|отправить|verzenden)/i;
    // composer 主操作位上还可能是语音/听写按钮，绝不能点
    const NON_SEND_LABEL_RE = /voice|dictation|microphone|语音|語音|听写|聽寫|音声|マイク|음성|voz|voix|stimme|sprache|голос/i;

    // ChatGPT 载入后会把 ?q= / ?prompt= 从地址栏抹掉（改写为 ?model=...），
    // 因此优先读当前 URL，读不到再回退到导航记录里的原始 URL（脚本被延迟注入时用得上）
    function urlHasPromptParam() {
        try {
            const params = new URL(window.location.href).searchParams;
            if (params.has('q') || params.has('prompt')) return true;
        } catch (e) { /* ignore */ }

        try {
            const entry = performance.getEntriesByType('navigation')[0];
            if (entry && entry.name) {
                const params = new URL(entry.name).searchParams;
                if (params.has('q') || params.has('prompt')) return true;
            }
        } catch (e) { /* ignore */ }

        return false;
    }

    if (!urlHasPromptParam()) return;

    // 旧版 UI：textarea#prompt-textarea；新版 UI：ProseMirror contenteditable
    function getEditor() {
        return document.querySelector('textarea#prompt-textarea')
            || document.querySelector('#prompt-textarea')
            || document.querySelector('form[data-chatgpt-composer] div.ProseMirror[contenteditable="true"]')
            || document.querySelector('div.ProseMirror[contenteditable="true"]')
            || document.querySelector('[contenteditable="true"][role="textbox"]');
    }

    function getComposerRoot(editor) {
        if (editor && editor.closest('form')) return editor.closest('form');
        return document.querySelector('form[data-chatgpt-composer]');
    }

    function getPromptText(editor) {
        if (!editor) return '';
        const raw = typeof editor.value === 'string' ? editor.value : (editor.textContent || '');
        // ProseMirror 空段落里可能残留零宽字符
        return raw.replace(/[\u200b\u200c\u200d\ufeff]/g, '').trim();
    }

    function isUsable(button) {
        if (!button) return false;
        if (button.disabled) return false;
        if (button.getAttribute('aria-disabled') === 'true') return false;
        return button.getClientRects().length > 0;
    }

    function findSubmitButton(editor) {
        // 1) 明确标了 id/data-testid 的发送按钮（旧版 UI 曾用 #composer-submit-button）
        const explicit = document.querySelector('#composer-submit-button')
            || document.querySelector('button[data-testid="send-button"]')
            || document.querySelector('button[data-testid="composer-send-button"]');
        if (isUsable(explicit)) return explicit;

        const root = getComposerRoot(editor);
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

    let submitted = false;
    let timer = null;
    let textSeenAt = 0;
    const startedAt = Date.now();

    function stop(reason) {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
        if (reason) console.log(TAG, reason);
    }

    function tick() {
        if (submitted) return;

        const editor = getEditor();
        if (!getPromptText(editor)) {
            // ?q= 的预填还没落到输入框，等 ChatGPT 自己填好再提交
            if (Date.now() - startedAt > GIVE_UP_MS) stop('timeout: composer stayed empty, nothing submitted');
            return;
        }

        if (!textSeenAt) textSeenAt = Date.now();

        const button = findSubmitButton(editor);
        if (button) {
            submitted = true;
            console.log(TAG, 'clicking submit button', button);
            button.click();
            stop();
            return;
        }

        if (Date.now() - textSeenAt >= ENTER_FALLBACK_AFTER_MS) {
            submitted = true;
            console.log(TAG, 'no usable submit button found, pressing Enter');
            pressEnter(editor);
            stop();
        }
    }

    timer = setInterval(tick, POLL_INTERVAL_MS);
    tick();
})();
