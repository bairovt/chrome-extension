'use strict'

chrome.runtime.sendMessage({type: 'get_list'}, (list) => {
    let popup = document.getElementById('popup');
    for (let site of list) {        
        let p = document.createElement('p');
        p.innerHTML = `<a href="http://${site.domain}" target="_blank">${site.name}</a>`
        popup.appendChild(p);
    }
})