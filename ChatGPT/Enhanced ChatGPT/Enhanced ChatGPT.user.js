// ==UserScript==
// @name         Enhance ChatGPT User Experience
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  Enhance ChatGPT user experience by adding export and import functionality for dialogs
// @author       ChatGPT and shiquda
// @match        https://chat.openai.com/chat/*
// @match        https://chat.openai.com/chat
// @grant        none
// @license      MIT
// ==/UserScript==


(function () {
    'use strict';

    function createUI() {
        // Add export button to the page
        const exportBtn = document.createElement("button");
        exportBtn.innerHTML = "Export";
        exportBtn.style.position = "fixed";
        exportBtn.style.left = "20px";
        exportBtn.style.top = "20%";
        exportBtn.style.zIndex = "9999";
        exportBtn.style.padding = "8px 15px";
        exportBtn.style.backgroundColor = "#007bff";
        exportBtn.style.color = "#fff";
        exportBtn.style.border = "none";
        exportBtn.style.borderRadius = "5px";
        exportBtn.style.cursor = "pointer";
        document.body.appendChild(exportBtn);

        // Add import button to the page
        const importBtn = document.createElement("button");
        importBtn.innerHTML = "Preview";
        importBtn.style.position = "fixed";
        importBtn.style.left = "20px";
        importBtn.style.top = "30%";
        importBtn.style.zIndex = "9999";
        importBtn.style.padding = "8px 15px";
        importBtn.style.backgroundColor = "#007bff";
        importBtn.style.color = "#fff";
        importBtn.style.border = "none";
        importBtn.style.borderRadius = "5px";
        importBtn.style.cursor = "pointer";
        document.body.appendChild(importBtn);
        exportBtn.addEventListener("click", createMarkdown)
        // Preview
        importBtn.addEventListener("click", function () {
            console.log(createMarkdown(false))
            this.textContent = "Output in console, press F12 to view."
            function textBack() {
                importBtn.textContent = "Preview"
            }
            setTimeout(textBack, 2000)
            return
            var tab = document.createElement("div")
        })
    }
    createUI()
    // Export dialog function

    function createMarkdown(isDownload) {
        let dialog = "";
        const messages = document.querySelectorAll(".text-base");
        let count = 0
        var person
        for (const message of messages) {
            count % 2 === 0 ? person = "Me:" : person = "ChatGPT:"
            count++
            const text = message.textContent;
            // Check for line breaks
            const lines = text.split("\n");
            let lineText = "";
            for (const line of lines) {
                lineText += `* ${line}\n`;
            }
            dialog += `## ${person} \n${lineText}\n\n`;
        }
        const date = new Date();
        const dateStr = date.toLocaleString();
        const title = prompt("Enter dialog title:")
        if (title === null) return
        dialog = `# ${title}\n Time: ${dateStr}\n\n` + dialog
        if (!isDownload) {
            return dialog
        }
        const data = "data:text/plain;charset=utf-8," + encodeURIComponent(dialog);
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", data);
        downloadLink.setAttribute("download", title + ".md");
        document.body.appendChild(downloadLink);
        downloadLink.click();
    };
})();