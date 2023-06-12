//shiquda的代码储存库
function appendElement(type, text, func, appendTo) {
    switch (type) {
        case "botton":
            var a = document.createElement('button')
            a.textContent = text
            a.addEventListener("click", func)
            appendTo.appendChild(a)
            break
    }
}

function randomInt(min, max) {
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    return num
}

//中文大数值表示
function toChineseNum(num, fig) {
    const len = num.length
    if (len < 5) return num
    else if (len < 9) return ((num / 1e4).toFixed(fig) + "万")
    else return ((num / 1e8).toFixed(2) + "亿")
}

//code from ChatGPT
function sleep(fn, interval) {
    return new Promise(resolve => {
        setTimeout(() => {
            fn();
            resolve();
        }, interval);
    });
}

function executeWithInterval(fn, interval, times) {
    if (times <= 0) {
        return Promise.resolve();
    }
    return delay(fn, interval).then(() => executeWithInterval(fn, interval, times - 1));
}

// 示例：每隔100ms打印一次 "Hello, world!"，共打印5次
//executeWithInterval(() => console.log("Hello, world!"), 100, 5);


// 创建一个新的Date对象
function getBriefTime(d) {
    d = d ? d : new Date()
    // 获取小时、分钟和秒
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    // 格式化小时、分钟和秒，确保它们始终是两位数
    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;
    const currentTime = hours + ":" + minutes + ":" + seconds;
    // 打印当前时间
    return currentTime;
}