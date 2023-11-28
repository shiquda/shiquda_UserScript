// ==UserScript==
// @name         不背单词生词本导出
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  不背单词生词本导出，目前支持自动获取单词列表并导出为txt文件。
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
    let pages = 1;
    let words = [];
    let loadedPages = 0;

    function createUI() {
        const btn = document.createElement('button');
        btn.innerText = '导出单词为txt';
        btn.addEventListener('click', downloadWords);
        document.querySelector('.crumb-wrap').appendChild(btn);
        const infotab = document.createElement('div');
        infotab.id = 'info-tab';
        infotab.innerText = ``;
        infotab.style = 'margin: 10px';
        document.querySelector('.crumb-wrap').appendChild(infotab);
    }

    function downloadWords() {
        loadWords().then(() => {
            const txt = words.join('\n');
            const blob = new Blob([txt], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'words.txt';
            a.click();
            document.querySelector('#info-tab').innerText = `导出完成！`;
        })
    }

    function loadWords() {
        let promises = [];
        for (let i = 0; i < pages; i++) {
            promises.push(new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', `https://www.bbdc.cn/api/user-new-word?page=${i}`);
                xhr.onload = function (e) {
                    const data = JSON.parse(e.target.responseText);
                    for (const item of data.data_body.wordList) {
                        for (const sentence of item.sentenceList) {
                            words.push(sentence.word);
                        }
                    }
                    console.log(`page ${i + 1} loaded`);
                    loadedPages++;
                    document.querySelector('#info-tab').innerText = `正在加载单词列表...${loadedPages}/${pages}`;
                    resolve();
                }
                xhr.send();
            }));
        }
        return Promise.all(promises); // 等待所有请求都完成
    }



    function init() {
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', `https://www.bbdc.cn/api/user-new-word?page=0`);
            xhr.onload = function (e) {
                // 读取页面数
                let data = JSON.parse(e.target.responseText);
                pages = data.data_body.pageInfo.totalPage;
                // console.log(pages);
                // console.log(data);
                resolve();
            }
            xhr.send();
        });
    }
    init().then(() => {
        createUI();
    });
})();
