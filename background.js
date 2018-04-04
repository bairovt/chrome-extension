'use strict'

console.log("background is running!")

let list = [];
let time;
let closed = [];
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
    console.log('list: ' + list)
    for (let newSite of loadedList) {
        let exising = list.find(function(site){
            return site.name === newSite.name
        })
        if (!exising) list.push(newSite)
    }    
    chrome.storage.sync.set({list, time: Date.now()})
}

function loadSites () {
    // axios.get("http://www.softomate.net/ext/employees/list.json")
    axios.get("http://localhost:5000/list.json")
    .then((resp) => {
        let loadedList = resp.data;
        updateList(loadedList)        
    })
    .catch(err => {
        console.error(err)
    })
}

const storageGet = function (keys) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(keys, function(result) {
            resolve(result)
        });
    })    
}

chrome.runtime.onMessage.addListener( (message, sender, sendResp) => {    
    switch (message.type) {
        case 'get_matching_site':            
            let matchingSite = list.find(function (site) {
                return message.hostname.includes(site.domain)
            });            
            if (matchingSite && !closed.includes(matchingSite.domain) 
                && views.getCount(matchingSite.domain) < 3) 
            {
                views.add(matchingSite);
                sendResp(matchingSite);
            } else {
                sendResp(null);
            }            
            break;
        case 'closed':
            closed.push(message.domain)
            break;
        case 'get_list':
            sendResp(list)
            break;
    }    
})

let hourMs = 1000 * 60 * 60;
storageGet(['list', 'time'])
    .then(result => {
        console.log(result)       
        
        if (!result.time) {
            loadSites();
            setInterval(loadSites, hourMs);
        } else {
            let now = Date.now();
            let timeout = now - time;
            console.log('timeout: ' + timeout)
            if (timeout >= hourMs) {
                loadSites();
                setInterval(loadSites, hourMs);
            }
            else {
                // setTimeout(()=>{
                //     setInterval(()=>{loadSites(list)}, hourMs);
                // }, timeout)
                setTimeout(function(){
                    setInterval(loadSites, hourMs);
                }, hourMs-timeout)
            }
        }
    })
    .catch(console.error);