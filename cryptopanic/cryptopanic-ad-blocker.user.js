// ==UserScript==
// @name         CryptoPanic Ad Blocker
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=cryptopanic.com
// @version      0.1.0
// @description  Remove the ads of CryptoPanic
// @author       shiquda
// @match        https://cryptopanic.com/*
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const css = `
        div.left-nav > a:nth-child(7),
        .ad-navigation,
        {
            display: none !important;
        }
    `;

    // 创建并插入style标签
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
})();