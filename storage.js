//shiquda的代码储存库
function appendElement(type,text,func,appendTo){
    if (type === 'btn'){
    var a = document.createElement('button')
    a.textContent = text
    a.addEventListener("click",func)
    appendTo.appendChild(a)
    }
}