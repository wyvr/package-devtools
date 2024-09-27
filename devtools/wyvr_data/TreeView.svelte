<script>
    import { onDestroy, onMount } from 'svelte';
    import Tree from './../wyvr_devtools_helper/Tree.svelte';
    import BottomWindow from './../wyvr_devtools_helper/BottomWindow.svelte';
    import Loader from './../wyvr_devtools_helper/Loader.svelte';

    export let tab;
    export let term;

    $: path = tab?.value === 'data' ? 'data' : '';

    let data;
    let filtered;
    // let view;
    // let term;
    let searching = false;
    let not_found = false;
    let search_term;
    let state = 'busy';

    $: get_term(term);
    $: update_view(tab);

    function update_view() {
        state = 'busy';
        if (!window.wyvr_data_cache) {
            window.wyvr_data_cache = {};
        }
        switch (tab?.value) {
            case 'data':
                if (window.wyvr_data_cache.data) {
                    init_view();
                } else {
                    wyvr_devtools_inspect_data().then((result) => {
                        window.wyvr_data_cache.data = result;
                        init_view();
                    });
                }
                break;
            case 'structure':
                if (window.wyvr_data_cache.structure) {
                    init_view();
                } else {
                    wyvr_devtools_inspect_structure_data().then((result) => {
                        window.wyvr_data_cache.structure = result;
                        init_view();
                    });
                }
                break;
            case 'stack':
                window.wyvr_data_cache.stack = window._stack;
                state = 'idle';
                init_view();
                break;
            case 'i18n':
                window.wyvr_data_cache.i18n = window._i18n?.data;
                state = 'idle';
                init_view();
                break;
        }
    }

    let term_debouncer;
    let start = false;

    function init_view() {
        if (window.wyvr_data_cache[tab?.value]) {
            data = window.wyvr_data_cache[tab?.value];
        }

        if (tab?.value === 'data' && window.wyvr_data_cache.data) {
            state = 'idle';
        }
        if (tab?.value === 'structure' && window.wyvr_data_cache.structure) {
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
        return type === 'string' || type === 'number' || type === 'boolean';
    }

    function search_primitive(term, data) {
        if (!is_primitive(data)) {
            return false;
        }
        return `${data}`.toLowerCase().indexOf(term) > -1;
    }

    function search(term, data) {
        if (Array.isArray(data)) {
            const result = data.filter((item) => search(term, item));
            if (result.length === 0) {
                return undefined;
            }
            return result;
        }
        if (data === null) {
            return undefined;
        }
        const type = typeof data;

        // search in objects
        if (type !== 'object') {
            return undefined;
        }
        const result = {};
        let set = false;
        for (const key in data) {
            if (
                key.toLowerCase().indexOf(term) > -1 ||
                search_primitive(term, data[key]) ||
                search(term, data[key])
            ) {
                set = true;
                result[key] = data[key];
            }
        }

        if (!set) {
            return undefined;
        }
        return result;
    }
</script>

{JSON.stringify(term)}

{#if tab}
    {#if state == 'busy'}
        <Loader></Loader>
    {:else if not_found}
        <em>nothing found for "<b>{term}</b>"</em>
    {:else}
        <Tree
            data={term ? filtered : data}
            open={true}
            {path}
            highlight={term}
            {searching}
        >
            {@html tab.icon}
            {tab.name}
        </Tree>
    {/if}
{/if}
<!-- 
<BottomWindow
    tabs={TABS}
    search={true}
    height={400}
    on:tab={(e) => {
        term = '';
        if ([KEY_DATA, KEY_STRUCTURE, KEY_STACK, KEY_I18N].includes(e.detail)) {
            view = e.detail;
            data = window.wyvr_data_cache[e.detail];
        }
    }}
    on:search={(e) => (term = e.detail)}
    on:close={() => trigger('wyvr_data_close')}
>
    {#if loaded}
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
    {/if}
</BottomWindow> -->
