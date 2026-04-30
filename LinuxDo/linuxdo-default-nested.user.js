// ==UserScript==
// @name         LinuxDo 默认使用 Nested 模式
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @version      0.3.3
// @description  自动把 /t/topic/ 改为 /n/topic/，并移除 /n/topic/ 下的数字分支路径（无刷新，尊重 flat=1 手动切换）
// @author       shiquda
// @match        https://linux.do/*
// @grant        none
// @run-at       document-start
// @license      MIT
// ==/UserScript==
(function () {
    'use strict';

    const TO   = '/n/topic/';
    const TOPIC_PATH = /\/([tn])\/topic\/([^/?#]+)(?:\/\d+)?(?=\/?[?#]|\/?$)/;

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
        if (url == null) return url;
        const text = typeof url === 'string' ? url : String(url);
        const nextUrl = text.replace(TOPIC_PATH, (match, mode, topicId) => {
            if (mode === 't' && hasFlatFlag(text)) return match;
            return `${TO}${topicId}`;
        });
        return nextUrl === text ? url : nextUrl;
    };

    const rewriteCurrentLocation = () => {
        const nextHref = rewrite(location.href);
        if (nextHref !== location.href) {
            location.replace(nextHref);
        }
    };

    const scheduleLocationCheck = () => {
        setTimeout(rewriteCurrentLocation, 0);
        setTimeout(rewriteCurrentLocation, 100);
        setTimeout(rewriteCurrentLocation, 500);
    };

    const rewriteAnchor = (a) => {
        const href = a.getAttribute('href');
        const nextHref = rewrite(href);
        if (nextHref !== href) {
            a.setAttribute('href', nextHref);
        }
    };

    const rewriteAnchors = (root) => {
        if (!root) return;
        if (root.nodeType === Node.ELEMENT_NODE) {
            if (root.matches && root.matches('a[href]')) {
                rewriteAnchor(root);
            }
            if (root.querySelectorAll) {
                root.querySelectorAll('a[href]').forEach(rewriteAnchor);
            }
        } else if (root.querySelectorAll) {
            root.querySelectorAll('a[href]').forEach(rewriteAnchor);
        }
    };

    // 1. 首次进入
    rewriteCurrentLocation();

    // 2. Hook history API
    const _push = history.pushState;
    history.pushState = function (state, title, url) {
        return _push.call(this, state, title, rewrite(url));
    };
    const _replace = history.replaceState;
    history.replaceState = function (state, title, url) {
        return _replace.call(this, state, title, rewrite(url));
    };

    // 3. 提前规范化动态渲染出来的链接，避免站内路由读取到旧 href
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
                rewriteAnchor(mutation.target);
                return;
            }
            mutation.addedNodes.forEach(rewriteAnchors);
        });
    });

    const startObserver = () => {
        rewriteAnchors(document);
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['href'],
        });
    };

    if (document.documentElement) {
        startObserver();
    } else {
        document.addEventListener('DOMContentLoaded', startObserver, { once: true });
    }

    // 4. 链接点击拦截
    document.addEventListener('click', (e) => {
        if (e.defaultPrevented) return;
        const a = e.target && e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        rewriteAnchor(a);
        scheduleLocationCheck();
    }, true);

    window.addEventListener('popstate', scheduleLocationCheck);
    window.addEventListener('hashchange', scheduleLocationCheck);
})();
