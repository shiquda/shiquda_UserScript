// ==UserScript==
// @name         X Indent Autoclick | 推特自动确认点赞/转贴
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Click and close 推特自动确认点赞/转贴，点击后自动退出（撸毛辅助）
// @author       shiquda
// @match        https://x.com/intent/*
// @match        https://twitter.com/intent/*
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=x.com
// @grant        none
// @license      AGPL-3.0
// ==/UserScript==
(function () {
    'use strict';
    // 查找确认按钮并点击
    function clickAndClose() {
        // 查找确认按钮
        const confirmBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        if (confirmBtn) {
            // 点击确认按钮
            confirmBtn.click();
            // 3秒后关闭页面
            setTimeout(() => {
                window.close();
            }, 3000);
        } else {
            // 如果没有找到按钮，继续循环等待
            setTimeout(clickAndClose, 500);
        }
    }

    // 开始执行
    clickAndClose();
})();
