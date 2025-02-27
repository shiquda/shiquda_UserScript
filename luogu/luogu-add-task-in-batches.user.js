// ==UserScript==
// @name         洛谷批量添加做题计划
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1.0
// @description  This UserScript adds a batch task addition feature to Luogu.
// @author       shiquda
// @match        https://www.luogu.com.cn/
// @match        https://www.luogu.com/
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    // 创建UI
    function createUI() {
        let target;
        for (const item of document.querySelectorAll('.lg-article')) {
            // 如果包含“任务计划”
            if (item.innerText.includes('任务计划')) {
                target = item;
                break;
            }
        }

        if (!target) {
            return;
        }

        let div = document.createElement('div');
        div.innerHTML = `
                <div class="am-u-md-11">
                    <div class="lg-article lg-index-stat">
                        <h2>批量添加任务</h2>
                        <div class="am-input-group am-input-group-primary am-input-group-sm">
                            <textarea type="text" class="am-form-field" placeholder="P1001" name="addproblem"></textarea>
                        </div>
                        <p>
                            <button class="am-btn am-btn-danger am-btn-sm add-in-batch-btn" name="add">添加</button>
                            <button class="am-btn am-btn-danger am-btn-sm" name="clear">清空</button>
                        </p>
                    </div>
                </div>
`;
        target.insertAdjacentElement('afterend', div);

        document.querySelector('.add-in-batch-btn').addEventListener('click', addInBatch);
        document.querySelector('button[name="clear"]').addEventListener('click', () => {
            document.querySelector('textarea[name="addproblem"]').value = '';
        });
    }

    // 批量添加任务
    function addInBatch() {
        let problem = document.querySelector('textarea[name="addproblem"]').value;
        let problemList = problem.match(/\w+/g);
        if (problemList) {
            problemList.forEach((item, index) => {
                setTimeout(() => {
                    addRequest(item);
                }, index * 100); // 延时100ms防止请求过多
            });
        }
    }

    // 发送添加请求
    function addRequest(task) {
        const url = "https://www.luogu.com.cn/fe/api/problem/tasklistAdd";
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({ pid: task }));
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
            } else if (xhr.readyState === 4) {
                console.error(`Error adding task ${task}: ${xhr.status}`);
            }
        };
    }

    // 初始化UI
    createUI();
})();
