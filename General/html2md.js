// ==UserScript==
// @name         Easy Web Page to Markdown
// @name:zh      网页转Markdown工具
// @namespace    http://tampermonkey.net/
// @version      0.2.0
// @description  Convert selected HTML to Markdown
// @description:zh 将选定的HTML转换为Markdown
// @author       shiquda
// @match        *://*/*
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @require      https://unpkg.com/turndown/dist/turndown.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.0/marked.min.js
// @license      AGPL-3.0
// ==/UserScript==


(function () {
    'use strict';

    // 选择使用指南，Markdown
    const guide = `

- 使用**方向键**选择元素
    - 上：选择父元素
    - 下：选择第一个子元素
    - 左：选择上一个兄弟元素
    - 右：选择下一个兄弟元素
- 使用**滚轮**放大缩小
    - 上：选择父元素
    - 下：选择第一个子元素
- 点击元素选择
- 按下 \`Esc\` 键取消选择
    `

    // Create Turndown service
    var turndownService = new TurndownService({ codeBlockStyle: 'fenced' });
    turndownService.addRule('strikethrough', {
        filter: ['del', 's', 'strike'],
        replacement: function (content) {
            return '~' + content + '~'
        }
    })


    // Add CSS for the selection box and the modal
    GM_addStyle(`
        .h2m-selection-box {
            border: 2px dashed #f00;
            background-color: rgba(255, 0, 0, 0.2);
        }
        .h2m-no-scroll {
            overflow: hidden;
        }
        .h2m-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 80%;
            height: 80%;
            background: white;
            border-radius: 10px;
            display: flex;
            flex-direction: row;
            z-index: 9999;
        }
        .h2m-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9998;
        }
        .h2m-modal textarea,
        .h2m-modal .h2m-preview {
            width: 50%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
        }
        .h2m-modal .h2m-buttons {
            position: absolute;
            bottom: 10px;
            right: 10px;
        }
        .h2m-modal .h2m-buttons button {
            margin-left: 10px;
            background-color: #4CAF50; /* Green */
            border: none;
            color: white;
            padding: 13px 16px;
            border-radius: 10px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            transition-duration: 0.4s;
            cursor: pointer;
        }
        .h2m-modal .h2m-buttons button:hover {
            background-color: #45a049;
        }
        .h2m-modal .h2m-close {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            width: 25px;
            height: 25px;
            background-color: #f44336;
            color: white;
            font-size: 20px;
            border-radius: 50%;
            text-align: center;
            line-height: 25px;
        }
        .h2m-tip {
            position: fixed;
            top: 22%;
            left: 82%;
            transform: translate(-50%, -50%);
            background-color: white;
            border: 1px solid black;
            padding: 8px;
            z-index: 9999;
            border-radius: 10px;
            box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);
            background-color: rgba(255, 255, 255, 0.7);
        }
        
    `);



    var isSelecting = false;
    var selectedElement = null;

    $(document).on('mouseover', function (e) {
        if (isSelecting) {
            $(selectedElement).removeClass('h2m-selection-box');
            selectedElement = e.target;
            $(selectedElement).addClass('h2m-selection-box');
        }
    }).on('wheel', function (e) {
        if (isSelecting) {
            e.preventDefault();
            if (e.originalEvent.deltaY < 0) {
                selectedElement = selectedElement.parentElement ? selectedElement.parentElement : selectedElement; // 扩大
                if (selectedElement.tagName === 'HTML' || selectedElement.tagName === 'BODY') {
                    selectedElement = selectedElement.firstElementChild;
                }
            } else {
                selectedElement = selectedElement.firstElementChild ? selectedElement.firstElementChild : selectedElement; // 缩小
            }
            $('.h2m-selection-box').removeClass('h2m-selection-box');
            $(selectedElement).addClass('h2m-selection-box');
        }
    }).on('keydown', function (e) {
        if (isSelecting) {
            e.preventDefault();
            if (e.key === 'Escape') {
                endSelecting();
                return;
            }
            switch (e.key) {
                case 'ArrowUp':
                    selectedElement = selectedElement.parentElement ? selectedElement.parentElement : selectedElement; // 扩大
                    if (selectedElement.tagName === 'HTML' || selectedElement.tagName === 'BODY') {
                        selectedElement = selectedElement.firstElementChild;
                    }
                    break;
                case 'ArrowDown':
                    selectedElement = selectedElement.firstElementChild ? selectedElement.firstElementChild : selectedElement; // 缩小
                    break;
                case 'ArrowLeft': // 寻找上一个元素，若是最后一个子元素则选择父元素的下一个兄弟元素，直到找到一个元素
                    var prev = selectedElement.previousElementSibling;
                    while (prev === null && selectedElement.parentElement !== null) {
                        selectedElement = selectedElement.parentElement;
                        prev = selectedElement.previousElementSibling ? selectedElement.previousElementSibling.lastChild : null;
                    }
                    if (prev !== null) {
                        if (selectedElement.tagName === 'HTML' || selectedElement.tagName === 'BODY') {
                            selectedElement = selectedElement.firstElementChild;
                        }
                        selectedElement = prev;
                    }
                    break;
                case 'ArrowRight':
                    var next = selectedElement.nextElementSibling;
                    while (next === null && selectedElement.parentElement !== null) {
                        selectedElement = selectedElement.parentElement;
                        next = selectedElement.nextElementSibling ? selectedElement.nextElementSibling.firstElementChild : null;
                    }
                    if (next !== null) {
                        if (selectedElement.tagName === 'HTML' || selectedElement.tagName === 'BODY') {
                            selectedElement = selectedElement.firstElementChild;
                        }
                        selectedElement = next;
                    }
                    break;
            }

            $('.h2m-selection-box').removeClass('h2m-selection-box');
            $(selectedElement).addClass('h2m-selection-box');
        }
    }
    ).on('mousedown', function (e) {
        if (isSelecting) {
            e.preventDefault();
            var markdown = convertToMarkdown(selectedElement);
            showMarkdownModal(markdown);
            endSelecting();
        }
    });

    // HTML2Markdown
    function convertToMarkdown(element) {
        var html = element.outerHTML;
        let turndownMd = turndownService.turndown(html);
        turndownMd = turndownMd.replaceAll('[\n\n]', '[]');
        return turndownMd;
    }


    // 预览
    function showMarkdownModal(markdown) {
        var $modal = $(`
                <div class="h2m-modal-overlay">
                    <div class="h2m-modal">
                        <textarea>${markdown}</textarea>
                        <div class="h2m-preview">${marked.parse(markdown)}</div>
                        <div class="h2m-buttons">
                            <button class="h2m-copy">Copy to clipboard</button>
                            <button class="h2m-download">Download as MD</button>
                        </div>
                        <div class="h2m-close">X</div>
                    </div>
                </div>
            `);





        $modal.find('textarea').on('input', function () {
            // console.log("Input event triggered");
            var markdown = $(this).val();
            var html = marked.parse(markdown);
            // console.log("Markdown:", markdown);
            // console.log("HTML:", html);
            $modal.find('.h2m-preview').html(html);
        });

        $modal.on('keydown', function (e) {
            if (e.key === 'Escape') {
                $modal.remove();
            }
        });


        $modal.find('.h2m-copy').on('click', function () {
            GM_setClipboard($modal.find('textarea').val());
            $modal.find('.h2m-copy').text('Copied!');
            setTimeout(() => {
                $modal.find('.h2m-copy').text('Copy to clipboard');
            }, 1000);
        });

        $modal.find('.h2m-download').on('click', function () {
            var markdown = $modal.find('textarea').val();
            var blob = new Blob([markdown], { type: 'text/markdown' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            // 当前页面标题 + 时间
            a.download = `${document.title}-${new Date().toISOString().replace(/:/g, '-')}.md`;
            a.click();
        });

        $modal.find('.h2m-close').on('click', function () {
            $modal.remove();
        });

        // $modal.on('click', function (e) {
        //     if (e.target === this) {
        //         $modal.remove();
        //     }
        // });

        $('body').append($modal);
    }

    // 开始选择
    function startSelecting() {
        $('body').addClass('h2m-no-scroll');
        isSelecting = true;
        // 操作指南
        tip(marked.parse(guide));
    }

    // 结束选择
    function endSelecting() {
        isSelecting = false;
        $('.h2m-selection-box').removeClass('h2m-selection-box');
        $('body').removeClass('h2m-no-scroll');
        $('.h2m-tip').remove();
    }

    function tip(message, timeout = null) {
        var $tipElement = $('<div>')
            .addClass('h2m-tip')
            .html(message)
            .appendTo('body')
            .hide()
            .fadeIn(200);
        if (timeout === null) {
            return;
        }
        setTimeout(function () {
            $tipElement.fadeOut(200, function () {
                $tipElement.remove();
            });
        }, timeout);
    }




    $(document).on('keydown', function (e) {
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            startSelecting()
        }
    });

    // Register menu command
    GM_registerMenuCommand('Convert to Markdown', function () {
        startSelecting()
    });
})();
