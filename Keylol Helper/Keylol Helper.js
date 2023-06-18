// ==UserScript==
// @name         Keylol Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Keylol Helper
// @author       shiquda
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @match        *://*/*
// @icon         https://keylol.com/favicon.ico
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const info = ['自动检测是否有其乐消息', '添加自动回复功能', '抽奖自动加愿望单', '快速跳转激活key']


    for (var i = 0; i < info.length; i++) {
        setMenu(info[i])
    }
    checkNotice()
    if (isInSite()) {
        addCSS()
        autoReply()
        keyGiving()
        addList()
    }



    function setMenu(name) {
        const status = GM_getValue(name) ? GM_getValue(name) : true;
        GM_registerMenuCommand(`${name}: ${status}`, () => {
            GM_setValue(name, !status);
            window.location.reload();
        });
    }


    // 判断是否在站内
    function isInSite() {
        const url = window.location.href;
        if (url.includes('https://keylol.com/t') || url.includes('https://keylol.com/forum.php?mod=viewthread')) return true
        return false
    }

    // 添加样式
    function addCSS() {
        GM_addStyle(`
        .s_btn {
            display: inline-block;
            padding: 10px 20px;
            font-size: 20px;
            font-weight: bold;
            text-align: center;
            text-decoration: none;
            border-radius: 5px;
            background-color: #57b9e7;
            color: #FFFFFF;
            cursor: pointer;
        }
        
        .s_btn:hover {
            background-color: #0056b3;
        }
        
        .s_btn:active {
            background-color: #003d80;
        }
        
        .s_btn:focus {
            outline: none;
            box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
        }
            }
        `)
    }
    // 添加自动回复功能
    function autoReply() {
        if (!GM_getValue('添加自动回复功能')) return
        const message = "{:17_1010:}"//要发送的信息


        createUI1()


        function post() {
            document.querySelector("#post_reply").click()
            setTimeout(() => { document.querySelector("#postmessage").value = message }, 1000)
            setTimeout(() => { document.querySelector("#postsubmit").click(); }, 1050)
        }
        function createUI1() {
            var tab = document.querySelector("#pgt")
            var btn = document.createElement("button")
            btn.className = "s_btn"
            btn.textContent = "自动回帖"
            btn.title = `自动回复：${message}`
            btn.addEventListener("click", start)
            tab.appendChild(btn)
        }
        function start() {
            console.log("start")
            post()
        }
    }

    // 快速跳转激活key
    function keyGiving() {
        if (!GM_getValue('快速跳转激活key')) return
        const keytab = document.querySelectorAll(".sk_info")
        if (keytab) {
            const url = 'https://store.steampowered.com/account/registerkey'
            const tab = document.querySelector("#pgt")
            const container = document.createElement('button');
            container.classList.add('s_btn');
            container.textContent = '点击跳转到 Steam 激活页面';
            container.addEventListener("click", () => { window.open(url) })
            tab.appendChild(container)
        }
    }

    // 抽奖自动加愿望单
    function addList() {

        if (!GM_getValue('抽奖自动加愿望单')) return

        const botID = "大号"

        if (judge()) {
            createUI2()
        }

        function judge() {
            if (document.body.innerText.search("[活动推广]") > -1) return true
            return false
        }
        function getAppID(urls) {
            var AppIDs = []
            if (urls.length === 0) {
                return AppIDs; // 如果urls数组为空，直接返回空数组
            }
            for (var i = 0; i < urls.length; i++) {
                var AppID = urls[i].src.match(/^https:\/\/store\.steampowered\.com\/widget\/(\d+)/)
                if (AppID && AppID[1]) {
                    AppIDs.push(AppID[1])
                }
            }
            AppIDs = [...new Set(AppIDs)]
            return AppIDs
        }

        function createUI2() {
            let urls = document.querySelectorAll("iframe")

            const IDList = getAppID(urls)
            console.log(IDList)
            if (IDList.length === 0) { return }
            var txt = `ADDWISHLIST ${botID} `;
            for (var i = 0; i < IDList.length; i++) {
                txt += (IDList[i] + ",")
            }
            txt = txt.slice(0, -1)
            const tab = document.querySelector("#pgt")
            const container = document.createElement('button');
            container.classList.add('s_btn');
            container.textContent = '点击可复制愿望单ASF代码';
            container.addEventListener("click", () => { GM_setClipboard(txt); })
            tab.appendChild(container)
        }
    }


    // 检测是否有其乐消息
    function checkNotice() {
        if (!GM_getValue('检测是否有其乐消息')) return
        const interval = 2; // 检测间隔，单位是分钟
        const timeout = 5; // 通知显示时间，单位是秒
        let t = getBriefTime()
        var lastExecutionTimestamp = GM_getValue("lastExecutionTimestamp");
        var currentTimestamp = new Date().getTime();
        if (
            !lastExecutionTimestamp ||
            currentTimestamp - lastExecutionTimestamp > interval * 60 * 1000
        ) check()
        else {
            console.log(`${t}   时间间隔在${interval}分钟内.`);
            return;
        }
        setTimeout(check, (interval * 60 + 1) * 1000)
        function check() {
            let t = getBriefTime()
            GM_xmlhttpRequest({
                method: "GET",
                url: "https://keylol.com/home.php?mod=space&do=notice",
                onload: function (response) {
                    // 在响应中查找具有"btn-user-action-highlight"类的元素
                    var responseHTML = response.responseText;
                    var parser = new DOMParser();
                    var doc = parser.parseFromString(responseHTML, "text/html");
                    var elements = doc.getElementsByClassName(
                        "btn-user-action-highlight"
                    );
                    if (elements.length > 0) {
                        GM_notification({
                            text: "点击前往", // 通知的文本内容
                            title: `Keylol有消息！`, // 通知的标题（可选）
                            timeout: 1000 * timeout, // 通知显示的时间（毫秒），过了时间后通知会自动关闭（可选）
                            onclick: function () {
                                window.open(
                                    "https://keylol.com/home.php?mod=space&do=notice"
                                );
                            },
                        });
                    } else {
                        console.log(`${t}   keylol没有通知.`);
                    }
                },
                onerror: function (error) {
                    console.error(error); // 处理错误
                },
            });
            GM_setValue("lastExecutionTimestamp", currentTimestamp);
        }
        function getBriefTime(d) {
            d = d ? new Date() : new Date();
            // 获取小时、分钟和秒
            let hours = d.getHours();
            let minutes = d.getMinutes();
            let seconds = d.getSeconds();
            // 格式化小时、分钟和秒，确保它们始终是两位数
            hours = (hours < 10 ? "0" : "") + hours;
            minutes = (minutes < 10 ? "0" : "") + minutes;
            seconds = (seconds < 10 ? "0" : "") + seconds;
            const currentTime = hours + ":" + minutes + ":" + seconds;
            // 返回当前时间
            return currentTime;
        }
    }
}
)();