// ==UserScript==
// @name         Easy Web Page to Markdown
// @namespace    http://tampermonkey.net/
// @version      0.3.14
// @description  Convert selected HTML to Markdown
// @author       ExactDoug (forked from shiquda)
// @match        *://*/*
// @namespace    https://github.com/ExactDoug/webpage_to_markdown_userscript
// @supportURL   https://github.com/ExactDoug/webpage_to_markdown_userscript/issues
// @updateURL   https://raw.githubusercontent.com/ExactDoug/webpage_to_markdown_userscript/main/General/html2md.user.js
// @downloadURL https://raw.githubusercontent.com/ExactDoug/webpage_to_markdown_userscript/main/General/html2md.user.js
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js
// @require      https://unpkg.com/turndown/dist/turndown.js
// @require      https://unpkg.com/@guyplusplus/turndown-plugin-gfm/dist/turndown-plugin-gfm.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.0/marked.min.js
// @license      AGPL-3.0
// ==/UserScript==


(function () {
    'use strict';

    // User Config
    // Short cut

    const shortCutUserConfig = {
        /* Example:
        "Shift": false,
        "Ctrl": true,
        "Alt": false,
        "Key": "m"
        */
    }

    // Obsidian
    const obsidianEnabledUserConfig = false; // Set to true to enable Obsidian functionality
    const obsidianUserConfig = {
        /* Example:
            "my note": [
                "Inbox/Web/",
                "Collection/Web/Reading/"
            ]
        */
    }

    const guide = `
- Use **Arrow Keys** to select elements
    - Up: Select parent element
    - Down: Select first child element
    - Left: Select previous sibling element
    - Right: Select next sibling element
- Use **Mouse Wheel** to zoom in/out
    - Up: Select parent element
    - Down: Select first child element
- Click to select element
- Press \`Esc\` to cancel selection
    `

    // Global variables
    var isSelecting = false;
    var selectedElement = null;
    let shortCutConfig, obsidianEnabled, obsidianConfig;
    // Read configuration
    // Initialize shortcut key configuration
    let storedShortCutConfig = GM_getValue('shortCutConfig');
    if (Object.keys(shortCutUserConfig).length !== 0) {
        GM_setValue('shortCutConfig', JSON.stringify(shortCutUserConfig));
        shortCutConfig = shortCutUserConfig;
    } else if (storedShortCutConfig) {
        shortCutConfig = JSON.parse(storedShortCutConfig);
    }

    // Initialize Obsidian enabled setting
    let storedObsidianEnabled = GM_getValue('obsidianEnabled');
    if (storedObsidianEnabled !== undefined) {
        obsidianEnabled = storedObsidianEnabled;
    } else {
        obsidianEnabled = obsidianEnabledUserConfig;
        GM_setValue('obsidianEnabled', obsidianEnabled);
    }

    // Initialize Obsidian configuration (only if enabled)
    if (obsidianEnabled) {
        let storedObsidianConfig = GM_getValue('obsidianConfig');
        if (Object.keys(obsidianUserConfig).length !== 0) {
            GM_setValue('obsidianConfig', JSON.stringify(obsidianUserConfig));
            obsidianConfig = obsidianUserConfig;
        } else if (storedObsidianConfig) {
            obsidianConfig = JSON.parse(storedObsidianConfig);
        }
    }



    // HTML2Markdown
    function convertToMarkdown(element) {
        var html = element.outerHTML;
        return turndownService.turndown(html);
    }


    // Preview
    function showMarkdownModal(markdown) {
        const obsidianButtonHtml = obsidianEnabled
            ? '<select class="h2m-obsidian-select">Send to Obsidian</select>'
            : '';

        var $modal = $(`
                    <div class="h2m-modal-overlay">
                        <div class="h2m-modal">
                            <textarea></textarea>
                            <div class="h2m-preview"></div>
                            <div class="h2m-buttons">
                                <button class="h2m-copy">Copy to clipboard</button>
                                <button class="h2m-download">Download as MD</button>
                                ${obsidianButtonHtml}
                            </div>
                            <button class="h2m-close">X</button>
                        </div>
                    </div>
                `);

        $modal.find('textarea').val(markdown);
        $modal.find('.h2m-preview').html(marked.parse(markdown));

        if (obsidianEnabled) {
            $modal.find('.h2m-obsidian-select').append($('<option>').val('').text('Send to Obsidian'));
            for (const vault in obsidianConfig) {
                for (const path of obsidianConfig[vault]) {
                    // Insert element
                    const $option = $('<option>')
                        .val(`obsidian://advanced-uri?vault=${vault}&filepath=${path}`)
                        .text(`${vault}: ${path}`);
                    $modal.find('.h2m-obsidian-select').append($option);
                }
            }
        }

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


        $modal.find('.h2m-copy').on('click', function () { // Copy to clipboard
            GM_setClipboard($modal.find('textarea').val());
            $modal.find('.h2m-copy').text('Copied!');
            setTimeout(() => {
                $modal.find('.h2m-copy').text('Copy to clipboard');
            }, 1000);
        });

        $modal.find('.h2m-download').on('click', function () { // Download
            var markdown = $modal.find('textarea').val();
            var blob = new Blob([markdown], { type: 'text/markdown' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            // Current page title + time
            a.download = `${document.title}-${new Date().toISOString().replace(/:/g, '-')}.md`;
            a.click();
        });

        if (obsidianEnabled) {
            $modal.find('.h2m-obsidian-select').on('change', function () { // Send to Obsidian
                const val = $(this).val();
                if (!val) return;
                const markdown = $modal.find('textarea').val();
                GM_setClipboard(markdown);
                const title = document.title.replaceAll(/[\\/:*?"<>|]/g, '_'); // File name cannot contain any of the following characters: * " \ / < > : | ?
                const url = `${val}${title}.md&clipboard=true`;
                window.open(url);
            });
        }

        $modal.find('.h2m-close').on('click', function () { // Close button X
            $modal.remove();
        });

        // Sync scrolling
        // Get two elements
        var $textarea = $modal.find('textarea');
        var $preview = $modal.find('.h2m-preview');
        var isScrolling = false;

        // When textarea scrolls, set preview scroll position
        $textarea.on('scroll', function () {
            if (isScrolling) {
                isScrolling = false;
                return;
            }
            var scrollPercentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
            $preview[0].scrollTop = scrollPercentage * ($preview[0].scrollHeight - $preview[0].offsetHeight);
            isScrolling = true;
        });

        // When preview scrolls, set textarea scroll position
        $preview.on('scroll', function () {
            if (isScrolling) {
                isScrolling = false;
                return;
            }
            var scrollPercentage = this.scrollTop / (this.scrollHeight - this.offsetHeight);
            $textarea[0].scrollTop = scrollPercentage * ($textarea[0].scrollHeight - $textarea[0].offsetHeight);
            isScrolling = true;
        });

        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('.h2m-modal-overlay').length > 0) {
                $('.h2m-modal-overlay').remove();
            }
        });

        $('body').append($modal);
    }

    // Start selecting
    function startSelecting() {
        $('body').addClass('h2m-no-scroll'); // Prevent page scrolling
        isSelecting = true;
        // Operation guide
        tip(marked.parse(guide));
    }

    // End selecting
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

    // Turndown configuration
    var turndownPluginGfm = TurndownPluginGfmService;
    var turndownService = new TurndownService({ codeBlockStyle: 'fenced' });

    turndownPluginGfm.gfm(turndownService); // Import all plugins

    // Remove metadata/non-content elements that should not appear in markdown output
    turndownService.remove(['script', 'style', 'noscript']);

    // Custom rule to normalize whitespace in link text
    // Turndown can produce links like "[\n\n  text  \n\n](url)" when <a> wraps block elements
    // This collapses whitespace to produce clean "[text](url)" format
    turndownService.addRule('normalizeLinkText', {
        filter: 'a',
        replacement: function (content, node) {
            // Collapse whitespace inside link text
            const text = content.replace(/\s+/g, ' ').trim();

            const href = node.getAttribute('href') || '';
            const title = node.getAttribute('title');

            if (!href) return text; // no href? just return plain text

            const titlePart = title ? ' "' + title.replace(/"/g, '\\"') + '"' : '';
            return '[' + text + '](' + href + titlePart + ')';
        }
    });

    // turndownService.addRule('strikethrough', {
    //     filter: ['del', 's', 'strike'],
    //     replacement: function (content) {
    //         return '~' + content + '~'
    //     }
    // });

    // turndownService.addRule('latex', {
    //     filter: ['mjx-container'],
    //     replacement: function (content, node) {
    //         const text = node.querySelector('img')?.title;
    //         const isInline = !node.getAttribute('display');
    //         if (text) {
    //             if (isInline) {
    //                 return '$' + text + '$'
    //             }
    //             else {
    //                 return '$$' + text + '$$'
    //             }
    //         }
    //         return '';
    //     }
    // });




    // Add CSS styles
    GM_addStyle(`
        .h2m-selection-box {
            border: 2px dashed #f00;
            background-color: rgba(255, 0, 0, 0.2);
        }
        .h2m-no-scroll {
            overflow: hidden;
            z-index: 9997;
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
        .h2m-modal textarea {
            width: 50%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            color: #333;
            background-color: #fff;
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        .h2m-modal .h2m-preview {
            all: initial;
            display: block;
            width: 50%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #333;
            background-color: #fff;
        }
        .h2m-modal .h2m-preview * {
            all: revert;
            color: inherit;
        }
        .h2m-modal .h2m-preview pre {
            background-color: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 12px 16px;
            overflow-x: auto;
        }
        .h2m-modal .h2m-preview code {
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 14px;
        }
        .h2m-modal .h2m-preview :not(pre) > code {
            background-color: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
        }
        .h2m-modal .h2m-buttons {
            position: absolute;
            bottom: 10px;
            right: 10px;
        }
        .h2m-modal .h2m-buttons button,
        .h2m-modal .h2m-obsidian-select {
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
        .h2m-modal .h2m-buttons button:hover,
        .h2m-modal .h2m-obsidian-select:hover {
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
            font-size: 16px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
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

    // Register trigger
    shortCutConfig = shortCutConfig ? shortCutConfig : {
        "Shift": false,
        "Ctrl": true,
        "Alt": false,
        "Key": "m"
    };
    $(document).on('keydown', function (e) {
        if (e.ctrlKey === shortCutConfig['Ctrl'] &&
            e.altKey === shortCutConfig['Alt'] &&
            e.shiftKey === shortCutConfig['Shift'] &&
            e.key.toUpperCase() === shortCutConfig['Key'].toUpperCase()) {
            e.preventDefault();
            startSelecting();
        }
        // else {
        //     console.log(e.ctrlKey, e.altKey, e.shiftKey, e.key.toUpperCase());
        // }
    });
    // $(document).on('keydown', function (e) {
    //     if (e.ctrlKey && e.key === 'm') {
    //         e.preventDefault();
    //         startSelecting()
    //     }
    // });

    GM_registerMenuCommand('Convert to Markdown', function () {
        startSelecting()
    });



    $(document).on('mouseover', function (e) { // Start selecting
        if (isSelecting) {
            $(selectedElement).removeClass('h2m-selection-box');
            selectedElement = e.target;
            $(selectedElement).addClass('h2m-selection-box');
        }
    }).on('wheel', function (e) { // Mouse wheel event
        if (isSelecting) {
            e.preventDefault();
            if (e.originalEvent.deltaY < 0) {
                selectedElement = selectedElement.parentElement ? selectedElement.parentElement : selectedElement; // Expand
                if (selectedElement.tagName === 'HTML' || selectedElement.tagName === 'BODY') {
                    selectedElement = selectedElement.firstElementChild;
                }
            } else {
                selectedElement = selectedElement.firstElementChild ? selectedElement.firstElementChild : selectedElement; // Shrink
            }
            $('.h2m-selection-box').removeClass('h2m-selection-box');
            $(selectedElement).addClass('h2m-selection-box');
        }
    }).on('keydown', function (e) { // Keyboard event
        if (isSelecting) {
            e.preventDefault();
            if (e.key === 'Escape') {
                endSelecting();
                return;
            }
            switch (e.key) { // Arrow keys: up down left right
                case 'ArrowUp':
                    selectedElement = selectedElement.parentElement ? selectedElement.parentElement : selectedElement; // Expand
                    if (selectedElement.tagName === 'HTML' || selectedElement.tagName === 'BODY') { // Exclude HTML and BODY
                        selectedElement = selectedElement.firstElementChild;
                    }
                    break;
                case 'ArrowDown':
                    selectedElement = selectedElement.firstElementChild ? selectedElement.firstElementChild : selectedElement; // Shrink
                    break;
                case 'ArrowLeft': // Find previous element, if it's the last child, select parent's next sibling until an element is found
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
            $(selectedElement).addClass('h2m-selection-box'); // Update selected element style
        }
    }
    ).on('mousedown', function (e) { // Mouse event, using mousedown to prevent triggering other events after clicking element
        if (isSelecting) {
            e.preventDefault();
            var markdown = convertToMarkdown(selectedElement);
            showMarkdownModal(markdown);
            endSelecting();
        }
    });

})();
