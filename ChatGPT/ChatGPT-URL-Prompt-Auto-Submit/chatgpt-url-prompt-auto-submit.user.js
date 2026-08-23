// ==UserScript==
// @name         ChatGPT URL Prompt Auto Submit
// @namespace    https://github.com/shiquda/shiquda_Userscript
// @version      1.0.0
// @description  Automatically clicks the submit button when ChatGPT URL contains ?q= or ?prompt= parameters.
// @author       shiquda
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // 必须尽早读取，因为 ChatGPT 加载过程中可能会修改 URL
    const initialUrl = new URL(window.location.href);

    const hasPromptParam =
        initialUrl.searchParams.has('q') ||
        initialUrl.searchParams.has('prompt');

    if (!hasPromptParam) return;

    let submitted = false;

    function trySubmit() {
        if (submitted) return;

        const button = document.querySelector('#composer-submit-button');

        if (!button) return;

        // 等按钮真正可用
        if (
            button.disabled ||
            button.getAttribute('aria-disabled') === 'true'
        ) {
            return;
        }

        submitted = true;

        console.log('[ChatGPT Auto Submit] submitting...');

        button.click();

        observer.disconnect();
    }

    // ChatGPT 是 SPA，需要监听 DOM 渲染
    const observer = new MutationObserver(() => {
        trySubmit();
    });

    function start() {
        if (!document.documentElement) {
            requestAnimationFrame(start);
            return;
        }

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled', 'aria-disabled']
        });

        trySubmit();

        // 最多监听 30 秒，避免一直挂着
        setTimeout(() => {
            observer.disconnect();
        }, 30_000);
    }

    start();
})();
