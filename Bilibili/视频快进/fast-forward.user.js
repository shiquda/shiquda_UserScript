// ==UserScript==
// @name         Bilibili Video Fast Forward
// @namespace    https://github.com/shiquda/shiquda_UserScript
// @supportURL   https://github.com/shiquda/shiquda_UserScript/issues
// @version      0.1.0
// @description  Change long-press right arrow from speed-up playback to continuous fast-forward, similar to rewind
// @author       shiquda
// @match        https://*.bilibili.com/video/*
// @grant        none
// @icon         https://experiments.sparanoid.net/favicons/v2/www.bilibili.com.ico
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';

    const interval = 200; // Fast forward every 200 ms
    const fastForwardTime = 5; // Fast forward 5 seconds

    // Get video element
    let video = document.querySelector('video');

    let isLongPressing = false;
    let shouldFastForward = false;

    // Variable to store the timer ID
    let intervalId = null;

    // Listen for keydown events
    window.addEventListener('keydown', (event) => {
        // Check if it's the right arrow key
        if (event.key === 'ArrowRight') {
            isLongPressing = true;
            shouldFastForward = true;
            // If no timer is running, create a new timer
            if (intervalId === null) {
                intervalId = setInterval(() => {
                    if (shouldFastForward) {
                        video.currentTime += fastForwardTime;
                    } else {
                        clearInterval(intervalId);
                        intervalId = null;
                    }
                }, interval);
            }
        }
    });

    // Listen for keyup events
    window.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowRight') {
            isLongPressing = false;
            shouldFastForward = false;
        }
    });
})();
