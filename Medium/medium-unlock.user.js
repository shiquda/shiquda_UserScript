// ==UserScript==
// @name           Medium Free
// @namespace      https://github.com/shiquda
// @version        1.1.0
// @description    Automatically detect Medium articles (including subdomains and custom domains) and replace the URL with archive.is/oldest/ to unlock Medium Posts.
// @author         origin by blacksev, fixed by shiquda
// @match          *://medium.com/*
// @match          *://*.medium.com/*
// @grant          none
// @license        MIT
// ==/UserScript==

(function () {
    "use strict";
    if (!document.scripts.length) {
        return;
    }
    if (document.body.outerHTML.lastIndexOf("cdn-client.medium.com") < 0) {
        return;
    }
    const key = encodeURIComponent('blacksev:Medium Unlock:Start');
    if (window[key]) {
        return;
    }
    window[key] = true;

    console.log("Here is Medium!!!!");

    const DragButton = function () {
    };
    DragButton.prototype = {
        // Window object
        win: window,
        // Draggable DOM element
        ele: null,
        // Default configuration
        options: {
            edge: true, // Whether to snap to edges, default snap
            extRoute: null, // Ext tag route for navigation
            elemId: 'medium-unlock-button', // Node ID where component will be loaded, default is body
            instance: 'archive.is'
        },
        // System variables
        data: {
            distanceX: 0,
            distanceY: 0
        },

        /**
         * @method Initialize
         * @param opts Configuration parameters provided by @method config()
         */
        init: function (opts) {
            const _this = this;
            const option = _this.config(opts, _this.options); // User configuration
            const _elem = document.getElementById(option.elemId) ? document.getElementById(option.elemId) : document.body;
            if (!_elem) {
                console.log("not find nodeId!!");
                return;
            }
            // Initialize drag button, load into _elem
            _this.initEle(_elem);
            // Register click event
            _this.ele.addEventListener('click', function () {
                _this.click();
            });
            // Register drag start event
            _this.ele.addEventListener('touchstart', function (event) {
                _this.touchstart(event);
            });
            // Register drag move event
            document.addEventListener(
                'touchmove',
                function (event) {
                    _this.touchmove(event);
                }, {// fix #3 #5
                passive: false
            });
            // Register drag end event
            document.addEventListener('touchend', function () {
                _this.touchend();
            });
        },
        /**
         * @method Configuration
         * @param opts { object } User-provided parameters, use default parameters if not provided
         * @param options { object } Default parameters
         * @return options { object } Returns a configuration object
         */
        config: function (opts, options) {
            // Default parameters
            if (!opts) {
                return options;
            }
            for (const key in opts) {
                if (!!opts[key]) {
                    options[key] = opts[key];
                }
            }
            return options;
        },

        /**
         * @method Initialize drag button, load into _elem
         * @param _elem { object } Specified mounting node
         * @return options { object } Returns a drag button
         */
        initEle: function (_elem) {
            const _this = this;
            // Create a div
            const ele = document.createElement('div');
            // Create SVG element via createElementNS and set attributes
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
            svg.setAttribute("class", "unlock-svg");
            svg.setAttribute("style", "width:100%;height:100%;vertical-align:unset;transition: color .1s;");
            svg.setAttribute("viewBox", "0 0 32 32");
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute("d", "M24 14H12V8a4 4 0 0 1 8 0h2a6 6 0 0 0-12 0v6H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V16a2 2 0 0 0-2-2zm0 14H8V16h16z");
            path.setAttribute("fill", "currentColor");

            svg.appendChild(path);

            // Add SVG element to page for display
            ele.appendChild(svg);

            ele.id = "drag_button_id";
            ele.className = "drag-button-div";

            // Styles
            ele.style.position = "fixed";
            ele.style.lineHeight = "4rem";
            ele.style.width = "4rem";
            ele.style.height = "4rem";
            ele.style.padding = "0.5rem";
            ele.style.textAlign = "center";
            ele.style.border = "5px solid #27ae60";
            ele.style.borderRadius = "99px";
            ele.style.color = "#fff";
            ele.style.opacity = "0.5";
            ele.style.backgroundColor = "#2ecc71";
            ele.style.backgroundClip = "padding-box";
            ele.style.textDecoration = "none";
            ele.style.top = "13em";
            ele.style.right = "0px";
            ele.style.zIndex = "1";
            ele.style.transition = "box-shadow .2s";

            // CSS control magic with JS
            const head = document.getElementsByTagName('head')[0];
            const style = document.createElement('style');
            const declarations = document.createTextNode('.drag-button-div:hover{ box-shadow: 0px 0 0 11px #FFF,  0px 0 0 10px #27ae60, 0px 0 0 50px #FFF inset;}.drag-button-div:active{ box-shadow: 0px 0 0 11px #27ae60,  0px 0 0 10px #27ae60, 0px 0 0 50px #FFF inset;}.drag-button-div:hover .unlock-svg{color:blue;}');
            style.type = 'text/css';
            if (style.styleSheet) {
                style.styleSheet.cssText = declarations.nodeValue;
            } else {
                style.appendChild(declarations);
            }
            head.appendChild(style);

            // Dynamically insert into body
            _elem.insertBefore(ele, _elem.lastChild);
            // Assign to global variable
            _this.ele = ele;
            // Initialize position
            let strStoreDistance = '';
            // Some Android devices don't support localStorage
            if (_this.ele.id && _this.win.localStorage && (strStoreDistance = localStorage['Inertia_' + _this.ele.id])) {
                const arrStoreDistance = strStoreDistance.split(',');
                _this.ele.distanceX = +arrStoreDistance[0];
                _this.ele.distanceY = +arrStoreDistance[1];
                _this.ele = _this.fnTranslate(_this.ele, _this.ele.distanceX, _this.ele.distanceY);
            }
            // Show drag element
            _this.ele.style.visibility = 'visible';
            // If element is outside screen, use initial position
            const initBound = _this.ele.getBoundingClientRect();
            if (initBound.left < -0.5 * initBound.width ||
                initBound.top < -0.5 * initBound.height ||
                initBound.right > _this.win.innerWidth + 0.5 * initBound.width ||
                initBound.bottom > _this.win.innerHeight + 0.5 * initBound.height
            ) {
                _this.ele.distanceX = 0;
                _this.ele.distanceY = 0;
                _this.ele = _this.fnTranslate(_this.ele, 0, 0);
            }
        },
        /**
         * easeOutBounce algorithm
         * t: current time
         * b: beginning value
         * c: change in value
         * d: duration
         */
        easeOutBounce: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
            }
        },

        // Method to set transform coordinates
        fnTranslate: function (_ele, x, y) {
            x = Math.round(1000 * x) / 1000;
            y = Math.round(1000 * y) / 1000;

            _ele.style.webkitTransform = 'translate(' + [x + 'px', y + 'px'].join(',') + ')';
            _ele.style.transform = 'translate3d(' + [x + 'px', y + 'px', 0].join(',') + ')';

            return _ele
        },

        /**
         * Drag button start event
         */
        touchstart: function (event) {
            const _this = this;
            const events = event.touches[0] || event;

            _this.data.posX = events.pageX;
            _this.data.posY = events.pageY;

            _this.data.touching = true;

            if (_this.ele.distanceX) {
                _this.data.distanceX = _this.ele.distanceX;
            }
            if (_this.ele.distanceY) {
                _this.data.distanceY = _this.ele.distanceY;
            }

            // Element position data
            _this.data.bound = _this.ele.getBoundingClientRect();

            _this.data.timerready = true;
        },

        /**
         * Drag button move event
         */
        touchmove: function (event) {
            const _this = this;
            if (_this.data.touching !== true) {
                return;
            }

            // Start recording time when movement begins
            if (_this.data.timerready === true) {
                _this.data.timerstart = +new Date();
                _this.data.timerready = false;
            }

            event.preventDefault();

            const events = event.touches[0] || event;

            _this.data.nowX = events.pageX;
            _this.data.nowY = events.pageY;

            let distanceX = _this.data.nowX - _this.data.posX,
                distanceY = _this.data.nowY - _this.data.posY;

            // Current element position
            const absLeft = distanceX + _this.data.bound.left,
                absTop = distanceY + _this.data.bound.top,
                absRight = absLeft + _this.data.bound.width,
                absBottom = absTop + _this.data.bound.height;

            // Edge detection
            if (absLeft < 0) {
                distanceX = distanceX - absLeft;
            }
            if (absTop < 0) {
                distanceY = distanceY - absTop;
            }
            if (absRight > _this.win.innerWidth) {
                distanceX = distanceX - (absRight - _this.win.innerWidth);
            }
            if (absBottom > _this.win.innerHeight) {
                distanceY = distanceY - (absBottom - _this.win.innerHeight);
            }

            // Element position follows
            const x = _this.data.distanceX + distanceX,
                y = _this.data.distanceY + distanceY;
            _this.ele = _this.fnTranslate(_this.ele, x, y);

            // Cache movement position
            _this.ele.distanceX = x;
            _this.ele.distanceY = y;
        },

        /**
         * Drag button move complete event
         */
        touchend: function () {
            const edge = function () {
                // Time
                let start = 0, during = 25;
                // Initial value and change amount
                let init = _this.ele.distanceX, y = _this.ele.distanceY, change = 0;
                // Determine which half the element is in now
                const bound = _this.ele.getBoundingClientRect();
                if (bound.left + bound.width / 2 < _this.win.innerWidth / 2) {
                    change = -1 * bound.left;
                } else {
                    change = _this.win.innerWidth - bound.right;
                }

                const run = function () {
                    // If user touches element, stop animation
                    if (_this.data.touching === true) {
                        _this.data.inertiaing = false;
                        return;
                    }

                    start++;
                    const x = _this.easeOutBounce(start, init, change, during);
                    _this.ele = _this.fnTranslate(_this.ele, x, y);

                    if (start < during) {
                        requestAnimationFrame(run);
                    } else {
                        _this.ele.distanceX = x;
                        _this.ele.distanceY = y;
                        _this.data.inertiaing = false;
                        if (_this.win.localStorage) {
                            localStorage['Inertia_' + _this.ele.id] = [x, y].join();
                        }
                    }
                };
                run();
            };
            const _this = this;
            if (_this.data.touching === false) {
                // fix iOS fixed bug
                return;
            }
            _this.data.touching = false;

            // Calculate speed
            _this.data.timerend = +new Date();

            if (!_this.data.nowX || !_this.data.nowY) {
                return;
            }

            // Horizontal and vertical movement distance
            const distanceX = _this.data.nowX - _this.data.posX,
                distanceY = _this.data.nowY - _this.data.posY;

            if (Math.abs(distanceX) < 5 && Math.abs(distanceY) < 5) {
                return;
            }

            // Distance and time
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY),
                time = _this.data.timerend - _this.data.timerstart;

            // Speed: distance moved per natural refresh
            let speed = distance / time * 16.666;

            // Tested 2~60+ px variation
            // Set decay rate
            // Smaller value = faster decay
            const rate = Math.min(10, speed);

            // Start inertia easing
            _this.data.inertiaing = true;

            // Bounce parameters
            let reverseX = 1, reverseY = 1;

            // Speed calculation method
            const step = function () {
                if (_this.data.touching === true) {
                    _this.data.inertiaing = false;
                    return;
                }
                speed = speed - speed / rate;

                // Distribute to x, y directions based on movement angle
                let moveX = reverseX * speed * distanceX / distance, moveY = reverseY * speed * distanceY / distance;

                // Current element values
                const bound = _this.ele.getBoundingClientRect();

                if (moveX < 0 && bound.left + moveX < 0) {
                    moveX = 0 - bound.left;
                    // Reverse direction on edge contact
                    reverseX = reverseX * -1;
                } else if (moveX > 0 && bound.right + moveX > _this.win.innerWidth) {
                    moveX = _this.win.innerWidth - bound.right;
                    reverseX = reverseX * -1;
                }

                if (moveY < 0 && bound.top + moveY < 0) {
                    moveY = -1 * bound.top;
                    reverseY = -1 * reverseY;
                } else if (moveY > 0 && bound.bottom + moveY > _this.win.innerHeight) {
                    moveY = _this.win.innerHeight - bound.bottom;
                    reverseY = -1 * reverseY;
                }

                const x = _this.ele.distanceX + moveX, y = _this.ele.distanceY + moveY;
                // Position change
                _this.ele = _this.fnTranslate(_this.ele, x, y);

                _this.ele.distanceX = x;
                _this.ele.distanceY = y;

                if (speed < 0.1) {
                    speed = 0;
                    if (_this.options.edge === false) {
                        _this.data.inertiaing = false;

                        if (_this.win.localStorage) {
                            localStorage['Inertia_' + _this.ele.id] = [x, y].join();
                        }
                    } else {
                        // Edge snap
                        edge();
                    }
                } else {
                    requestAnimationFrame(step);
                }
            };
            step();
        },
        /**
         * Drag button click event
         */
        click: function () {
            const _this = this;
            const currentUrl = window.location.href;
            window.location.href = `https://${_this.options.instance}/oldest/${currentUrl}`;
        }
    };
    new DragButton().init();
}());
