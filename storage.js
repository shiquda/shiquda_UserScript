//shiquda的代码储存库
function appendElement(type,text,func,appendTo){
    switch (type){
        case "botton":
            var a = document.createElement('button')
            a.textContent = text
            a.addEventListener("click",func)
            appendTo.appendChild(a)
            break
    }
}

function randomInt(min,max){
    var num = Math.floor(Math.random() * (max - min + 1) ) + min;
    return num
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
