<script>
    import { onDestroy, onMount } from 'svelte';
    import Tree from './wyvr_data/tree.svelte';

    let data;
    let structure;
    const tabs = ['Data', 'Structure'];
    let active = tabs[0];
    let term;
    let height = 400;
    let searching = false;
    let not_found = false;
    let search_term;
    let state = 'busy';
    $: get_term(term);

    onMount(() => {
        wyvr_devtools_inspect_data().then((result) => {
            data = result;
            state = 'idle';
        });
        wyvr_devtools_inspect_structure_data().then((result) => {
            structure = result;
            state = 'idle';
        });

        addEventListener('mousemove', mousemove);
        addEventListener('mouseup', mouseup);
    });
    onDestroy(() => {
        removeEventListener('mousemove', mousemove);
        removeEventListener('mouseup', mouseup);
    });

    $: loaded = data && structure;

    let term_debouncer;
    function get_term(term) {
        state = 'busy';
        clearTimeout(term_debouncer);
        term_debouncer = setTimeout(() => {
            search_term = term;
            console.log(search_term);
            start_search(search_term).finally(() => {
                state = 'idle';
            });
        }, 500);
    }

    let filtered_data;
    let filtered_structure;

    async function start_search(term) {
        const search_data = active == 'structure' ? structure : data;
        const result = await new Promise((resolve) => {
            if (!term) {
                resolve({ data: search_data, searching: false });
                return;
            }
            resolve({ data: search(term.toLowerCase(), search_data), searching: true });
        });
        // handle result
        searching = result.searching;
        if (active == 'structure') {
            filtered_structure = result.data;
        } else {
            filtered_data = result.data;
        }
        not_found = searching && !result.data;
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
        if (type == 'object') {
            const result = {};
            let set = false;
            Object.keys(data).forEach((key) => {
                if (key.toLowerCase().indexOf(term) > -1 || search(term, data[key])) {
                    set = true;
                    result[key] = data[key];
                    return;
                }
            });
            if (!set) {
                return undefined;
            }
            return result;
        }
        if (type == 'string' || type == 'number' || type == 'boolean') {
            return (data + '').toLowerCase().indexOf(term) > -1 ? data : undefined;
        }
        return undefined;
    }

    let moving = false;
    function mouseup(e) {
        moving = false;
    }
    function mousemove(e) {
        if (moving) {
            height = Math.max(height + e.movementY * -1, 0);
        }
    }
</script>

{#if loaded}
    <div class="grid">
        <div
            class="drag"
            on:mousedown={() => {
                moving = true;
            }}
        />
        <div class="tabs">
            {#each tabs as tab}
                <button
                    on:click={() => {
                        active = tab;
                    }}
                    class:active={active == tab}>{tab}</button
                >
            {/each}

            <input bind:value={term} placeholder="Search" />
            <button
                on:click={() => {
                    trigger('wyvr_data_close');
                }}
                title="close">⨯</button
            >
        </div>
        <div class="content {state}" style="--height: {height}px;">
            {#if state == 'busy'}
                <div class="wyvr_loader" />
            {/if}
            {#if not_found}
                <em>nothing found for "<b>{term}</b>"</em>
            {:else if active == 'Data'}
                <Tree data={filtered_data} open={true} path="data" highlight={term} {searching}
                    ><span class="icon">🗃️</span> Data</Tree
                >
            {:else if active == 'Structure'}
                <Tree data={filtered_structure} open={true} highlight={term} {searching}
                    ><span class="icon">🏗️</span> Structure</Tree
                >
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
        --line-color: rgba(255, 255, 255, 0.3);
    }
    .drag {
        cursor: ns-resize;
        height: 2px;
        background: var(--line-color);
    }
    .drag:hover {
        height: 5px;
    }
    .drag:active {
        --line-color: var(--wyvr-debug-primary);
    }
    .grid {
        display: flex;
        flex-direction: column;
        height: 100%;
        color: var(--wyvr-debug-text);
    }
    .tabs {
        border-bottom: 2px solid var(--line-color);
        display: flex;
        flex-direction: row;
    }
    .tabs button {
        padding: 5px 20px;
        background: transparent;
        border: 0;
        color: var(--wyvr-debug-primary);
        font-size: var(--wyvr-debug-size);
        cursor: pointer;
    }
    .tabs input {
        border: 0;
        border-left: 2px solid var(--line-color);
        border-radius: 0;
        background: transparent;
        padding: 0 10px;
        flex-grow: 1;
        color: var(--wyvr-debug-text);
    }
    .tabs input:focus {
        background: rgba(255, 255, 255, 0.1);
    }
    .tabs button.active {
        color: var(--wyvr-debug-text);
        border-bottom: 5px solid var(--wyvr-debug-text);
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
