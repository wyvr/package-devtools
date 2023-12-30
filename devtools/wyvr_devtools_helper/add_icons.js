export function add_icons() {
    if (!document.querySelector('link[href*="remixicon.css"]')) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = chrome.runtime.getURL('devtools/remixicon/remixicon.css');
        document.head.appendChild(link);
    }
}
