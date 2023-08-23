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

    onMount(() => {
        wyvr_devtools_inspect_data().then((result) => {
            data = result;
        });
        wyvr_devtools_inspect_structure_data().then((result) => {
            structure = result;
        });

        addEventListener('mousemove', mousemove);
        addEventListener('mouseup', mouseup);
    });
    onDestroy(() => {
        removeEventListener('mousemove', mousemove);
        removeEventListener('mouseup', mouseup);
    });

    $: loaded = data && structure;
    let filtered_data;
    $: start_search(term, data).then((result) => {
        filtered_data = result.data;
        searching = result.searching;
        not_found = searching && !filtered_data;
    });
    let filtered_structure;
    $: start_search(term, structure).then((result) => {
        filtered_structure = result.data;
        searching = result.searching;
        not_found = searching && !filtered_data;
    });

    let search_timer;
    async function start_search(term, data) {
        return new Promise((resolve) => {
            if (!term) {
                resolve({ data, searching: false });
                return;
            }
            clearTimeout(search_timer);
            search_timer = setTimeout(() => {
                resolve({ data: search(term.toLowerCase(), data), searching: true });
            }, 500);
        });
    }
    function search(term, data) {
        if (Array.isArray(data)) {
            const result = data.filter((item) => search(term, item));
            if (result.length == 0) {
                return undefined;
            }
            return result;
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
        <div class="content" style="--height: {height}px;">
            {#if not_found}
                <em>nothing found for "<b>{term}</b>"</em>
            {:else if active == 'Data'}
                <Tree data={filtered_data} open={true} path="data" highlight={term} {searching} />
            {:else if active == 'Structure'}
                <Tree data={filtered_structure} open={true} highlight={term} {searching} />
            {/if}
        </div>
    </div>
{:else}
    <div class="loader" />
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
    }
    .tabs input:focus {
        background: rgba(255,255,255,0.1);
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
    }
    .loader {
        text-align: center;
    }
    .loader:after {
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
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
