import Data from './wyvr_data.svelte';

let is_active = false;
let target;
let component;

export default {
    icon: '🌐',
    name: 'Inspect data',
    description: 'view the whole data used on the current page',
    instant: false,
    onMount: () => {
        on('wyvr_data_close', () => {
            close();
        });
    },
    onClick: () => {
        if (!is_active) {
            is_active = true;
            target = document.createElement('div');
            target.classList.add('wyvr_data');
            document.body.appendChild(target);
            component = new Data({ target });
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
