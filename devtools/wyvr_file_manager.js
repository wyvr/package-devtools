import { add_icons } from './wyvr_devtools_helper/add_icons.js';
import FileManager from './wyvr_file_manager.svelte';

let is_active = false;
let target;
let component;

add_icons();

export default {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 2C20.5523 2 21 2.44772 21 3V6.757L19 8.757V4H5V20H19V17.242L21 15.242V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20ZM21.7782 8.80761L23.1924 10.2218L15.4142 18L13.9979 17.9979L14 16.5858L21.7782 8.80761ZM13 12V14H8V12H13ZM16 8V10H8V8H16Z" fill="currentColor"></path></svg>',
    name: 'File manager',
    description: 'manage files from your packages',
    instant: false,
    onMount: () => {
        on('wyvr_file_manager_close', () => {
            close();
        });
    },
    onClick: () => {
        if (!is_active) {
            is_active = true;
            target = document.createElement('div');
            target.classList.add('wyvr_file_manager');
            document.body.appendChild(target);
            component = new FileManager({ target });
        } else {
            close();
        }
    },
};

function close() {
    if (is_active) {
        component.$destroy();
        target.remove();
    }
    is_active = false;
}
