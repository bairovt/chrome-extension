console.log("background is running!")

let list = [];
let closed = [];    // domians
let views = {};     // domain: count
views.add = function (site) {
    if (this[site.domain]) this[site.domain] = this[site.domain] + 1;
    else this[site.domain] = 1;
}
views.getCount = function(domain) {
    if (!this[domain]) return 0;
    else return this[domain];
}

function loadSitesList () {
    axios.get("http://www.softomate.net/ext/employees/list.json")
    .then(resp => {
        list = resp.data;
    })
    .catch(err => {
        console.error(err)
    })
}

loadSitesList();
setInterval(loadSitesList, 60*60*1000);

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