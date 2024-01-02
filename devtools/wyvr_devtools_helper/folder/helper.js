export function get_ext(value) {
    if(!value) {
        return '';
    }
    const result = value.split('.').pop();
    return result;
}

export function get_folder_icon(name) {
    switch (name) {
        case 'assets':
            return 'folder-image-line';
        case 'cron':
            return 'time-line';
        case 'devtools':
            return 'terminal-window-line';
        case 'i18n':
            return 'translate';
        case 'pages':
            return 'article-line';
        case 'plugins':
            return 'puzzle-line';
        case 'routes':
            return 'route-line';
        case 'src':
            return 'code-line';
    }
    return 'folder-line';
}

export function get_folder_color(name) {
    if (
        [
            'assets',
            'cron',
            'devtools',
            'i18n',
            'pages',
            'plugins',
            'routes',
            'src',
        ].includes(name)
    ) {
        return 'var(--wyvr-debug-primary)';
    }
    return '#fff';
}

export function get_ext_icon(ext) {
    switch (ext) {
        case 'js':
        case 'mjs':
        case 'cjs': // obsolete
        case 'ts':
            return 'javascript-line';
        case 'css':
            return 'css3-line';
        case 'svelte':
            return 'svelte-line';
        case 'html':
            return 'html5-line';
        case 'json':
            return 'code-line';
        case 'md':
            return 'markdown-line';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'svg':
        case 'webp':
        case 'ico':
            return 'image-line';
    }
    return 'file-line';
}

export function get_ext_color(ext) {
    switch (ext) {
        case 'js':
        case 'mjs':
        case 'cjs': // obsolete
        case 'ts':
            return '#cc0';
        case 'css':
            return '#0cc';
        case 'svelte':
            return '#c30';
        case 'html':
            return '#03c';
        case 'json':
            return '#fff';
        case 'md':
            return '#0ad';
    }
    return '#fff';
}
