// ==UserScript==
// @name                Advanced Search Assistant for Google
// @name:zh-CN          Google 高级搜索助手
// @namespace           http://tampermonkey.net/
// @version             0.1.0
// @description         Add an advanced search form to the top of the page
// @description:zh-CN   在谷歌搜索页面顶部添加一个高级搜索表单
// @author              shiquda
// @namespace           https://github.com/shiquda/shiquda_UserScript
// @supportURL          https://github.com/shiquda/shiquda_UserScript/issues
// @match               *://www.google.com/search*
// @grant               GM_addStyle
// @grant               GM_setValue
// @grant               GM_getValue
// @license             MIT
// ==/UserScript==

(function () {
    'use strict';
    const style = `
    #advancedSearchToggleButton {
        margin-right: 10px;
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
    }


    #advancedSearchFormContainer {
        position: fixed;
        top: 130px;
        left: 40px;
        display: none;
        background: #fff;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        font-size: 14px;
        font-weight: bold;
    }


    #advancedSearchFormContainer label {
        display: block;
        margin-top: 5px;
    }


    #advancedSearchFormContainer input[type="text"] {
        margin-top: 5px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    #advancedSearchFormContainer select {
        margin-top: 5px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    #advancedSearchFormContainer button {
        border: none;
        border-radius: 5px;
        background-color: #007bff;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        margin: 20px;
    }
    `
    GM_addStyle(style)
    // 创建按钮和表单元素
    const toggleButton = document.createElement('button');
    toggleButton.className = 'nfSF8e';
    toggleButton.textContent = '高级搜索';
    toggleButton.id = 'advancedSearchToggleButton'
    document.querySelector('.logo').appendChild(toggleButton);

    const formContainer = document.createElement('div');
    formContainer.id = 'advancedSearchFormContainer'
    formContainer.addEventListener('click', function (event) {
        // Hide the form container when clicking outside of it
        if (!form.contains(event.target)) {
            formContainer.style.display = 'none';
        }
    });
    document.body.appendChild(formContainer);

    // 创建表单元素
    const form = document.createElement('form');
    formContainer.appendChild(form);

    const params = {
        'as_q': '以下所有字词：',
        'as_epq': '与以下字词完全匹配：',
        'as_oq': '以下任意字词：',
        'as_eq': '排除以下字词：',
        'as_nlo': "包含的数字范围：从",
        'as_nhi': "到：",
        // 'lr': '语言：',
        // 'cr': '地区：',
        'as_qdr': '最后更新时间：',
        'as_sitesearch': '网站或域名：',
        // 'as_occt': '字词出现位置：',
        'as_filetype': '文件类型：',
        // 'tbs': '使用权限：',
    };

    for (const param in params) {
        const label = document.createElement('label');
        label.textContent = params[param]; // 使用 params[param] 获取参数名称对应的中文解释
        const input = document.createElement('input');
        input.name = param;
        input.type = 'text';
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(document.createElement('br'));
    }

    // 在原有代码的这个位置插入新代码
    const timeOptions = {
        '': '请选择',
        'd': '一天内',
        'w': '一周内',
        'm': '一月内',
        'y': '一年内',
    };

    const timeLabel = document.createElement('label');
    timeLabel.textContent = '最后更新时间：';
    const timeSelect = document.createElement('select');
    timeSelect.name = 'as_qdr';

    for (const key in timeOptions) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = timeOptions[key];
        timeSelect.appendChild(option);
    }

    form.appendChild(timeLabel);
    form.appendChild(timeSelect);
    form.appendChild(document.createElement('br'));

    const searchButton = document.createElement('button');
    searchButton.textContent = '搜索';
    searchButton.className = 'nfSF8e';
    form.appendChild(searchButton);

    // Add a clear button to reset the form
    const clearButton = document.createElement('button');
    clearButton.textContent = '清空';
    clearButton.className = 'nfSF8e';
    clearButton.addEventListener('click', function (event) {
        event.preventDefault();
        form.reset();
    });
    form.appendChild(clearButton);

    // Load saved data and fill the form when opening a new page
    window.addEventListener('load', function () {
        for (const param in params) {
            const savedValue = GM_getValue(param);
            if (savedValue) {
                form[param].value = savedValue;
            }
        }
    });

    // Save form data to Greasemonkey storage
    form.addEventListener('input', function () {
        for (const param in params) {
            GM_setValue(param, form[param].value);
        }
    });

    // 在按钮点击时切换表单可见性
    toggleButton.addEventListener('click', function (event) {
        event.preventDefault();
        let status = formContainer.style.display;
        status = status === 'none' || status === '' ? 'block' : 'none';
        formContainer.style.display = status;
    });

    // 在表单提交时进行高级搜索
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const searchParams = new URLSearchParams();
        for (const param in params) {
            const value = form[param].value;
            if (value) {
                searchParams.set(param, value);
            }
        }
        const searchUrl = 'https://www.google.com/search?' + searchParams.toString();
        window.location.href = searchUrl;
    });
})();
