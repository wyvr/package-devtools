<script>
    import { onDestroy, onMount } from 'svelte';
    import BottomWindow from './wyvr_devtools_helper/BottomWindow.svelte';
    import Loader from './wyvr_devtools_helper/Loader.svelte';
    import { tabs } from './wyvr_routes/tabs';

    let term;

    let view;

    let route;
    let routes;
    let list = [];
    let pathname = '';
    let display_path = '';
    onMount(() => {
        pathname = document.location.pathname;
        update_view();
    });
    function update_view() {
        if (!window.wyvr_data_cache) {
            window.wyvr_data_cache = {};
        }
        if (window.wyvr_data_cache.data) {
            init_view();
        } else {
            wyvr_devtools_inspect_data().then((result) => {
                window.wyvr_data_cache.data = result;
                init_view();
            });
        }
        if (!routes) {
            fetch('/devtools/$routes.json')
                .then((res) => res.json())
                .then((data) => {
                    routes = data;
                });
        }
    }
    function init_view() {
        route = window.wyvr_data_cache.data.$route;
    }
    function update_list() {
        display_path = '';
        if (!Array.isArray(routes)) {
            return;
        }
        let check = pathname;
        if (view === 'target') {
            if (!term) {
                check = undefined;
            } else {
                check = term.replace(document.location.origin, '');
            }
        }
        list = routes
            .map((r) => {
                if (r.path === route?.path) {
                    r.current = true;
                } else {
                    r.current = false;
                }
                if (view === 'all') {
                    if(term) {
                        if(r.url.match(new RegExp(`${term}`, 'i'))) {
                            return r;
                        } else {
                            return undefined;
                        }  
                    }
                    return r;
                }
                if (check && check.match(r.match)) {
                    return r;
                }
                return undefined;
            })
            .filter(Boolean);
        if (view === 'all') {
            return;
        }
        display_path = check ?? '';
    }
    function formatUrl(url) {
        let formatted = url;
        if(view === 'all') {
            formatted = url.replace(new RegExp(`(${term})`, 'gi'), '<mark>$1</mark>');
        }
        return formatted.replace(/(\[\w+\])/g, '<span class="param">$1</span>').replace(/(\.\*)/g, '<span class="wildcard">$1</span>');
    }
    $: update_list(route, routes, term, view);
</script>

<BottomWindow
    {tabs}
    search={view === 'target' || view === 'all'}
    height={200}
    on:tab={(e) => {
        view = e.detail;
    }}
    on:search={(e) => (term = e.detail)}
    on:close={() => trigger('wyvr_routes_close')}
    let:tab
>
    {#if tab}
        {#if display_path}
            <div class="entry search">
                <i class="ri-search-line"></i>
                <code>{display_path}</code>
            </div>
        {/if}
        {#each list as route, index (route.path)}
            <div
                class="entry route"
                class:current={route.current}
                class:match={index === 0}
            >
                {#if route.current}<i class="ri-map-pin-line"></i>{:else}<i
                        class="ri-route-line"
                    ></i>{/if}
                <code>{@html formatUrl(route.url)}</code>
                <aside>
                    Methods <code>{route.methods ? route.methods.join(',').toUpperCase() : ''}</code><br>
                    Path <code>{route.rel_path}</code>
                </aside>
            </div>
        {/each}
    {:else}
        <Loader></Loader>
    {/if}
</BottomWindow>

<style>
    .search {
        opacity: 1;
        --line-color: rgba(255, 255, 255, 0.3);
        border-bottom: 2px solid var(--line-color);
    }
    .entry.match {
        border-left-color: var(--wyvr-debug-primary);
    }
    .route:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
    .entry {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        padding-right: 0.25rem;
        padding-left: 0.25rem;
        opacity: 0.75;
        display: flex;
        flex-direction: row;
        border-left: 5px solid transparent;
    }
    .entry :global(.param) {
        color: var(--wyvr-debug-primary);
    }
    .entry :global(.wildcard) {
        color: coral;
    }
    .entry > code {
        flex: 1;
    }
    .current i {
        color: var(--wyvr-debug-primary);
    }
    aside {
        text-align: right;
        color: color-mix(in srgb, var(--wyvr-debug-text) 70%, transparent 30%);
    }
    aside code {
        text-overflow: ellipsis;
        max-width: 30vw;
        overflow: hidden;
        white-space: nowrap;   
        display: inline-block;
        vertical-align: top;
        color: var(--wyvr-debug-text);
    }
    aside code:hover {
        text-overflow: auto;
        overflow: auto;
        max-width: none;
    }
</style>
