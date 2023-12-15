import Breakpoints from './wyvr_show_breakpoints.svelte';

let is_active = false;
let target;
let component;

export default {
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 4V20H17V4H7ZM6 2H18C18.5523 2 19 2.44772 19 3V21C19 21.5523 18.5523 22 18 22H6C5.44772 22 5 21.5523 5 21V3C5 2.44772 5.44772 2 6 2ZM12 17C12.5523 17 13 17.4477 13 18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18C11 17.4477 11.4477 17 12 17Z"></path></svg>',
    name: 'Show media breakpoints',
    description: 'Show the available breakpoints',
    onMount: () => {
        target = document.createElement('div');
        document.body.appendChild(target);
    },
    onClick: () => {
        if (!is_active) {
            is_active = true;
            const { width_breakpoints } = get_breakpoints();
            if (!width_breakpoints || width_breakpoints.length == 0) {
                wyvr_message('no breakpoints available');
                return;
            }
            component = new Breakpoints({ target, props: { breakpoints: width_breakpoints } });
        } else {
            is_active = false;
            component.$destroy();
        }
    },
};

function get_breakpoints() {
    let width_breakpoints = [];
    let height_breakpoints = [];
    const media = [];
    Array.from(document.styleSheets).forEach((ss) => {
        Array.from(ss.cssRules).forEach((rule) => {
            media.push(rule.media);
        });
    });
    media
        .filter((x) => x)
        .forEach((media) => {
            Array.from(media).forEach((media_item) => {
                let match = media_item.match(/\(?(?:min|max)-width:\s*(\d*)px\)?/);
                if (match) {
                    width_breakpoints.push(parseFloat(match[1]));
                    return;
                }
            });
        });
    width_breakpoints = width_breakpoints.filter((item, index) => width_breakpoints.indexOf(item) == index);
    height_breakpoints = height_breakpoints.filter((item, index) => height_breakpoints.indexOf(item) == index);
    return { width_breakpoints, height_breakpoints };
}
