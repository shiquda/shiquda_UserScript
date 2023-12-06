// ==UserScript==
// @name         Remove tracker from Youtube sharing URL
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1.1
// @description  This UserScript removes trackers from YouTube sharing URLs.
// @author       shiquda
// @match        https://www.youtube.com/watch?v=*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    function removeParam() {
        let url = document.querySelector('#share-url');
        if (url) {
            let urlObj = new URL(url.value);
            urlObj.searchParams.delete('si');
            url.value = urlObj.href;
            console.log(url.value);
        }
    }

    const observer = new MutationObserver((mutationsList, observer) => {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                let url = document.querySelector('#share-url');
                if (url) {
                    url.addEventListener('change', removeParam);
                    document.querySelector('#checkboxContainer').addEventListener('click', removeParam);
                    document.querySelector('#copy-button').addEventListener('click', removeParam)
                    document.querySelector('#input-2').addEventListener('blur', removeParam);
                    removeParam();
                }
            }
        }
    });

    observer.observe(document, { childList: true, subtree: true });
})();
