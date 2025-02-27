// ==UserScript==
// @name         B站高清站外播放
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动获取用户B站Cookie并替换B站视频iframe的src为真实播放地址
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.bilibili.com
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // 从浏览器中获取指定名称的Cookie值
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // 获取B站的Cookie信息
    // const SESSDATA = getCookie('SESSDATA');
    // const bili_jct = getCookie('bili_jct');

    const SESSDATA = "55682fdf%2C1741078686%2C77874%2A91CjCJsVGzTV26jZG_EQLhOX6TyasRn0NL8kCntHgv52iJWpUSIb_6fjNBvjpHgUjIvN0SVkJxUmZwUmtPQnlVWWE5TXgtcFRrY1lHMXZPdjItOG55QlBLUUJ2QTVCSkhRc0FWemRGSFBHMms2elV4X3I0RTlSTVhNb2xIT1dObXpyS2VaRmY5V3d3IIEC";
    const bili_jct = "f71041968531d03d794803ce49cdc11a";


    // if (!SESSDATA || !bili_jct) {
    //     console.error('无法找到B站的SESSDATA或bili_jct Cookie，请确保你已登录B站');
    //     return;
    // }

    // 正则表达式用于匹配aid或bvid
    function get_aid_or_bvid(src) {
        const pattern = /(bvid|aid)=([^&]+)/;
        const matches = src.match(pattern);
        if (matches) {
            return {
                type: matches[1],
                id: matches[2]
            };
        }
        return null;
    }

    // 获取cid
    function get_cid(idObj, callback) {
        const params = idObj.type === 'aid' ? `aid=${idObj.id}` : `bvid=${idObj.id}`;
        const url = `https://api.bilibili.com/x/web-interface/view?${params}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (response) {
                const data = JSON.parse(response.responseText);
                if (data && data.data && data.data.cid) {
                    callback(data.data.cid);
                } else {
                    callback(null);
                }
            },
            onerror: function () {
                console.error('获取cid失败');
                console.error(response);
                callback(null);
            }
        });
    }

    // 获取真实播放地址
    function get_real_url(bvid, cid, callback) {
        const params = `bvid=${bvid}&cid=${cid}&qn=112&platform=html5&high_quality=1`;
        const url = `https://api.bilibili.com/x/player/playurl?${params}`;

        GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            headers: {
                'Cookie': `SESSDATA=${SESSDATA}; bili_jct=${bili_jct}`
            },
            onload: function (response) {
                const data = JSON.parse(response.responseText);
                if (data && data.data && data.data.durl && data.data.durl[0] && data.data.durl[0].url) {
                    callback(data.data.durl[0].url);
                } else {
                    callback(null);
                }
            },
            onerror: function () {
                callback(null);
            }
        });
    }

    // 遍历所有iframe
    function parse_iframes() {
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            const src = iframe.src;
            if (src.includes('bilibili.com')) {
                const idObj = get_aid_or_bvid(src);
                console.log(idObj);
                if (idObj) {
                    get_cid(idObj, function (cid) {
                        if (cid) {
                            get_real_url(idObj.id, cid, function (realUrl) {
                                console.log(realUrl);
                                if (realUrl) {
                                    iframe.src = realUrl;
                                }
                            });
                        }
                    });
                }
            }
        });
    }

    // 等待页面加载完成后执行
    window.addEventListener('load', parse_iframes);
})();
