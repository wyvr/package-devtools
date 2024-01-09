export function add_icons() {
    if (!document.querySelector('link[href*="remixicon.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/assets/devtools/remixicon/remixicon.css';
        document.head.appendChild(link);
    }
}
