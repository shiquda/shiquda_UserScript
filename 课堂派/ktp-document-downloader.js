// ==UserScript==
// @name         课堂派下载助手
// @namespace    https://shiquda.link/
// @version      0.1.0
// @description  可用于下载被禁止的文件
// @author       shiquda
// @match        *://document.ketangpai.com/*
// @match        *://www.ketangpai.com/#/resource_detail*
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @license      AGPL-3.0
// @require      https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js
// ==/UserScript==

(function () {
    'use strict';

    function loadImages() {
        // 滚到页面底部
        window.scrollTo(0, document.body.scrollHeight);
    }

    function getImageLinks() {
        return Array.from(document.querySelectorAll('img')).map((img) => img.src).filter((src) => src.startsWith('http'));
    }

    function useMessageToDownloadPDF(imageLinksMessage) {
        const imageLinks = imageLinksMessage.imageLinks;
        const imgProps = imageLinksMessage.imgProps;
        console.log('转换为PDF接受到的links', imageLinks);

        console.log('图片属性', imgProps);
        pdf = new jspdf.jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [imgProps.width, imgProps.height],
            hotfixes: ["px_scaling"]
        });

        // 创建一个Promise数组，用于等待所有图片加载完毕
        let promises = imageLinks.map((link, index) => new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: link,
                responseType: 'arraybuffer',
                onload: function (response) {
                    console.log(response);
                    const blob = new Blob([response.response], { type: 'image/jpeg' });
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64 = e.target.result;
                        pdf.addImage(base64, 'JPEG', 0, 0, imgProps.width, imgProps.height);
                        if (index < imageLinks.length - 1) {
                            pdf.addPage();
                        }
                        resolve();  // 当图片加载完毕，调用resolve
                    }
                    reader.readAsDataURL(blob);
                }
            });
        }));

        // 当所有图片都加载完毕，再保存PDF
        Promise.all(promises).then(() => {
            const title = document.querySelector('.mgr-16').textContent;
            pdf.save(title);
            console.log('下载完成');
        });
    }

    let pdf = new jspdf.jsPDF();



    // 判断是不是iframe
    if (window.parent === window) {
        GM_addValueChangeListener('imageLinks', function (imageLinks, old_value, new_value, remote) {
            console.log('imageLinks changed');
            useMessageToDownloadPDF(new_value);
        })
    } else {
        // 是iframe
        const donwloadButton = document.createElement('button');
        donwloadButton.innerText = '下载为PDF';
        donwloadButton.style.position = 'fixed';
        donwloadButton.style.top = '50px';
        donwloadButton.style.right = '30px';
        donwloadButton.style.zIndex = '9999';
        donwloadButton.addEventListener('click', () => {
            loadImages();
            setTimeout(() => {
                const imageLinks = getImageLinks();
                const imgProps = pdf.getImageProperties(imageLinks[0]);

                const imageLinksMessage = {
                    imageLinks: imageLinks,
                    imgProps: imgProps,
                    time: new Date().getTime()
                };
                GM_setValue('imageLinks', imageLinksMessage);
            }, 1500);
        });
        document.body.appendChild(donwloadButton);
        loadImages();

    }

})();