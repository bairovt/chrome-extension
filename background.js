'use strict'

console.log("background is running!")

let list = [];
let views = {};

views.add = function (site) {
    if (this[site.domain]) this[site.domain] = this[site.domain] + 1;
    else this[site.domain] = 1;
}
views.getCount = function(domain) {
    if (!this[domain]) return 0;
    else return this[domain];
}

function updateList (loadedList) {    
    for (let newSite of loadedList) {
        let exising = list.find(function(site){
            return site.domain === newSite.domain
        })
        if (!exising) list.push(newSite)
    }    
    chrome.storage.sync.set({list, time: Date.now()})
}

function loadSites () {
    axios.get("http://www.softomate.net/ext/employees/list.json")
    .then((resp) => {
        let loadedList = resp.data;
        updateList(loadedList)
    })
    .catch(err => {
        console.error(err)
    })
}

chrome.runtime.onMessage.addListener( (message, sender, sendResp) => {    
    switch (message.type) {
        case 'get_matching_site':            
            let matchingSite = list.find(function (site) {
                return message.hostname.includes(site.domain)
            });            
            if (matchingSite && !matchingSite.closed && views.getCount(matchingSite.domain) < 3)
            {
                views.add(matchingSite);
                sendResp(matchingSite);
            } else {
                sendResp(null);
            }            
            break;
        case 'closed':             
            let i = list.findIndex((site) => site.domain === message.domain);
            list[i].closed = true;
            chrome.storage.sync.set({list})
            break;
        case 'get_list':
            sendResp(list)
            break;
    }    
})

function loadSitesAndSetInterval () {
    loadSites();
    setInterval(loadSites, hourMs);
}

let hourMs =  60 * 60 * 1000;

chrome.storage.sync.get(['list', 'time'], (result) => {        
    if (!result.time) {
        loadSitesAndSetInterval();
    } else {
        let now = Date.now();
        let timeout = now - result.time;            
        if (timeout >= hourMs) {
            loadSitesAndSetInterval();
        }
        else {
            list = result.list;
            setTimeout(function(){
                loadSitesAndSetInterval();
            }, hourMs-timeout)
        }
    }
})