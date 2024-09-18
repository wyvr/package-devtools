import { add_icons } from './wyvr_devtools_helper/add_icons.js';
import Toolbar from './wyvr_measure.svelte';

// https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript

let is_active = !!sessionStorage.getItem('wyvr_measure');
let target;
let component;

add_icons();

export default {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 3V19H21V21H3V3H5ZM20.2929 6.29289L21.7071 7.70711L16 13.4142L13 10.415L8.70711 14.7071L7.29289 13.2929L13 7.58579L16 10.585L20.2929 6.29289Z"></path></svg>',
    name: 'Measure Performance',
    description: 'get performance data from the current page',
    onMount: () => {
        if (is_active) {
            target = document.createElement('div');
            target.classList.add('wyvr_measure');
            document.body.appendChild(target);
            component = new Toolbar({ target });
            on('wyvr_measure_close', () => {
                close();
                location.reload();
            });
        }
    },
    onClick: () => {
        if (is_active) {
            close();
        } else {
            sessionStorage.setItem('wyvr_measure', 'true');
        }
        location.reload();
    }
};

function close() {
    sessionStorage.removeItem('wyvr_measure');
}
