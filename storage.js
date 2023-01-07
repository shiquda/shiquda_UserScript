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