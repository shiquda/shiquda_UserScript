// ==UserScript==
// @name         Steamtools auto turn to Chinese
// @namespace    shiquda
// @version      0.1
// @description  Steamtools auto turn to Chinese
// @author       shiquda
// @match        https://www.steamtools.net/
// @run-at       document-start
// ==/UserScript==
 
(function() {
    "use strict";
    if (window.location.href.indexOf("zn.html") == -1) {
          window.location.href = window.location.href + 'zn.html';
    }
})();
