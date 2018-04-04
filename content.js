chrome.runtime.sendMessage({
        type: 'get_matching_site',
        hostname: window.location.hostname
    }, 
    function (matchingSite) {        
        if (matchingSite) {
            let cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = chrome.extension.getURL('css/style.css')
            document.head.appendChild(cssLink)
                    
            let msg = document.createElement('div');        
            msg.className = 'ext-message';
            msg.innerHTML = `<span>${matchingSite.message}</span> `;
            
            let closeLink = document.createElement('a');
            closeLink.href = '#'
            closeLink.textContent = '[close]'
            closeLink.id = 'close-msg'
            closeLink = msg.appendChild(closeLink)
            closeLink.addEventListener('click', function(event){
                chrome.runtime.sendMessage({
                    type: 'closed',
                    domain: matchingSite.domain
                }, function(resp){})                
                msg.remove();
                event.preventDefault()
            })            
            document.body.appendChild(msg)
        }
    }
)