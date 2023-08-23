import Toolbar from './wyvr_measure.svelte';

// https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript

let is_active = !!sessionStorage.getItem('wyvr_measure');
let target;
let component;

export default {
    icon: '📈',
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
    },
};

function close() {
    sessionStorage.removeItem('wyvr_measure');
}
