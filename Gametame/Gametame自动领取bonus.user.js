// ==UserScript==
// @name         Gametame Auto Claim Bonus
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1
// @description  Gametame auto claim bonus, works on homepage or bonus zone page
// @author       shiquda
// @match        https://gametame.com/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const url = window.location.href
    if (url.indexOf('https://gametame.com/earn') !== -1) {
        window.open('https://gametame.com/bonus-zone/', 'bonus-zone', 'height=100,width=200,resize=yes,scrollbars=yes')
    }
    else if (url == 'https://gametame.com/bonus-zone/') {
        countDownHandler.onDailyRewardButtonClick()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(1) > div > div > div.col-md-3 > button").click()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(2) > div > div > div.col-md-3 > button").click()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(3) > div > div > div.col-md-3 > button").click()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(4) > div > div > div.col-md-3 > button").click()
        document.querySelector("#steam-name-button > button").click()
        setTimeout(function refresh() {
            document.getElementById('refresh').click()
        }
            , 3000)
        setTimeout(function closeWindow() { window.close() }, 4000)
    }
})();
