// ==UserScript==
// @name         LinuxDo 默认使用 Nested 模式
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @version      0.3.2
// @description  自动把 /t/topic/ 改为 /n/topic/，并移除 /n/topic/ 下的数字分支路径（无刷新，尊重 flat=1 手动切换）
// @author       shiquda
// @match        https://linux.do/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==
(function () {
    'use strict';

    const FROM = '/t/topic/';
    const TO   = '/n/topic/';
    const BRANCH_PATH = /\/n\/topic\/([^/?#]+)\/\d+(?=\/?[?#]|\/?$)/;

    // 检查 URL 是否带有 flat=1(用户手动切回 flat 模式的标记)
    const hasFlatFlag = (url) => {
        if (typeof url !== 'string') return false;
        try {
            return new URL(url, location.origin).searchParams.get('flat') === '1';
        } catch {
            return /[?&]flat=1(?:&|$)/.test(url);
        }
    };

    const rewrite = (url) => {
        if (typeof url !== 'string') return url;
        let nextUrl = url;
        if (nextUrl.includes(FROM) && !hasFlatFlag(nextUrl)) {
            nextUrl = nextUrl.replace(FROM, TO);
        }
        return nextUrl.replace(BRANCH_PATH, (_, topicId) => `${TO}${topicId}`);
    };

    // 1. 首次进入
    const nextHref = rewrite(location.href);
    if (nextHref !== location.href) {
        location.replace(nextHref);
        return;
    }

    // 2. Hook history API
    const _push = history.pushState;
    history.pushState = function (state, title, url) {
        return _push.call(this, state, title, rewrite(url));
    };
    const _replace = history.replaceState;
    history.replaceState = function (state, title, url) {
        return _replace.call(this, state, title, rewrite(url));
    };

    // 3. 链接点击拦截
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented) return;
        const a = e.target && e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        const nextHref = rewrite(href);
        if (nextHref !== href) {
            a.setAttribute('href', nextHref);
        }
    }, true);
})();
