export default {
    icon: '🗑️',
    name: 'Clear storage',
    description:
        'remove everything in local and session storage',

    onClick: () => {
        sessionStorage.clear();
        localStorage.clear();
        wyvr_message('storage cleared');
    },
};
