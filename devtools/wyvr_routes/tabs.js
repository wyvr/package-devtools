const KEY_CURRENT = 'current';
const KEY_TARGET = 'target';
const KEY_ALL = 'all';
const ICONS = {
    [KEY_CURRENT]: '<i class="ri-map-pin-line"></i>',
    [KEY_TARGET]: '<i class="ri-navigation-line"></i>',
    [KEY_ALL]: '<i class="ri-list-check"></i>',
};

export const keys = [KEY_CURRENT, KEY_TARGET];
export const tabs = [
    { name: 'Current', value: KEY_CURRENT, icon: ICONS[KEY_CURRENT] },
    { name: 'Target', value: KEY_TARGET, icon: ICONS[KEY_TARGET] },
    { name: 'All', value: KEY_ALL, icon: ICONS[KEY_ALL] }
]