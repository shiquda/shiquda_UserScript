// ==UserScript==
// @name         Bbdc New Word Export
// @namespace    http://tampermonkey.net/
// @version      0.2.4
// @description  Bbdc new word export, currently supports automatic word list retrieval and export to txt file.
// @author       shiquda
// @match        https://www.bbdc.cn/newword
// @match        https://bbdc.cn/newword
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
        btn.id = 'export-btn';
        btn.innerText = 'Export Words as TXT';
        btn.addEventListener('click', downloadWords);
        document.querySelector('.crumb-wrap').appendChild(btn);
        const infotab = document.createElement('div');
        infotab.id = 'info-tab';
        infotab.innerText = ``;
        infotab.style = 'margin: 10px';
        document.querySelector('.crumb-wrap').appendChild(infotab);

        const options = [
            { id: 'random-checkbox', text: 'Shuffle randomly', checked: false },
            { id: 'order-checkbox', text: 'Sort alphabetically', checked: false },
            { id: 'phrase-checkbox', text: 'Remove phrases', checked: true },
            { id: 'unique-checkbox', text: 'Remove duplicates', checked: true }
        ];

        options.forEach(option => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = option.id;
            checkbox.checked = option.checked;
            checkbox.style = 'margin: 10px';

            const label = document.createElement('label');
            label.htmlFor = option.id;
            label.appendChild(document.createTextNode(option.text));

            document.querySelector('.crumb-wrap').appendChild(checkbox);
            document.querySelector('.crumb-wrap').appendChild(label);
        });
    }

    function downloadWords() {
        document.querySelector('#export-btn').innerText = 'Exporting...';
        document.querySelector('#export-btn').removeEventListener('click', downloadWords)
        document.querySelector('#export-btn').addEventListener('click', manipulateWords);
        document.querySelector('#export-btn').disabled = true;
        loadWords().then(() => {
            manipulateWords();
            document.querySelector('#info-tab').innerText = `Export complete! You can re-check options to set export format!`;
            document.querySelector('#export-btn').disabled = false;
            document.querySelector('#export-btn').innerText = 'Re-export';
        })
    }

    function loadWords() {
        let promises = [];
        const apiBase = window.location.hostname.includes('www') ? 'https://www.bbdc.cn' : 'https://bbdc.cn';
        for (let i = 0; i < pages; i++) {
            promises.push(new Promise((resolve, reject) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', `${apiBase}/api/user-new-word?page=${i}`);
                xhr.onload = function (e) {
                    const data = JSON.parse(e.target.responseText);
                    for (const item of data.data_body.wordList) {
                        words.push(item.word);
                    }
                    console.log(`page ${i + 1} loaded`);
                    loadedPages++;
                    document.querySelector('#info-tab').innerText = `Loading word list...${loadedPages}/${pages}`;
                    resolve();
                }
                xhr.send();
            }));
        }
        return Promise.all(promises); // Wait for all requests to complete
    }

    function manipulateWords() {
        const cfg = {
            random: document.querySelector('#random-checkbox').checked,
            order: document.querySelector('#order-checkbox').checked,
            phrase: document.querySelector('#phrase-checkbox').checked,
            unique: document.querySelector('#unique-checkbox').checked,
        }
        if (cfg.random && cfg.order) {
            alert('Cannot select both shuffle and sort!');
            return;
        }
        if (cfg.random) {
            words.sort(() => Math.random() - 0.5);
        }
        if (cfg.order) {
            words.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
        }
        if (cfg.phrase) {
            words = words.filter(word => !word.includes(' '));
        }
        if (cfg.unique) {
            words = [...new Set(words)];
        }
        const txt = words.join('\n');
        const blob = new Blob([txt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `words.txt`;
        a.click();
    }


    function init() {
        return new Promise((resolve, reject) => {
            const apiBase = window.location.hostname.includes('www') ? 'https://www.bbdc.cn' : 'https://bbdc.cn';
            let xhr = new XMLHttpRequest();
            xhr.open('GET', `${apiBase}/api/user-new-word?page=0`);
            xhr.onload = function (e) {
                // Read page count
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
