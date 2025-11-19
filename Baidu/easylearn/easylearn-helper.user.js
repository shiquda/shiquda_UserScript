// ==UserScript==
// @name         Baidu Education Answer Viewer
// @version      0.1.0
// @description  View answers directly on Baidu Education, eliminating tedious clicks
// @author       shiquda
// @match        https://easylearn.baidu.com/edu-page/tiangong/questiondetail*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    let intervalId; // Define intervalId variable in global scope

    intervalId = setInterval(() => {
        if (document.querySelector('.mask')) {
            removeMasks();
            clearInterval(intervalId); // Stop interval after detecting element
        }
        if (document.querySelector('.kaixue-dialog-close')) {
            document.querySelector('.kaixue-dialog-close').click();
        }
        if (document.querySelector('.close')) {
            document.querySelector('.close').click();
        }
        console.log('waiting...');
    }, 200);

    function removeMasks() {
        document.querySelectorAll('.mask').forEach((e) => {
            e.remove();
        });
    }
})();
