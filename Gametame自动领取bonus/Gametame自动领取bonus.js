// ==UserScript==
// @name         Gametame自动领取bonus
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1
// @description  gametame自动领bonus，在主页面或者bonus zone页面生效
// @author       shiquda
// @match        https://gametame.com/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    // Your code here...
    const url = window.location.href
    if (url.indexOf('https://gametame.com/earn') !==-1){
        window.open('https://gametame.com/bonus-zone/','bonus-zone','height=100,width=200,resize=yes,scrollbars=yes')
        var fromMain = true
        }
    else if(url == 'https://gametame.com/bonus-zone/'){
        countDownHandler.onDailyRewardButtonClick()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(1) > div > div > div.col-md-3 > button").click()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(2) > div > div > div.col-md-3 > button").click()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(3) > div > div > div.col-md-3 > button").click()
        document.querySelector("#content > div > div > div:nth-child(1) > div > div > div.panel-body > div:nth-child(4) > div > div > div.col-md-3 > button").click()
        document.querySelector("#steam-name-button > button").click()
        setTimeout(function refresh(){
            document.getElementById('refresh').click()}
            ,3000)
        setTimeout(function closeWindow(){window.close()},4000)
    }
})();
