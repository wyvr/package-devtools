<script>
    import { onDestroy, onMount } from 'svelte';
    import Tree from './wyvr_data/tree.svelte';
    import Tabs from './wyvr_devtools_helper/Tabs.svelte';
    import Drag from './wyvr_devtools_helper/Drag.svelte';

    let data;
    let filtered;
    let view;
    let term;
    let height = 400;
    let searching = false;
    let not_found = false;
    let search_term;
    let state = 'busy';

    const cache = {},
        KEY_DATA = 'data',
        KEY_STRUCTURE = 'structure',
        KEY_STACK = 'stack',
        KEY_I18N = 'i18n',
        ICONS = {
            [KEY_DATA]: '<i class="ri-database-2-line"></i>',
            [KEY_STRUCTURE]: '<i class="ri-node-tree"></i>',
            [KEY_STACK]: '<i class="ri-stack-line"></i>',
            [KEY_I18N]: '<i class="ri-translate"></i>',
        },
        NAMES = {
            [KEY_DATA]: 'Data',
            [KEY_STRUCTURE]: 'Structure',
            [KEY_STACK]: 'Stack',
            [KEY_I18N]: 'I18N',
        },
        TABS = [
            { name: NAMES[KEY_DATA], value: KEY_DATA, icon: ICONS[KEY_DATA] },
            {
                name: NAMES[KEY_STRUCTURE],
                value: KEY_STRUCTURE,
                icon: ICONS[KEY_STRUCTURE],
            },
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
        wyvr_devtools_inspect_structure_data().then((result) => {
            cache[KEY_STRUCTURE] = result;
            init_view();
        });

        cache[KEY_STACK] = window._stack;
        cache[KEY_I18N] = window._i18n?.data;
    });

    onDestroy(() => {
        Object.keys(cache).forEach((key) => {
            cache[key] = undefined;
        });
    });

    let loaded = false;

    let term_debouncer;
    let start = false;

    function init_view() {
        if (!loaded) {
            loaded = !!cache[KEY_DATA] && !!cache[KEY_STRUCTURE];
        }
        if (view == KEY_DATA && cache[KEY_DATA]) {
            state = 'idle';
        }
        if (view == KEY_STRUCTURE && cache[KEY_STRUCTURE]) {
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

{#if loaded}
    <div class="grid">
        <Drag
            {height}
            on:change={(e) => {
                height = e.detail;
            }}
        />
        <Tabs
            tabs={TABS}
            search={true}
            on:change={(e) => {
                term = '';
                if (
                    [KEY_DATA, KEY_STRUCTURE, KEY_STACK, KEY_I18N].includes(
                        e.detail,
                    )
                ) {
                    view = e.detail;
                    data = cache[e.detail];
                }
            }}
            on:search={(e) => (term = e.detail)}
            on:close={() => trigger('wyvr_data_close')}
        />
        <div class="content {state}" style="--height: {height}px;">
            {#if state == 'busy'}
                <div class="wyvr_loader" />
            {/if}
            {#if not_found}
                <em>nothing found for "<b>{term}</b>"</em>
            {:else}
                <Tree
                    data={filtered}
                    open={true}
                    path={view == KEY_DATA ? 'data' : ''}
                    highlight={term}
                    {searching}
                >
                    {@html ICONS[view]}
                    {NAMES[view]}
                </Tree>
            {/if}
        </div>
    </div>
{:else}
    <div class="wyvr_loader" />
{/if}

<style>
    :global(body > .wyvr_data) {
        position: sticky;
        bottom: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(3px);
        overflow: auto;
    }
    .grid {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: var(--wyvr-debug-text);
    }
    .content {
        padding: 10px;
        overflow: auto;
        height: var(--height);
        color: var(--wyvr-debug-text);
        position: relative;
    }
    .wyvr_loader {
        text-align: center;
    }
    .wyvr_loader:after {
        display: inline-block;
        content: ' ';
        width: 24px;
        height: 24px;
        margin: 10px;
        border-radius: 50%;
        border: 3px solid transparent;
        border-left-color: var(--wyvr-debug-primary);
        border-right-color: var(--wyvr-debug-primary);
        animation: spin 1.2s linear infinite;
    }
    .content .wyvr_loader {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 100;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
