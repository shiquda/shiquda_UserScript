// ==UserScript==
// @name         keylol 板块自动按最新发布排序
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.2.4
// @description  keylol 板块自动按最新发布排序脚本
// @author       shiquda
// @include      /https://keylol.com/f\d+\-\d+
// @license      MIT
// ==/UserScript==
(function () {
    'use strict';

    // Your code here...
    var $url = window.location.href
    var fid = Number($url.slice(20, 23))
    window.location.href = 'https://keylol.com/forum.php?mod=forumdisplay&fid=' + fid + '&filter=author&orderby=dateline'
})()
