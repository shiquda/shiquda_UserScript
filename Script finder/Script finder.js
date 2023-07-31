// ==UserScript==
// @name         Script Finder
// @namespace    http://tampermonkey.net/
// @version      0.1.1
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

        var url = `https://greasyfork.org/scripts/by-site/${domain}?filter_locale=0`;
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
        oneClickInstall();
    }

    // 解析脚本信息
    function parseScriptInfo(script) {
        return {
            id: script.getAttribute('data-script-id'),
            name: script.getAttribute('data-script-name'),
            author: script.querySelector("dd.script-list-author").textContent,
            description: script.querySelector(".script-description").textContent,
            version: script.getAttribute('data-script-version'),
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
                font-size: 18px !important;
                font-weight: bold !important;
                margin-bottom: 5px !important;
                color: #1e90ff !important;
            }

            p.script-description {
                color: black !important;
                margin-top: 2px;
                margin-bottom: 5px;
            }

            div.details-container {
                font-size: 18px ;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
            }

            span.script-details {
                color: black !important;
                flex-grow: 1;
                text-align: left;
            }
            
            div.table-header {
                color: #1e90ff !important;
                font-size: 25px;
            }

            input.script-search-input {
                width: 96% !important;
                padding: 10px !important;
                font-size: 18px !important;
                border: 1px solid #ddd !important;
                border-radius: 4px !important;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3) !important;
                margin-bottom: 15px !important;
                margin-top: 20px !important;
            }
            a.install-button {
                font-size: 25px;
                background-color: green;
                color: white;
                padding: 10px;
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

                // 创建一键安装按钮
                var installButton = document.createElement('a');
                installButton.className = 'install-button';
                installButton.innerText = `Install ${script.version}`;
                installButton.href = `https://greasyfork.org/scripts/${script.id}/code/script.user.js`;

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
                scriptContainer.appendChild(installButton);

                listItem.appendChild(scriptContainer);
                listItem.scriptId = script.id;
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
            infoContainer.style.display = "none"
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


    // 一键安装 此处参考tampermonkey versioncheck.js 但是不知道为什么别的网站没有这个对象
    /*
        function oneClickInstall() {
            const scriptList = document.querySelectorAll('.script-container');
            // 获取tamppermonkey脚本信息
            let tm = window.external?.Tampermonkey
            let vm = window.external?.ViolentMonkey
    
            function getInstalledVersion(name, namespace) {
                return new Promise(function (resolve, reject) {
                    if (tm) {
                        tm.isInstalled(name, namespace, function (i) {
                            if (i.installed) {
                                resolve(i.version);
                            } else {
                                resolve(null);
                            }
                        });
                        return;
                    }
    
                    if (vm) {
                        vm.isInstalled(name, namespace).then(resolve);
                        return;
                    };
    
                    reject()
                });
            }
    
            // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/version/format
            function compareVersions(a, b) {
                if (a == b) {
                    return 0;
                }
                let aParts = a.split('.');
                let bParts = b.split('.');
                for (let i = 0; i < aParts.length; i++) {
                    let result = compareVersionPart(aParts[i], bParts[i]);
                    if (result != 0) {
                        return result;
                    }
                }
                // If all of a's parts are the same as b's parts, but b has additional parts, b is greater.
                if (bParts.length > aParts.length) {
                    return -1;
                }
                return 0;
            }
    
            function compareVersionPart(partA, partB) {
                let partAParts = parseVersionPart(partA);
                let partBParts = parseVersionPart(partB);
                for (let i = 0; i < partAParts.length; i++) {
                    // "A string-part that exists is always less than a string-part that doesn't exist"
                    if (partAParts[i].length > 0 && partBParts[i].length == 0) {
                        return -1;
                    }
                    if (partAParts[i].length == 0 && partBParts[i].length > 0) {
                        return 1;
                    }
                    if (partAParts[i] > partBParts[i]) {
                        return 1;
                    }
                    if (partAParts[i] < partBParts[i]) {
                        return -1;
                    }
                }
                return 0;
            }
    
            // It goes number, string, number, string. If it doesn't exist, then
            // 0 for numbers, empty string for strings.
            function parseVersionPart(part) {
                if (!part) {
                    return [0, "", 0, ""];
                }
                let partParts = /([0-9]*)([^0-9]*)([0-9]*)([^0-9]*)/.exec(part)
                return [
                    partParts[1] ? parseInt(partParts[1]) : 0,
                    partParts[2],
                    partParts[3] ? parseInt(partParts[3]) : 0,
                    partParts[4]
                ];
            }
    
            function handleInstallResult(installedVersion, version) {
                if (installedVersion == null) {
                    // Not installed
                    return `Install { version } `;
                }
    
                // installButton.removeAttribute("data-ping-url")
    
                switch (compareVersions(installedVersion, version)) {
                    // Upgrade
                    case -1:
                        return `Upgrade ${version} `;
                        break;
                    // Downgrade
                    case 1:
                        return `Downgrade ${version} `;
                        break;
                    // Equal
                    case 0:
                        return `Reinstall ${version} `;
                        break;
                }
            }
            for (let i = 0; i < scriptList.length; i++) {
                let script = scriptList[i];
                let id = script.scriptId
                GM_xmlhttpRequest({
                    url: `https://greasyfork.org/scripts/${id}.json`,
                    method: "GET",
                    onload: (response) => {
                        const data = JSON.parse(response.responseText)
                        let latestVersion = data.version
                        let namespace = data.namespace
                        let installedVersion = getInstalledVersion(id, namespace)
                        let versionInfo = handleInstallResult(installedVersion, latestVersion)
                        script.querySelector('.install-button').innerText = versionInfo
                    },
                    onerror: (error) => {
                        console.log(`An error occured when fetching script ${id}: ${error}`)
                    }
                })
            }
        }
    */

    getScriptsInfo(domain);

})();