import Inspect from './wyvr_inspect.svelte';

let is_active = false;
let target;
let component;

export default {
    icon: '🔍️',
    name: 'Inspect hydratable components',
    description: 'make hydated components visible and inspect the config',
    onMount: () => {
        target = document.createElement('div');
        document.body.appendChild(target);
        on('wyvr_inspect_close', () => {
            close();
        });
    },
    onClick: () => {
        if (!is_active) {
            is_active = true;
            component = new Inspect({ target });
        } else {
            close();
        }
    },
};

function close() {
    if (is_active) {
        try {
            component.$destroy();
        } catch (e) {
            // svelte devtools has a bug when destroying
            target.innerHTML = '';
        }
        component = undefined;
    }
    is_active = false;
}
