// ==UserScript==
// @name         不背单词生词本导出
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  不背单词生词本导出，目前支持导出为txt文件，请在点击前保证全部单词已经加载完全。
// @author       shiquda
// @match        https://www.bbdc.cn/newword
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bbdc.cn
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    function getWords() {
        const wordsItems = document.querySelectorAll('.wordlist-word');
        console.log(wordsItems);
        let words = []
        for (const wordItem of wordsItems) {
            const word = wordItem.querySelector('strong').innerText;
            words.push(word);
        }
        return words;
    }

    function createUI() {
        const btn = document.createElement('button');
        btn.innerText = '导出单词为txt';
        btn.addEventListener('click', downloadWords);
        document.querySelector('.crumb-wrap').appendChild(btn);
    }

    function downloadWords() {
        const words = getWords();
        const txt = words.join('\n');
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'words.txt';
        a.click();
    }

    createUI();
    // Your code here...
})();
