// ==UserScript==
// @name         Coursera Screenshot Downloader
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.2
// @description  Add screenshot functionality to all videos
// @author       shiquda
// @match        https://www.coursera.org/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    // Camera icon SVG
    const cameraSVG = `<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
  <path d="M4 4h3l2-2h6l2 2h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"/>
</svg>`;

    // Function to replace invalid filename characters with underscores
    function sanitizeFilename(filename) {
        return filename.replace(/[<>:"/\\|?*]+/g, '_');
    }

    // Initialize video elements
    function initVideos() {
        // Get all video elements
        const videos = document.querySelectorAll('video');

        videos.forEach(video => {
            // Avoid adding button multiple times
            if (video.dataset.screenshotAdded) return;
            video.dataset.screenshotAdded = "true";

            // Create screenshot button
            const btn = document.createElement('button');
            btn.innerHTML = cameraSVG;
            btn.style.cssText = `
                bottom: 40px;
                right: 10px;
                background: rgba(0,0,0,0.5);
                border: none;
                border-radius: 4px;
                padding: 5px;
                cursor: pointer;
                color: white;
                z-index: 9999;
            `;

            // Add button to video container
            const container = video.parentNode.querySelector('.icon-container') || video.parentNode;
            container.style.position = 'relative';
            container.appendChild(btn);

            // Add click event
            btn.addEventListener('click', () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);

                    const link = document.createElement('a');
                    const currentTime = Math.floor(video.currentTime);
                    const pageTitle = document.title;
                    const sanitizedTitle = sanitizeFilename(pageTitle);
                    link.download = `${sanitizedTitle}_${currentTime}s.png`;
                    link.href = canvas.toDataURL();
                    link.click();
                } catch (error) {
                    console.error('Screenshot failed:', error);
                }
            });
        });
    }

    // Observe DOM changes for dynamically loaded content
    const observer = new MutationObserver(mutations => {
        if (document.querySelector('video')) initVideos();
    });

    // Start observing the entire document
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial execution
    initVideos();
})();