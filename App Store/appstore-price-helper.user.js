// ==UserScript==
// @name                    App Store Price Helper (AppStorePrice.org)
// @name:zh-CN              App Store 比价助手 (AppStorePrice.org)
// @namespace               https://github.com/shiquda/shiquda_UserScript
// @version                 0.2.3
// @description             View global price comparison, currency conversions, and lowest price regions from AppStorePrice.org in a floating widget on the App Store (iOS & Mac), with one-click app submission for unrecorded apps.
// @description:zh-CN       在 App Store (iOS / Mac) 网页版以右侧优雅悬浮窗查看 AppStorePrice.org 全球价格对比与最低价区，支持套餐切换与货币折算；未收录时支持一键请求收录。
// @author                  shiquda
// @supportURL              https://github.com/shiquda/shiquda_UserScript/issues
// @match                   *://apps.apple.com/*
// @match                   https://apps.apple.com/*
// @include                 *://apps.apple.com/*
// @include                 https://apps.apple.com/*
// @grant                   GM_xmlhttpRequest
// @grant                   GM.xmlHttpRequest
// @connect                 appstoreprice.org
// @license                 MIT
// @run-at                  document-idle
// ==/UserScript==

(() => {
    'use strict';

    const ROOT_ID = 'asp-floating-root';
    const STYLE_ID = 'asp-floating-styles';
    const API_BASE = 'https://appstoreprice.org';
    const SECRET_KEY = 'asp_2026_anti_scraper';

    // 内存缓存已查询的数据
    const detailCache = new Map();

    // 国家/地区代码映射国旗 Emoji
    const REGION_FLAGS = {
        'AE': '🇦🇪', 'AR': '🇦🇷', 'AU': '🇦🇺', 'BR': '🇧🇷', 'CA': '🇨🇦',
        'CH': '🇨🇭', 'CL': '🇨🇱', 'CN': '🇨🇳', 'CO': '🇨🇴', 'DE': '🇩🇪',
        'DK': '🇩🇰', 'EG': '🇪🇬', 'ES': '🇪🇸', 'FR': '🇫🇷', 'GB': '🇬🇧',
        'HK': '🇭🇰', 'ID': '🇮🇩', 'IL': '🇮🇱', 'IN': '🇮🇳', 'IT': '🇮🇹',
        'JP': '🇯🇵', 'KR': '🇰🇷', 'KZ': '🇰🇿', 'MX': '🇲🇽', 'MY': '🇲🇾',
        'NG': '🇳🇬', 'NL': '🇳🇱', 'NO': '🇳🇴', 'NZ': '🇳🇿', 'PH': '🇵🇭',
        'PK': '🇵🇰', 'PL': '🇵🇱', 'RU': '🇷🇺', 'SA': '🇸🇦', 'SE': '🇸🇪',
        'SG': '🇸🇬', 'TH': '🇹🇭', 'TR': '🇹🇷', 'TW': '🇹🇼', 'UA': '🇺🇦',
        'US': '🇺🇸', 'VN': '🇻🇳', 'ZA': '🇿🇦'
    };
    /**
     * 生成 Apple SF Symbols 风格的平滑矢量 Chevron 下拉图标
     */
    function renderChevronSvg(extraClass = '') {
        return `<svg class="asp-chevron-icon ${extraClass}" width="11" height="11" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }


    /**
     * 计算 FNV-1a 32-bit 哈希签名
     */
    function getSignatureHeaders(pathname) {
        const t = Date.now();
        const str = `${t}:${pathname}:${SECRET_KEY}`;
        let hash = 0x811c9dc5;
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = (0x1000193 * hash) >>> 0;
        }
        return {
            'X-Timestamp': String(t),
            'X-Signature': hash.toString(16)
        };
    }

    /**
     * 统一跨域网络请求
     */
    function request({ url, method = 'GET', headers = {}, data = null }) {
        return new Promise((resolve, reject) => {
            const gmRequest = (typeof GM_xmlhttpRequest === 'function')
                ? GM_xmlhttpRequest
                : (typeof GM !== 'undefined' && typeof GM.xmlHttpRequest === 'function')
                    ? GM.xmlHttpRequest
                    : (typeof window !== 'undefined' && typeof window.GM_xmlhttpRequest === 'function')
                        ? window.GM_xmlhttpRequest
                        : null;
            if (gmRequest) {
                gmRequest({
                    url,
                    method,
                    headers,
                    data: typeof data === 'object' && data !== null ? JSON.stringify(data) : data,
                    onload: (res) => {
                        let json = null;
                        try {
                            json = JSON.parse(res.responseText);
                        } catch (e) {
                            json = res.responseText;
                        }
                        resolve({
                            ok: res.status >= 200 && res.status < 300,
                            status: res.status,
                            statusText: res.statusText,
                            data: json
                        });
                    },
                    onerror: (err) => reject(new Error(err.error || '网络请求失败')),
                    ontimeout: () => reject(new Error('请求超时'))
                });
            } else {
                fetch(url, {
                    method,
                    headers,
                    body: typeof data === 'object' && data !== null ? JSON.stringify(data) : data
                }).then(async (res) => {
                    let json = null;
                    try {
                        json = await res.json();
                    } catch (e) {
                        json = await res.text();
                    }
                    resolve({
                        ok: res.ok,
                        status: res.status,
                        statusText: res.statusText,
                        data: json
                    });
                }).catch(reject);
            }
        });
    }

    /**
     * 获取指定 App 的比价数据
     */
    async function fetchAppDetail(appId) {
        if (detailCache.has(appId)) {
            return detailCache.get(appId);
        }

        const pathname = '/api/detail';
        const url = `${API_BASE}${pathname}?id=${encodeURIComponent(appId)}`;
        const headers = getSignatureHeaders(pathname);

        try {
            const res = await request({ url, method: 'GET', headers });
            if (res.status === 404) {
                const result = { recorded: false, appId };
                detailCache.set(appId, result);
                return result;
            }
            if (res.ok && res.data) {
                if (res.data.appStoreId && String(res.data.appStoreId) !== String(appId)) {
                    return { recorded: false, error: 'App ID 不匹配' };
                }
                const result = { recorded: true, appId, detail: res.data };
                detailCache.set(appId, result);
                return result;
            }
            return { recorded: false, error: res.data?.error || `HTTP ${res.status}` };
        } catch (err) {
            return { recorded: false, error: err.message };
        }
    }

    /**
     * 提交收录请求
     */
    async function submitAppRequest(appId) {
        const url = `${API_BASE}/api/app-request`;
        const headers = {
            'Content-Type': 'application/json'
        };
        const res = await request({
            url,
            method: 'POST',
            headers,
            data: { input: String(appId) }
        });
        return res;
    }

    /**
     * 从当前页面 URL 中解析 App ID（严格限制在 /app/ 应用详情页，排除 developer 等页面）
     */
    function getAppId() {
        const pathname = window.location.pathname;
        if (!pathname.includes('/app/')) return null;

        const match = pathname.match(/\/id(\d{6,})/i);
        if (match) return match[1];

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical && canonical.href && canonical.href.includes('/app/')) {
            const cMatch = canonical.href.match(/\/id(\d{6,})/i);
            if (cMatch) return cMatch[1];
        }
        return null;
    }

    /**
     * 从 URL 解析当前商店国家代码 (例如 CN, US, JP, HK 等)
     */
    function getCurrentStoreRegion() {
        const match = window.location.pathname.match(/^\/([a-zA-Z]{2})\/app\//i);
        if (match) return match[1].toUpperCase();
        return 'CN';
    }

    /**
     * 注入全局样式
     */
    function injectStyles() {
        if (document.getElementById(STYLE_ID)) return;

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            #asp-floating-root {
                position: fixed;
                right: 24px;
                bottom: 28px;
                z-index: 2147483647;
                font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "PingFang SC", "Helvetica Neue", Arial, sans-serif;
                font-size: 13px;
                line-height: 1.4;
                color: #1d1d1f;
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                pointer-events: none;
                --asp-primary: #0071e3;
                --asp-primary-hover: #0077ed;
                --asp-green: #34c759;
                --asp-green-bg: rgba(52, 199, 89, 0.12);
                --asp-pill-bg: rgba(255, 255, 255, 0.92);
                --asp-pill-border: rgba(0, 0, 0, 0.1);
                --asp-panel-bg: rgba(255, 255, 255, 0.96);
                --asp-panel-border: rgba(0, 0, 0, 0.12);
                --asp-panel-shadow: 0 16px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.06);
                --asp-subtext: #86868b;
                --asp-hover-row: rgba(0, 0, 0, 0.03);
                --asp-divider: rgba(0, 0, 0, 0.06);
                --asp-btn-bg: rgba(0, 0, 0, 0.05);
            }

            @media (prefers-color-scheme: dark) {
                #asp-floating-root {
                    color: #f5f5f7;
                    --asp-primary: #2997ff;
                    --asp-primary-hover: #3ca2ff;
                    --asp-green: #30d158;
                    --asp-green-bg: rgba(48, 209, 88, 0.16);
                    --asp-pill-bg: rgba(32, 32, 36, 0.92);
                    --asp-pill-border: rgba(255, 255, 255, 0.15);
                    --asp-panel-bg: rgba(28, 28, 30, 0.96);
                    --asp-panel-border: rgba(255, 255, 255, 0.15);
                    --asp-panel-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 6px 16px rgba(0, 0, 0, 0.3);
                    --asp-subtext: #98989d;
                    --asp-hover-row: rgba(255, 255, 255, 0.05);
                    --asp-divider: rgba(255, 255, 255, 0.08);
                    --asp-btn-bg: rgba(255, 255, 255, 0.08);
                }
            }

            /* 右下角悬浮胶囊浮标 */
            .asp-float-pill {
                pointer-events: auto;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                border-radius: 999px;
                background: var(--asp-pill-bg);
                border: 1px solid var(--asp-pill-border);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
                cursor: pointer;
                user-select: none;
                font-weight: 500;
                transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .asp-float-pill:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
                border-color: var(--asp-primary);
            }

            .asp-pill-tag {
                font-size: 11px;
                font-weight: 600;
                padding: 2px 7px;
                border-radius: 999px;
                background: var(--asp-green-bg);
                color: var(--asp-green);
                letter-spacing: 0.2px;
            }

            .asp-chevron-icon {
                transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
                display: inline-block;
                vertical-align: middle;
            }

            .asp-chevron-icon.open {
                transform: rotate(180deg);
            }

            /* 展开时的抽屉悬浮卡片 */
            .asp-drawer-panel {
                pointer-events: auto;
                width: 420px;
                max-width: calc(100vw - 36px);
                max-height: calc(100vh - 120px);
                background: var(--asp-panel-bg);
                border: 1px solid var(--asp-panel-border);
                border-radius: 20px;
                box-shadow: var(--asp-panel-shadow);
                backdrop-filter: blur(30px);
                -webkit-backdrop-filter: blur(30px);
                padding: 18px 20px;
                margin-bottom: 12px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                animation: asp-pop-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }

            @keyframes asp-pop-in {
                from { opacity: 0; transform: translateY(12px) scale(0.96); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            .asp-panel-head {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding-bottom: 12px;
                border-bottom: 1px solid var(--asp-divider);
                margin-bottom: 12px;
            }

            .asp-panel-title {
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .asp-head-actions {
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .asp-link-out {
                color: var(--asp-primary);
                font-size: 12px;
                font-weight: 500;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 3px;
            }

            .asp-link-out:hover {
                text-decoration: underline;
            }

            .asp-close-btn {
                background: var(--asp-btn-bg);
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 13px;
                color: var(--asp-subtext);
                cursor: pointer;
                transition: all 0.15s ease;
            }

            .asp-close-btn:hover {
                background: rgba(0, 0, 0, 0.12);
                color: var(--asp-primary);
            }
            /* 套餐分段切换选项卡与下拉展开容器 */
            .asp-tabs-container {
                position: relative;
                margin-bottom: 12px;
            }

            .asp-tabs-bar {
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .asp-tabs-row {
                flex: 1;
                min-width: 0;
                display: flex;
                gap: 6px;
                overflow-x: auto;
                padding-bottom: 4px;
                scrollbar-width: thin;
            }

            .asp-tab-dropdown-btn {
                flex-shrink: 0;
                height: 28px;
                padding: 0 10px;
                border-radius: 999px;
                border: 1px solid var(--asp-pill-border);
                background: var(--asp-btn-bg);
                color: var(--asp-subtext);
                display: inline-flex;
                align-items: center;
                gap: 4px;
                font-size: 11px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                outline: none;
                user-select: none;
            }

            .asp-tab-dropdown-btn:hover {
                color: var(--asp-primary);
                background: rgba(0, 113, 227, 0.08);
                border-color: var(--asp-primary);
                transform: translateY(-1px);
            }

            .asp-tab-dropdown-btn.active {
                background: var(--asp-primary);
                color: #ffffff;
                border-color: var(--asp-primary);
            }

            .asp-tab-dropdown-btn.active .asp-chevron-icon {
                transform: rotate(180deg);
            }

            .asp-tab-pill {
                border: 1px solid var(--asp-pill-border);
                background: var(--asp-btn-bg);
                color: var(--asp-subtext);
                padding: 5px 12px;
                border-radius: 999px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.15s ease;
                outline: none;
            }

            .asp-tab-pill:hover {
                color: var(--asp-primary);
                border-color: var(--asp-primary);
            }

            .asp-tab-pill.active {
                background: var(--asp-primary);
                color: #ffffff;
                border-color: var(--asp-primary);
            }

            /* 纵向展开的套餐选择菜单 */
            .asp-plan-dropdown {
                position: absolute;
                top: calc(100% + 4px);
                left: 0;
                right: 0;
                background: var(--asp-panel-bg);
                border: 1px solid var(--asp-panel-border);
                border-radius: 14px;
                box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16), 0 2px 8px rgba(0, 0, 0, 0.06);
                backdrop-filter: blur(25px);
                -webkit-backdrop-filter: blur(25px);
                z-index: 20;
                max-height: 220px;
                overflow-y: auto;
                padding: 6px;
                box-sizing: border-box;
                animation: asp-pop-in 0.18s cubic-bezier(0.16, 1, 0.3, 1);
            }

            .asp-plan-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 500;
                color: var(--asp-subtext);
                cursor: pointer;
                transition: all 0.15s ease;
                user-select: none;
            }

            .asp-plan-item:hover {
                background: var(--asp-hover-row);
                color: var(--asp-primary);
            }

            .asp-plan-item.selected {
                background: rgba(0, 113, 227, 0.1);
                color: var(--asp-primary);
                font-weight: 600;
            }

            .asp-plan-item-check {
                font-size: 13px;
                color: var(--asp-primary);
                font-weight: bold;
            }
            /* 最低价横幅 */
            .asp-champion-banner {
                background: var(--asp-green-bg);
                border: 1px solid rgba(52, 199, 89, 0.25);
                border-radius: 12px;
                padding: 10px 14px;
                margin-bottom: 12px;
            }

            .asp-champion-title {
                font-size: 13px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .asp-champion-val {
                color: var(--asp-green);
                font-size: 15px;
                font-weight: 700;
            }

            .asp-champion-diff {
                font-size: 12px;
                color: var(--asp-subtext);
                margin-top: 3px;
            }

            /* 地区表格 */
            .asp-table-scroll {
                overflow-y: auto;
                max-height: 280px;
                scrollbar-width: thin;
            }

            .asp-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
            }

            .asp-table th {
                text-align: left;
                color: var(--asp-subtext);
                font-weight: 500;
                padding: 6px 8px;
                border-bottom: 1px solid var(--asp-divider);
                position: sticky;
                top: 0;
                background: var(--asp-panel-bg);
                z-index: 1;
            }

            .asp-table td {
                padding: 7px 8px;
                border-bottom: 1px solid var(--asp-divider);
                vertical-align: middle;
            }

            .asp-table tr:hover td {
                background: var(--asp-hover-row);
            }

            .asp-table tr.asp-row-lowest td {
                font-weight: 600;
                background: var(--asp-green-bg);
            }

            .asp-table tr.asp-row-current td {
                font-weight: 600;
                border-left: 2px solid var(--asp-primary);
            }

            .asp-flag-name {
                display: flex;
                align-items: center;
                gap: 5px;
                white-space: nowrap;
            }

            .asp-badge-current-tag {
                font-size: 10px;
                color: var(--asp-primary);
                background: rgba(0, 113, 227, 0.1);
                border-radius: 4px;
                padding: 1px 4px;
                margin-left: 3px;
            }

            .asp-toggle-more-btn {
                margin-top: 10px;
                width: 100%;
                padding: 7px 0;
                background: transparent;
                border: 1px dashed var(--asp-pill-border);
                border-radius: 8px;
                color: var(--asp-primary);
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                text-align: center;
                transition: background 0.15s ease;
            }

            .asp-toggle-more-btn:hover {
                background: var(--asp-btn-bg);
            }

            /* 未收录面板卡片 */
            .asp-unrecorded-box {
                padding: 8px 0;
            }

            .asp-unrecorded-tip {
                color: var(--asp-subtext);
                font-size: 13px;
                line-height: 1.5;
                margin-bottom: 14px;
            }

            .asp-btn-action-request {
                background: var(--asp-primary);
                color: #ffffff !important;
                border: none;
                border-radius: 999px;
                padding: 8px 18px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.15s ease;
                display: inline-flex;
                align-items: center;
                gap: 6px;
            }

            .asp-btn-action-request:hover {
                background: var(--asp-primary-hover);
                transform: translateY(-1px);
            }

            .asp-btn-action-request:disabled {
                opacity: 0.65;
                cursor: not-allowed;
                transform: none;
            }

            /* 微光旋转器 */
            .asp-spinner {
                display: inline-block;
                width: 12px;
                height: 12px;
                border: 2px solid var(--asp-primary);
                border-top-color: transparent;
                border-radius: 50%;
                animation: asp-spin 0.8s linear infinite;
            }

            @keyframes asp-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * 状态字典: appId -> state
     */
    const appStateMap = new Map();

    /**
     * 渲染右侧悬浮窗
     */
    function render({ appId, state }) {
        let root = document.getElementById(ROOT_ID);
        if (!root) {
            root = document.createElement('div');
            root.id = ROOT_ID;
            document.body.appendChild(root);
        }

        root.dataset.appId = appId;

        // 1. 加载中状态
        if (state.loading) {
            root.innerHTML = `
                <div class="asp-float-pill" style="cursor:default">
                    <span class="asp-spinner"></span>
                    <span>正在查询 AppStorePrice...</span>
                </div>
            `;
            return;
        }

        // 2. 未收录状态
        if (!state.recorded) {
            const isDrawerOpen = !!state.isOpen;
            let drawerHtml = '';
            if (isDrawerOpen) {
                drawerHtml = `
                    <div class="asp-drawer-panel">
                        <div class="asp-panel-head">
                            <div class="asp-panel-title">
                                <span>🌐</span>
                                <span>AppStorePrice 比价</span>
                            </div>
                            <div class="asp-head-actions">
                                <a href="${API_BASE}/zh/apps" target="_blank" class="asp-link-out">
                                    官网 ↗
                                </a>
                                <button class="asp-close-btn" id="asp-btn-close" title="收起">✕</button>
                            </div>
                        </div>
                        <div class="asp-unrecorded-box">
                            <div class="asp-unrecorded-tip">
                                该应用目前尚未被 AppStorePrice 收录。您可以一键提交收录请求，后台将自动进行抓取与价格分析！
                            </div>
                            <button class="asp-btn-action-request" id="asp-btn-request-sub">
                                一键请求收录 🚀
                            </button>
                            <div id="asp-request-feedback" style="display:none;margin-top:10px;font-size:12px;color:var(--asp-green);line-height:1.4;"></div>
                        </div>
                    </div>
                `;
            }

            root.innerHTML = `
                ${drawerHtml}
                <div class="asp-float-pill" id="asp-btn-pill-toggle">
                    <span>🌐</span>
                    <span>AppStorePrice 未收录</span>
                    ${renderChevronSvg(isDrawerOpen ? 'open' : '')}
                </div>
            `;

            // 交互绑定
            const pill = root.querySelector('#asp-btn-pill-toggle');
            if (pill) {
                pill.onclick = () => {
                    state.isOpen = !state.isOpen;
                    render({ appId, state });
                };
            }

            const closeBtn = root.querySelector('#asp-btn-close');
            if (closeBtn) {
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    state.isOpen = false;
                    render({ appId, state });
                };
            }

            const submitBtn = root.querySelector('#asp-btn-request-sub');
            const feedback = root.querySelector('#asp-request-feedback');
            if (submitBtn) {
                submitBtn.onclick = async (e) => {
                    e.stopPropagation();
                    submitBtn.disabled = true;
                    submitBtn.textContent = '正在提交...';

                    try {
                        const submitRes = await submitAppRequest(appId);
                        if (submitRes.ok) {
                            submitBtn.style.background = 'var(--asp-green)';
                            submitBtn.textContent = '✓ 已加入队列';
                            if (feedback) {
                                feedback.style.display = 'block';
                                feedback.style.color = 'var(--asp-green)';
                                feedback.textContent = submitRes.data?.message || '已成功提交收录请求，后台将自动抓取分析！';
                            }
                        } else {
                            submitBtn.disabled = false;
                            submitBtn.textContent = '重试请求';
                            if (feedback) {
                                feedback.style.display = 'block';
                                feedback.style.color = '#ff3b30';
                                feedback.textContent = submitRes.data?.error || '请求失败，请稍后重试';
                            }
                        }
                    } catch (err) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '重试请求';
                        if (feedback) {
                            feedback.style.display = 'block';
                            feedback.style.color = '#ff3b30';
                            feedback.textContent = err.message;
                        }
                    }
                };
            }
            return;
        }

        // 3. 已收录状态
        const detail = state.detail;
        const subscriptions = detail.subscriptions || [];

        // 套餐名称智能去重
        const seenNames = new Map();
        subscriptions.forEach((sub, idx) => {
            const base = sub.nameZh || sub.name || `套餐 ${idx + 1}`;
            let label = base;
            if (sub.productId && sub.productId.toLowerCase().includes('special')) {
                label = `${base} (特惠)`;
            } else if (seenNames.has(base)) {
                const count = seenNames.get(base) + 1;
                seenNames.set(base, count);
                label = `${base} (${count})`;
            } else {
                seenNames.set(base, 1);
            }
            sub._displayLabel = label;
        });

        let selectedIndex = state.selectedPlanIndex || 0;
        if (selectedIndex >= subscriptions.length) selectedIndex = 0;
        const currentPlan = subscriptions[selectedIndex];

        const currentPrices = (currentPlan?.prices || []).slice().sort((a, b) => {
            const pa = a.priceCny != null ? a.priceCny : 999999;
            const pb = b.priceCny != null ? b.priceCny : 999999;
            return pa - pb;
        });

        const lowest = currentPrices[0];
        const storeRegion = getCurrentStoreRegion();
        const currentStorePrice = currentPrices.find(p => p.region === storeRegion);

        let savePercent = 0;
        if (lowest && currentStorePrice && currentStorePrice.priceCny > 0 && lowest.priceCny < currentStorePrice.priceCny) {
            savePercent = Math.round((1 - lowest.priceCny / currentStorePrice.priceCny) * 100);
        }

        const isDrawerOpen = !!state.isOpen;
        const showAll = !!state.showAll;

        // 构建抽屉面板内容
        let drawerHtml = '';
        if (isDrawerOpen) {
            // 选项卡与纵向选择菜单
            let tabsHtml = '';
            if (subscriptions.length > 1) {
                const isDropdownOpen = !!state.isPlanDropdownOpen;
                const dropdownItemsHtml = isDropdownOpen ? `
                    <div class="asp-plan-dropdown" id="asp-plan-dropdown-list">
                        ${subscriptions.map((sub, idx) => {
                            const name = sub._displayLabel || sub.nameZh || sub.name || `套餐 ${idx + 1}`;
                            const isSel = idx === selectedIndex;
                            return `
                                <div class="asp-plan-item ${isSel ? 'selected' : ''}" data-index="${idx}">
                                    <span>${name}</span>
                                    ${isSel ? '<span class="asp-plan-item-check">✓</span>' : ''}
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '';

                tabsHtml = `
                    <div class="asp-tabs-container">
                        <div class="asp-tabs-bar">
                            <div class="asp-tabs-row">
                                ${subscriptions.map((sub, idx) => {
                                    const name = sub._displayLabel || sub.nameZh || sub.name || `套餐 ${idx + 1}`;
                                    return `<button class="asp-tab-pill ${idx === selectedIndex ? 'active' : ''}" data-index="${idx}">${name}</button>`;
                                }).join('')}
                            </div>
                            <button class="asp-tab-dropdown-btn ${isDropdownOpen ? 'active' : ''}" id="asp-btn-toggle-dropdown" title="查看所有套餐列表" aria-label="展开所有套餐列表">
                                <span>全部</span>
                                ${renderChevronSvg(isDropdownOpen ? 'open' : '')}
                            </button>
                        </div>
                        ${dropdownItemsHtml}
                    </div>
                `;
            }

            // 最低价亮点横幅
            let bannerHtml = '';
            if (lowest) {
                const lFlag = REGION_FLAGS[lowest.region] || '🌍';
                const lCny = lowest.priceCny != null ? `¥${lowest.priceCny.toFixed(2)}` : '';
                const lOriginal = `${lowest.currency} ${lowest.price}`;
                const diffText = currentStorePrice && currentStorePrice !== lowest
                    ? `相比 ${currentStorePrice.regionName || currentStorePrice.region}区 (¥${currentStorePrice.priceCny.toFixed(2)}) 节省约 ${savePercent}%`
                    : '当前商店区即为全球最低或持平';

                bannerHtml = `
                    <div class="asp-champion-banner">
                        <div class="asp-champion-title">
                            <span>🏆</span>
                            <span><b>${lowest.regionName || lowest.region}</b> 最低价：</span>
                            <span class="asp-champion-val">${lCny}</span>
                            <span style="font-size:12px;color:var(--asp-subtext)">(${lOriginal})</span>
                        </div>
                        <div class="asp-champion-diff">${diffText}</div>
                    </div>
                `;
            }

            // 价格表格
            const displayLimit = showAll ? currentPrices.length : 8;
            let displayRows = currentPrices.slice(0, displayLimit);

            if (!showAll && currentStorePrice && !displayRows.includes(currentStorePrice)) {
                displayRows = displayRows.concat([currentStorePrice]);
            }

            const rowsHtml = displayRows.map((item, idx) => {
                const rank = idx + 1;
                let rankDisplay = `${rank}`;
                if (rank === 1) rankDisplay = '🥇 1';
                else if (rank === 2) rankDisplay = '🥈 2';
                else if (rank === 3) rankDisplay = '🥉 3';

                const isLowest = item === lowest;
                const isCurrent = item.region === storeRegion;
                const flag = REGION_FLAGS[item.region] || '🌍';
                const originalPrice = `${item.price} ${item.currency}`;
                const cnyPrice = item.priceCny != null ? `¥${item.priceCny.toFixed(2)}` : '-';
                const usdPrice = item.priceUsd != null ? `$${item.priceUsd.toFixed(2)}` : '-';

                return `
                    <tr class="${isLowest ? 'asp-row-lowest' : ''} ${isCurrent ? 'asp-row-current' : ''}">
                        <td>${rankDisplay}</td>
                        <td>
                            <div class="asp-flag-name">
                                <span>${flag}</span>
                                <span>${item.regionName || item.region}</span>
                                ${isCurrent ? '<span class="asp-badge-current-tag">当前区</span>' : ''}
                            </div>
                        </td>
                        <td>${originalPrice}</td>
                        <td style="font-weight:600;color:${isLowest ? 'var(--asp-green)' : 'inherit'}">${cnyPrice}</td>
                        <td style="color:var(--asp-subtext)">${usdPrice}</td>
                    </tr>
                `;
            }).join('');

            const hasMore = currentPrices.length > 8;

            drawerHtml = `
                <div class="asp-drawer-panel">
                    <div class="asp-panel-head">
                        <div class="asp-panel-title">
                            <span>🌐</span>
                            <span>全球价格对比</span>
                        </div>
                        <div class="asp-head-actions">
                            <a href="${API_BASE}/zh/apps/${appId}" target="_blank" class="asp-link-out">
                                官网 ↗
                            </a>
                            <button class="asp-close-btn" id="asp-btn-close" title="收起">✕</button>
                        </div>
                    </div>
                    ${tabsHtml}
                    ${bannerHtml}
                    <div class="asp-table-scroll">
                        <table class="asp-table">
                            <thead>
                                <tr>
                                    <th>排名</th>
                                    <th>地区</th>
                                    <th>原币价格</th>
                                    <th>折合 CNY</th>
                                    <th>折合 USD</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rowsHtml}
                            </tbody>
                        </table>
                    </div>
                    ${hasMore ? `
                        <button class="asp-toggle-more-btn" id="asp-btn-toggle-more">
                            ${showAll ? '收起部分地区 ▴' : `展开全部 ${currentPrices.length} 个地区 ▾`}
                        </button>
                    ` : ''}
                    <div style="margin-top:10px;font-size:11px;color:var(--asp-subtext);display:flex;justify-content:space-between;">
                        <span>汇率已实时折算 · AppStorePrice</span>
                        ${lowest?.observedAt ? `<span>更新于 ${lowest.observedAt}</span>` : ''}
                    </div>
                </div>
            `;
        }

        // 构建胶囊浮标
        let pillText = '';
        if (lowest) {
            const flag = REGION_FLAGS[lowest.region] || '🌍';
            const lowestPriceStr = lowest.priceCny != null ? `¥${lowest.priceCny.toFixed(2)}` : `${lowest.price} ${lowest.currency}`;
            pillText = `
                <span>🌐</span>
                <span>比价：<b>${flag} ${lowest.regionName || lowest.region} ${lowestPriceStr}</b></span>
                ${savePercent > 0 ? `<span class="asp-pill-tag">省 ${savePercent}%</span>` : ''}
                ${renderChevronSvg(isDrawerOpen ? 'open' : '')}
            `;
        } else {
            pillText = `
                <span>🌐</span>
                <span>查看 AppStorePrice 全球比价</span>
                ${renderChevronSvg(isDrawerOpen ? 'open' : '')}
            `;
        }
        root.innerHTML = `
            ${drawerHtml}
            <div class="asp-float-pill" id="asp-btn-pill-toggle">
                ${pillText}
            </div>
        `;

        // 事件绑定
        const pill = root.querySelector('#asp-btn-pill-toggle');
        if (pill) {
            pill.onclick = () => {
                state.isOpen = !state.isOpen;
                render({ appId, state });
            };
        }

        const closeBtn = root.querySelector('#asp-btn-close');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                state.isOpen = false;
                render({ appId, state });
            };
        }
        const tabDropdownBtn = root.querySelector('#asp-btn-toggle-dropdown');
        if (tabDropdownBtn) {
            tabDropdownBtn.onclick = (e) => {
                e.stopPropagation();
                state.isPlanDropdownOpen = !state.isPlanDropdownOpen;
                render({ appId, state });
            };
        }

        // 纵向展开菜单项点击：选择后自动收起
        const planItems = root.querySelectorAll('.asp-plan-item');
        planItems.forEach(item => {
            item.onclick = (e) => {
                e.stopPropagation();
                const idx = parseInt(item.dataset.index, 10);
                state.selectedPlanIndex = idx;
                state.isPlanDropdownOpen = false; // 自动收起
                render({ appId, state });
            };
        });

        const tabBtns = root.querySelectorAll('.asp-tab-pill');
        tabBtns.forEach(btn => {
            btn.onclick = (e) => {
                const idx = parseInt(e.target.dataset.index, 10);
                state.selectedPlanIndex = idx;
                state.isPlanDropdownOpen = false; // 切换后关闭下拉
                render({ appId, state });
            };
        });
        const toggleMoreBtn = root.querySelector('#asp-btn-toggle-more');
        if (toggleMoreBtn) {
            toggleMoreBtn.onclick = () => {
                state.showAll = !state.showAll;
                render({ appId, state });
            };
        }
    }

    /**
     * 主执行流程
     */
    async function init() {
        injectStyles();

        const appId = getAppId();
        if (!appId) {
            // 如果不在具体的 App 详情页，清理可能残留的悬浮窗
            const old = document.getElementById(ROOT_ID);
            if (old) old.remove();
            return;
        }

        console.log('%c[AppStorePrice]%c 比价悬浮窗已就绪，当前 App ID: ' + appId, 'background:#0071e3;color:#fff;padding:2px 6px;border-radius:3px;font-weight:bold;', '');

        const existing = document.getElementById(ROOT_ID);
        if (existing && existing.isConnected && existing.dataset.appId === appId && !existing.querySelector('.asp-spinner')) {
            return;
        }

        let state = appStateMap.get(appId);
        if (!state) {
            state = {
                loading: true,
                recorded: false,
                detail: null,
                isOpen: false,
                selectedPlanIndex: 0,
                showAll: false
            };
            appStateMap.set(appId, state);
        }

        render({ appId, state });

        const data = await fetchAppDetail(appId);
        state.loading = false;
        state.recorded = data.recorded;
        state.detail = data.detail;

        render({ appId, state });
    }

    /**
     * 持续轮询守护，确保 Svelte 异步渲染及 SPA 切换时悬浮窗稳定存在
     */
    let mountPollTimer = null;
    function ensureMounted() {
        clearInterval(mountPollTimer);
        init();

        let retries = 0;
        mountPollTimer = setInterval(() => {
            retries++;
            const appId = getAppId();
            if (!appId) {
                const old = document.getElementById(ROOT_ID);
                if (old) old.remove();
                clearInterval(mountPollTimer);
                return;
            }

            const existing = document.getElementById(ROOT_ID);
            if (!existing || !existing.isConnected || existing.dataset.appId !== appId) {
                init();
            }

            if (retries >= 20) {
                clearInterval(mountPollTimer);
            }
        }, 200);
    }

    // 监听 SPA 路由变动
    let lastUrl = window.location.href;
    function checkUrlChange() {
        if (window.location.href !== lastUrl) {
            lastUrl = window.location.href;
            ensureMounted();
        }
    }

    const origPushState = history.pushState;
    if (origPushState) {
        history.pushState = function (...args) {
            origPushState.apply(this, args);
            checkUrlChange();
        };
    }

    const origReplaceState = history.replaceState;
    if (origReplaceState) {
        history.replaceState = function (...args) {
            origReplaceState.apply(this, args);
            checkUrlChange();
        };
    }

    window.addEventListener('popstate', checkUrlChange);

    // 观察 DOM 变动与 URL 变化
    const observer = new MutationObserver(() => {
        const appId = getAppId();
        if (!appId) {
            const old = document.getElementById(ROOT_ID);
            if (old) old.remove();
            return;
        }
        const existing = document.getElementById(ROOT_ID);
        if (!existing || !existing.isConnected || existing.dataset.appId !== appId) {
            ensureMounted();
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    // 初始执行调度
    if (document.readyState === 'complete') {
        setTimeout(ensureMounted, 300);
    } else {
        window.addEventListener('load', () => setTimeout(ensureMounted, 300), { once: true });
    }
})();
