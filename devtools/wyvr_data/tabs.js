const KEY_DATA = 'data';
const KEY_STRUCTURE = 'structure';
const KEY_STACK = 'stack';
const KEY_I18N = 'i18n';
const ICONS = {
    [KEY_DATA]: '<i class="ri-database-2-line"></i>',
    [KEY_STRUCTURE]: '<i class="ri-node-tree"></i>',
    [KEY_STACK]: '<i class="ri-stack-line"></i>',
    [KEY_I18N]: '<i class="ri-translate"></i>'
};

export const keys = [KEY_DATA, KEY_STRUCTURE, KEY_STACK, KEY_I18N];
export const tabs = [
    { name: 'Data', value: KEY_DATA, icon: ICONS[KEY_DATA] },
    {
        name: 'Structure',
        value: KEY_STRUCTURE,
        icon: ICONS[KEY_STRUCTURE]
    },
    {
        name: 'Stack',
        value: KEY_STACK,
        icon: ICONS[KEY_STACK]
    },
    { name: 'I18N', value: KEY_I18N, icon: ICONS[KEY_I18N] }
]