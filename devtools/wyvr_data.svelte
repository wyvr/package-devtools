<script>
    import { onDestroy, onMount } from 'svelte';
    import Tree from './wyvr_devtools_helper/Tree.svelte';
    import BottomWindow from './wyvr_devtools_helper/BottomWindow.svelte';
    import Loader from './wyvr_devtools_helper/Loader.svelte';

    let data;
    let filtered;
    let view;
    let term;
    let searching = false;
    let not_found = false;
    let search_term;
    let state = 'busy';

    const cache = {},
        KEY_DATA = 'data',
        KEY_STACK = 'stack',
        KEY_I18N = 'i18n',
        ICONS = {
            [KEY_DATA]: '<i class="ri-database-2-line"></i>',
            [KEY_STACK]: '<i class="ri-stack-line"></i>',
            [KEY_I18N]: '<i class="ri-translate"></i>',
        },
        NAMES = {
            [KEY_DATA]: 'Data',
            [KEY_STACK]: 'Stack',
            [KEY_I18N]: 'I18N',
        },
        TABS = [
            { name: NAMES[KEY_DATA], value: KEY_DATA, icon: ICONS[KEY_DATA] },
            {
                name: NAMES[KEY_STACK],
                value: KEY_STACK,
                icon: ICONS[KEY_STACK],
            },
            { name: NAMES[KEY_I18N], value: KEY_I18N, icon: ICONS[KEY_I18N] },
        ];

    $: get_term(term);

    onMount(() => {
        // load data from wyvr
        wyvr_devtools_inspect_data().then((result) => {
            cache[KEY_DATA] = result;
            init_view();
        });

        cache[KEY_STACK] = window._stack;
        cache[KEY_I18N] = window._i18n?.data;
    });

    onDestroy(() => {
        if (cache) {
            Object.keys(cache).forEach((key) => {
                cache[key] = undefined;
            });
        }
    });

    let loaded = false;

    let term_debouncer;
    let start = false;

    function init_view() {
        if (!loaded) {
            loaded = !!cache[KEY_DATA];
            if (loaded) {
                data = cache[view];
            }
        }
        if (view == KEY_DATA && cache[KEY_DATA]) {
            state = 'idle';
        }
    }
    function get_term(term) {
        if (start) {
            return;
        }
        state = 'busy';
        clearTimeout(term_debouncer);
        term_debouncer = setTimeout(() => {
            search_term = term;
            if (!data) {
                state = 'idle';
                start = false;
                return;
            }
            start = true;
            start_search(search_term, data).finally(() => {
                state = 'idle';
                start = false;
            });
        }, 500);
    }

    async function start_search(term, search_data) {
        const result = await new Promise((resolve) => {
            if (!term) {
                resolve({ data: search_data, searching: false });
                return;
            }
            resolve({
                data: search(term.toLowerCase(), search_data),
                searching: true,
            });
        });
        // handle result
        searching = result.searching;
        not_found = searching && !result.data;
        filtered = result.data;
    }

    function is_primitive(data) {
        const type = typeof data;
        return type == 'string' || type == 'number' || type == 'boolean';
    }

    function search_primitive(term, data) {
        if (!is_primitive(data)) {
            return false;
        }
        return (data + '').toLowerCase().indexOf(term) > -1;
    }

    function search(term, data) {
        if (Array.isArray(data)) {
            const result = data.filter((item) => search(term, item));
            if (result.length == 0) {
                return undefined;
            }
            return result;
        }
        if (data === null) {
            return undefined;
        }
        const type = typeof data;

        // search in objects
        if (type != 'object') {
            return undefined;
        }
        const result = {};
        let set = false;
        Object.keys(data).forEach((key) => {
            Object.keys(data).forEach((key) => {
                if (
                    key.toLowerCase().indexOf(term) > -1 ||
                    search_primitive(term, data[key]) ||
                    search(term, data[key])
                ) {
                    set = true;
                    result[key] = data[key];
                }
            });
        });
        if (!set) {
            return undefined;
        }
        return result;
    }
</script>

<BottomWindow
    tabs={TABS}
    search={true}
    height={400}
    on:tab={(e) => {
        term = '';
        if ([KEY_DATA, KEY_STACK, KEY_I18N].includes(e.detail)) {
            view = e.detail;
            data = cache[e.detail];
        }
    }}
    on:search={(e) => (term = e.detail)}
    on:close={() => trigger('wyvr_data_close')}
>
    {#if state == 'busy'}
        <Loader></Loader>
    {:else if not_found}
        <em>nothing found for "<b>{term}</b>"</em>
    {:else}
        <Tree
            data={term ? filtered : data}
            open={true}
            path={view == KEY_DATA ? 'data' : ''}
            highlight={term}
            {searching}
        >
            {@html ICONS[view]}
            {NAMES[view]}
        </Tree>
    {/if}
</BottomWindow>
