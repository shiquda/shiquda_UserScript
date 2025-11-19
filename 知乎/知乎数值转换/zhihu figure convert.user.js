// ==UserScript==
// @name         Zhihu Number Converter
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1
// @description  Convert Zhihu numbers for large data, e.g. view counts can display as xx.xxK or xx.xxM
// @author       shiquda
// @match        https://www.zhihu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=zhihu.com
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const figures = document.querySelectorAll(".NumberBoard-itemValue")
    if (!figures) return
    for (var i = 0; i < figures.length; i++) {
        figures[i].textContent = `${formatLargeNumber(figures[i].title, 2)}`
    }

    function formatLargeNumber(num, fig) {
        const len = num.length
        if (len < 4) return num
        else if (len < 7) return ((num / 1e3).toFixed(fig) + "K")
        else return ((num / 1e6).toFixed(2) + "M")
    }
})();