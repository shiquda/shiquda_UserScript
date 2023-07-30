// ==UserScript==
// @name         Script Finder
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  Script Finder allows you to find userscripts from greasyfork on any website.
// @author       shiquda
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @license      AGPL-3.0
// ==/UserScript==

(function () {
    const domainParts = window.location.hostname.split('.').slice(-2);
    const domain = domainParts.join('.');
    const errorMessage = "Failed to retrieve script information or there are no available scripts for this domain.";

    function getScriptsInfo(domain) {

        var url = `https://greasyfork.org/scripts/by-site/${domain}`;
        GM_xmlhttpRequest({
            method: "GET",
            url: url,
            onload: (response) => {

                const parser = new DOMParser();
                const doc = parser.parseFromString(response.responseText, "text/html");
                const scripts = doc.querySelector("#browse-script-list")?.querySelectorAll('[data-script-id]');
                let scriptsInfo = [];
                if (!scripts) {
                    scriptsInfo = errorMessage
                } else {
                    for (var i = 0; i < scripts.length; i++) {
                        scriptsInfo.push(parseScriptInfo(scripts[i]));
                    }
                }
                console.log(scriptsInfo);
                showScriptsInfo(scriptsInfo); // 显示脚本信息
            },
            onerror: () => {
                console.log("Some error!");
                const scriptsInfo = errorMessage
                showScriptsInfo(scriptsInfo)
            }
        });
    }

    // 解析脚本信息
    function parseScriptInfo(script) {
        return {
            id: script.getAttribute('data-script-id'),
            name: script.getAttribute('data-script-name'),
            author: script.querySelector("dd.script-list-author").textContent,
            description: script.querySelector(".script-description").textContent,
            // version: script.getAttribute('data-script-version'),
            url: 'https://greasyfork.org/scripts/' + script.getAttribute('data-script-id'),
            // createDate: script.getAttribute('data-script-created-date'),
            // updateDate: script.getAttribute('data-script-updated-date'),
            installs: script.getAttribute('data-script-total-installs'),
            // dailyInstalls: script.getAttribute('data-script-daily-installs'),
            ratingScore: script.getAttribute('data-script-rating-score')
        };
    }

    function showScriptsInfo(scriptsInfo) {
        GM_addStyle(`
            button.script-button {
                position: fixed;
                bottom: 50%;
                right: -50px;
                transform: translateY(50%);
                padding: 12px;
                font-size: 16px;
                border: none;
                border-radius: 4px;
                background-color: #1e90ff;
                color: #ffffff;
                cursor: pointer;
                transition: right 0.3s;
            }
            
            div.info-container {
                display: none;
                position: fixed;
                top: 10%;
                right: 100px;
                width: 600px;
                padding: 12px;
                background-color: #ffffff;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                border-radius: 4px;
                opacity: 0;
                transition: opacity 0.3s;
                z-index: 9999;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            ul.info-list {
                list-style: none;
                margin: 0;
                padding: 0;
            }

            li.info-item {
                margin-bottom: 10px;
                border: 1px solid #ddd;
                padding: 10px;
                display: flex;
                flex-direction: column;
            }

            .div.script-container {
                display: flex;
                flex-direction: column;
            }

            a.script-link {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }

            p.script-description {
                margin-top: 2px;
                margin-bottom: 5px;
            }

            div.details-container {
                font-size: 18px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
            }

            span.script-details {
                flex-grow: 1;
                text-align: left;
            }
            
            div.table-header {
                font-size: 25px;
            }

            input.script-search-input {
                width: 96%;
                padding: 10px;
                font-size: 18px;
                border: 1px solid #ddd;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
                margin-bottom: 15px;
                margin-top: 20px;
            }
        `);


        // 创建按钮
        var button = document.createElement('button');
        button.className = 'script-button';
        button.innerText = 'Scripts';

        // 创建脚本容器
        var infoContainer = document.createElement('div');
        infoContainer.className = 'info-container';

        // 创建搜索框
        var searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search scripts...';
        searchInput.className = 'script-search-input';

        // 创建表头
        var tableHeader = document.createElement('div');
        // tableHeader.style.display = 'flex';
        // tableHeader.style.justifyContent = 'space-between';
        tableHeader.className = 'table-header';
        tableHeader.appendChild(document.createTextNode('Script Finder'));
        tableHeader.appendChild(searchInput);

        // 创建脚本列表
        var infoList = document.createElement('ul');
        infoList.className = 'info-list';

        // 插入脚本
        if (scriptsInfo === errorMessage) {
            infoList.innerHTML = errorMessage;
        } else {
            for (var i = 0; i < scriptsInfo.length; i++) {
                var script = scriptsInfo[i];
                var listItem = document.createElement('li');
                listItem.className = 'info-item';

                var scriptContainer = document.createElement('div');
                scriptContainer.className = 'script-container';

                var nameElement = document.createElement('a');
                nameElement.className = 'script-link';
                nameElement.innerText = script.name;
                nameElement.href = script.url;
                nameElement.target = '_blank';

                var descriptionElement = document.createElement('p');
                descriptionElement.className = 'script-description';
                descriptionElement.innerHTML = script.description;

                var detailsContainer = document.createElement('div');
                detailsContainer.className = 'details-container';

                var authorElement = document.createElement('span');
                authorElement.className = 'script-details';
                authorElement.innerText = 'Author: ' + script.author;

                var installsElement = document.createElement('span');
                installsElement.className = 'script-details';
                installsElement.innerText = 'Installs: ' + script.installs;

                var ratingElement = document.createElement('span');
                ratingElement.className = 'script-details';
                ratingElement.innerText = 'Rating: ' + script.ratingScore;

                detailsContainer.appendChild(authorElement);
                detailsContainer.appendChild(installsElement);
                detailsContainer.appendChild(ratingElement);

                scriptContainer.appendChild(nameElement);
                scriptContainer.appendChild(descriptionElement);
                scriptContainer.appendChild(detailsContainer);

                listItem.appendChild(scriptContainer);
                infoList.appendChild(listItem);
            }
        }

        infoContainer.appendChild(tableHeader)
        infoContainer.appendChild(infoList);

        var timeout;
        button.addEventListener('mouseenter', function () {
            clearTimeout(timeout);
            button.style.right = '10px';
        });

        button.addEventListener('mouseleave', function () {
            timeout = setTimeout(function () {
                button.style.right = '-50px';
            }, 500);
        });

        button.addEventListener('click', function (event) {
            event.stopPropagation();
            button.style.right = '10px';
            infoContainer.style.display = "block"
            infoContainer.style.opacity = 1
        });



        infoContainer.addEventListener('click', function (event) {
            event.stopPropagation();
        });

        searchInput.addEventListener('input', () => {
            searchScript()
        })

        document.body.addEventListener('click', function () {
            clearTimeout(timeout);
            button.style.right = '-50px';
            infoContainer.style.opacity = 0
        });

        document.body.appendChild(button);

        document.body.appendChild(infoContainer);
    }

    function searchScript() {
        const searchWord = document.querySelector('.script-search-input').value;
        const scriptList = document.querySelectorAll('.info-item')
        for (let i = 0; i < scriptList.length; i++) {
            if (scriptList[i].innerText.includes(searchWord)) {
                scriptList[i].style.display = 'block'
            } else {
                scriptList[i].style.display = 'none'
            }
        }
    }

    getScriptsInfo(domain);
})();



