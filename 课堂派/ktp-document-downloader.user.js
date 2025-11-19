// ==UserScript==
// @name         Ketangpai Document Downloader
// @namespace    https://shiquda.link/
// @version      0.1.1
// @description  Can be used to download blocked files
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

    }

    function getImageLinks() {
        return Array.from(document.querySelectorAll('img')).map((img) => img.src).filter((src) => src.startsWith('http'));
    }

    function useMessageToDownloadPDF(imageLinksMessage) {
        const imageLinks = imageLinksMessage.imageLinks;
        const imgProps = imageLinksMessage.imgProps;
        console.log('PDF conversion received links', imageLinks);

        console.log('Image properties', imgProps);
        const pdf = new jspdf.jsPDF({
            orientation: "landscape",
            unit: "px",
            format: [imgProps.width, imgProps.height],
            hotfixes: ["px_scaling"]
        });

        let imageDownloadCache = {};
        // key is link, value is base64 encoded image
        for (let link of imageLinks) {
            imageDownloadCache[link] = null;
        }

        let imageDownloadPromises = imageLinks.map(link => new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: link,
                responseType: 'arraybuffer',
                onload: function (response) {
                    console.log('Image download response', response);
                    const blob = new Blob([response.response], { type: 'image/jpeg' });
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const base64 = e.target.result;
                        imageDownloadCache[link] = base64;
                        resolve(); // Image loading complete
                    }
                    reader.readAsDataURL(blob);
                },
                onerror: function (error) {
                    reject(error); // Handle download error
                }
            });
        }));

        // Save PDF after all images are loaded
        Promise.all(imageDownloadPromises).then(() => {
            console.log('All images downloaded');
            imageLinks.forEach((link, i) => {
                const base64 = imageDownloadCache[link];
                console.log('Adding image', base64);
                pdf.addImage(base64, 'JPEG', 0, 0, imgProps.width, imgProps.height);
                if (i !== imageLinks.length - 1) {
                    pdf.addPage();
                }
            });
            // Provide a default PDF title in case page element text cannot be obtained
            const title = document.querySelector('.mgr-16') ? document.querySelector('.mgr-16').textContent : "Downloaded_Images";
            pdf.save(title);
        }).catch(error => {
            console.error('Error downloading images or adding to PDF: ', error);
        });
    }



    // Start
    let pdf = new jspdf.jsPDF();

    // Check if it's an iframe
    if (window.parent === window) {
        GM_addValueChangeListener('imageLinks', function (imageLinks, old_value, new_value, remote) {
            console.log('imageLinks changed');
            useMessageToDownloadPDF(new_value);
        })
    } else {
        // Is iframe
        const donwloadButton = document.createElement('button');
        donwloadButton.innerText = 'Download as PDF';
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
            }, 500);
        });
        document.body.appendChild(donwloadButton);
        loadImages();

    }

})();