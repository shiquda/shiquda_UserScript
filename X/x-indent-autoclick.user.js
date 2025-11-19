// ==UserScript==
// @name         X Indent Autoclick
// @namespace    http://tampermonkey.net/
// @version      0.0.1
// @description  Auto-confirm likes/retweets on X (Twitter), automatically exits after clicking
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
    // Find and click confirmation button
    function clickAndClose() {
        // Find different buttons based on current page type
        let targetBtn;
        if (window.location.href.includes('/intent/post')) {
            // If it's a post page, find the tweet button
            targetBtn = document.querySelector('[data-testid="tweetButton"]');
        } else {
            // For other pages, find the confirmation button
            targetBtn = document.querySelector('[data-testid="confirmationSheetConfirm"]');
        }

        if (targetBtn) {
            // Click the target button
            targetBtn.click();
            // Close page after 3 seconds
            setTimeout(() => {
                window.close();
            }, 3000);
        } else {
            // If button not found, continue waiting
            setTimeout(clickAndClose, 500);
        }
    }

    // Start execution
    clickAndClose();
})();
