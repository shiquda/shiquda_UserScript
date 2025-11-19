// ==UserScript==
// @name         Bilibili High Quality External Playback
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Automatically get user Bilibili cookies and replace Bilibili video iframe src with real playback address
// @author       Your Name
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      api.bilibili.com
// @run-at       document-end
// ==/UserScript==

(function () {
    'use strict';

    // Get cookie value by name from browser
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // Get Bilibili cookie information
    // const SESSDATA = getCookie('SESSDATA');
    // const bili_jct = getCookie('bili_jct');

    const SESSDATA = "55682fdf%2C1741078686%2C77874%2A91CjCJsVGzTV26jZG_EQLhOX6TyasRn0NL8kCntHgv52iJWpUSIb_6fjNBvjpHgUjIvN0SVkJxUmZwUmtPQnlVWWE5TXgtcFRrY1lHMXZPdjItOG55QlBLUUJ2QTVCSkhRc0FWemRGSFBHMms2elV4X3I0RTlSTVhNb2xIT1dObXpyS2VaRmY5V3d3IIEC";
    const bili_jct = "f71041968531d03d794803ce49cdc11a";


    // if (!SESSDATA || !bili_jct) {
    //     console.error('Unable to find Bilibili SESSDATA or bili_jct Cookie, please ensure you are logged into Bilibili');
    //     return;
    // }

    // Regular expression for matching aid or bvid
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

    // Get cid
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
                console.error('Failed to get cid');
                console.error(response);
                callback(null);
            }
        });
    }

    // Get real playback URL
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

    // Iterate through all iframes
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

    // Execute after page load completes
    window.addEventListener('load', parse_iframes);
})();
