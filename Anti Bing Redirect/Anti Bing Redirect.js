// ==UserScript==
// @name         Anti Bing Redirect
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1.0
// @description  Anti Bing Redirect
// @author       shiquda
// @match        https://www.bing.com/search?*
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    //提取url的被加密字符串并解密
    function decode(url) {
        const regex = /(?<=&u=a1)[^&]*/;
        const match = regex.exec(url);
        if (match) {
            const encodedString = match[0].replace(/-/g, '+').replace(/_/g, '/');
            const decodedString = atob(encodedString);
        return decodedString;
        }
    return null;
    }
    function replaceURLs(){
        //var txt = ""
        const URLs = document.querySelectorAll("a")
        for (var i = 0;i < URLs.length;i++){
            const rpl = decode(URLs[i].href)
            if (rpl){
                URLs[i].href = rpl
                //txt += (" " + rpl)
            }
        }
        console.log(txt)
    }
    replaceURLs()

    // Your code here...
})();