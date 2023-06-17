// ==UserScript==
// @name         知乎盐选专栏爬取并下载为 txt
// @author       shiquda
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1
// @description  将知乎的盐选专栏自动爬取打包为 txt 文件，在知乎盐选专栏主页面生效。
// @match        https://www.zhihu.com/xen/market/remix/paid_column/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    function getIdFromElement(element) {
        const dataZaExtraModule = element.getAttribute("data-za-extra-module")
        // 检查元素是否包含 data-za-extra-module 属性
        if (dataZaExtraModule) {
            try {
                const extraModule = JSON.parse(dataZaExtraModule);
                const card = extraModule.card;

                if (card && card.content && card.content.id) {
                    return card.content.id;
                }
            } catch (error) {
                console.error("解析 JSON 失败:", error);
            }
        }

        return null;
    }


    // 获取小说标题
    function getNovelTitle() {
        const titleElement = document.querySelector('.HeaderInfo-title-h6ouo').lastChild;
        return titleElement ? titleElement.textContent.trim() : 'Unknown Title';
    }
    // 获取作者
    function getAuthor() {
        const authorElement = document.querySelector('.HeaderInfo-subTitle-oXPCU');
        return authorElement ? authorElement.textContent.trim() : 'Unknown Author';
    }
    // 获取简介
    function getIntroSummary() {
        const inrtoElement = document.querySelector('.IntroSummary-richText-emmXR');
        return inrtoElement ? inrtoElement.textContent.trim() : 'Unknown IntroSummary';

    }
    // 获取所有章节链接
    function getChapterLink() {
        const chapterElements = document.querySelectorAll(".ChapterItem-root-aNY7j")
        const chapterLink = []
        const baseurl = window.location.href
        let modifiedUrl = baseurl.replace(/\/xen/, '').replace(/\/remix/, '')
        for (var i = 0; i < chapterElements.length; i++) {
            var id = getIdFromElement(chapterElements[i])
            if (id) {
                chapterLink.push(`${modifiedUrl}/section/${id}`)
            }
        }
        return chapterLink
    }


    // 获取章节内容
    async function getChapterContent(url) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const contentElement = doc.querySelector('#manuscript');
            const titleElement = doc.querySelector('.ManuscriptTitle-root-gcmVk');
            const title = titleElement ? titleElement.textContent : 'Unknown Title';
            const content = contentElement ? contentElement.textContent : '';
            //console.log([content, title]);
            return [content, title];
        } catch (error) {
            console.error('请求章节内容失败:', error);
            throw error;
        }
    }




    // 创建 txt 文件
    async function createTextFile(title, chapters) {
        let text = '';

        let author = getAuthor()
        let introSummary = getIntroSummary()



        text = `${title}\n\n作者：${author} \n\n简介：\n${introSummary}\n\n`

        // 拼接所有章节内容
        chapters.forEach((chapter, index) => {
            const chapterTitle = `第 ${index + 1} 章`;
            text += `${chapterTitle} ${chapter[1]}\n\n${chapter[0]}\n\n`;
        });

        //创建文本文件
        const blob = new Blob([text], { type: 'text/plain' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = `${title} ${author}.txt`;
        downloadLink.click();
    }

    function unfold() {
        document.querySelector(".IntroSummary-expandButton-iZSs9").click()
        document.querySelector(".CatalogModule-allSection-ctqBJ").click()
    }

    //主函数
    async function main() {
        const btn = document.querySelector("#s_btn")

        const title = getNovelTitle();
        const chapters = [];
        const chapterLinks = getChapterLink()

        btn.textContent = `读取中 0/${chapterLinks.length}`

        //获取每个章节的内容
        for (let i = 0; i < chapterLinks.length; i++) {
            const chapterLink = chapterLinks[i];
            // console.log(chapterLink)
            const chapterContent = await getChapterContent(chapterLink);
            chapters.push(chapterContent);
            btn.textContent = `读取中 ${i + 1}/${chapterLinks.length}`
        }

        // 创建 txt 文件
        createTextFile(title, chapters);
        btn.textContent = `下载完成！`
    }

    function createUI() {
        var button = document.createElement('button');
        button.innerText = '下载为txt';
        button.id = "s_btn"
        button.style.cssText = 'position: fixed; top: 50%; left: 10px; transform: translateY(-50%); padding: 10px; background: #337ab7; color: #fff; border: none; border-radius: 4px; cursor: pointer;';
        button.addEventListener('click', main);
        document.body.appendChild(button);
    }

    createUI()

    setTimeout(unfold, 1500)

})();