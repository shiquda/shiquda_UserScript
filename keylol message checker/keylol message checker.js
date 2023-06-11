// ==UserScript==
// @name         keylol检测是否有通知
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  keylol检测是否有通知，在指定间隔下运行
// @author       shiquda
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=keylol.com
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function () {
    const interval = 5; // 检测间隔，单位是分钟



    var lastExecutionTimestamp = GM_getValue("lastExecutionTimestamp");
    var currentTimestamp = new Date().getTime();
    if (
        !lastExecutionTimestamp ||
        currentTimestamp - lastExecutionTimestamp > interval * 60 * 1000
    ) check()
    else {
        // console.log(`时间间隔在${interval}分钟内`);
        return;
    }
    setTimeout(check, (interval * 60 + 1) * 1000)



    function check() {
        // 执行脚本的代码
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
                        title: "Keylol有消息！", // 通知的标题（可选）
                        timeout: 5000, // 通知显示的时间（毫秒），过了时间后通知会自动关闭（可选）
                        onclick: function () {
                            window.open(
                                "https://keylol.com/home.php?mod=space&do=notice"
                            );
                        },
                    });
                } else console.log("keylol没有通知。");
                /*            else {
                GM_notification({
                    text: '点击前往',  // 通知的文本内容
                    title: 'Keylol没有消息。',  // 通知的标题（可选）
                    timeout: 5000,  // 通知显示的时间（毫秒），过了时间后通知会自动关闭（可选）
                    onclick: function() {
                        window.open("https://keylol.com/home.php?mod=space&do=notice");
                        }
                    })
            }
            */
            },
            onerror: function (error) {
                console.error(error); // 处理错误
            },
        });
        GM_setValue("lastExecutionTimestamp", currentTimestamp);
    }
})();
