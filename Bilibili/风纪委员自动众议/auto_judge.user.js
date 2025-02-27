// ==UserScript==
// @name         自动点击开始众议按钮及后续操作
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1
// @description  自动点击开始众议按钮及后续操作
// @author       shiquda
// @match        https://www.bilibili.com/judgement/index
// @match        https://www.bilibili.com/judgement/case-detail/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // 添加随机延迟函数
    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 检查是否在开始众议页面
    if (window.location.href === 'https://www.bilibili.com/judgement/index') {
        setTimeout(function () {
            var buttons = document.querySelectorAll('.btn-action');
            for (var j = 0; j < buttons.length; j++) {
                var buttonText = buttons[j].innerText.trim();
                if (buttonText === '开始众议') {
                    buttons[j].click();
                    break;
                }
            }
        }, 2000);
    }
    // 检查是否在案件详情页面
    else if (window.location.href.startsWith('https://www.bilibili.com/judgement/case-detail/')) {
        setTimeout(() => {
            autoClick2()
        }, 2000);
    }

    function autoClick2() {
        var suitableButton = null;
        var goodButton = null;
        var cannotWatchButton = null;
        var submitButton = null;

        var buttons = document.querySelectorAll('.btn-vote');
        for (var i = 0; i < buttons.length; i++) {
            var buttonText = buttons[i].innerText.trim();
            if (buttonText === '合适') {
                suitableButton = buttons[i];
            } else if (buttonText === '好') {
                goodButton = buttons[i];
            } else if (buttonText === '不会观看') {
                cannotWatchButton = buttons[i];
            } else if (buttonText === '确认提交') {
                submitButton = buttons[i];
            }
        }

        if (suitableButton || goodButton) {
            setTimeout(function () {
                if (suitableButton) {
                    suitableButton.click();
                } else {
                    goodButton.click();
                }
            }, 2000);
        }

        if (cannotWatchButton) {
            setTimeout(function () {
                cannotWatchButton.click();
            }, 4000);
        }

        if (submitButton) {
            setTimeout(function () {
                submitButton.click();
            }, 6000);
        }

        setTimeout(function () {
            // 点击"开始下一个按钮"
            var nextButton = document.querySelector('.v-btn.start-next-button');
            if (nextButton) {
                nextButton.click();
                setTimeout(() => {
                    autoClick2();
                }, 3000);
            }
        }, 8000);
    }


})();
