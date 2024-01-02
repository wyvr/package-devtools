<script>
    import { createEventDispatcher, onMount } from 'svelte';
    import Folder from './folder/Folder.svelte';
    const dispatcher = createEventDispatcher();

    export let data;
    export let highlight = undefined;
    export let packages = [];

    let selected_packages = {};
    let inited = false;

    onMount(() => {});

    $: {
        if (packages?.length && !inited) {
            inited = true;
            const new_packages = {};
            packages.forEach((pkg) => {
                new_packages[pkg.name] = true;
            });
            selected_packages = new_packages;
        }
    }

    $: tree = list_to_tree(data);

    function list_to_tree(list) {
        const tree = {};
        if (!list) {
            return tree;
        }
        list.forEach((path) => {
            const parts = path.split('/');
            const last_index = parts.length - 1;
            let current = tree;
            parts.forEach((part, index) => {
                if (index == last_index) {
                    current[part] = path;
                    return;
                }

                if (!current[part]) {
                    current[part] = {};
                }
                current = current[part];
            });
        });
        return tree;
    }
</script>

{#if packages}
    <div class="filter">
        <span class="icon"><i class="ri-filter-line"></i></span>
        {#each packages as pkg}
            <span class="package">
                <input
                    type="checkbox"
                    bind:checked={selected_packages[pkg.name]}
                    on:change={() =>
                        dispatcher('selected_packages', selected_packages)}
                    value={pkg.name}
                    id={pkg.name}
                /><label for={pkg.name}
                    >{#if pkg.type == 'npm'}<i class="ri-npmjs-line"></i>
                    {/if}{pkg.name}</label
                >
            </span>
        {/each}
    </div>
{/if}
<div class="wrapper">
    <i class="ri-folder-fill"></i>
    <Folder data={tree} {highlight}></Folder>
</div>

<style>
    :root {
        --line-color: rgba(255, 255, 255, 0.3);
    }
    .wrapper {
        width: fit-content;
        padding-bottom: 1rem;
    }
    .wrapper :global(.highlight) {
        background-color: var(--wyvr-debug-primary);
        color: var(--wyvr-debug-text);
        display: inline-block;
        padding: 1px;
        border-radius: 1px;
    }
    .filter {
        position: fixed;
        top: 3.5rem;
        right: 1rem;
        width: 30%;
        max-width: 300px;
        padding-left: 1.5rem;
    }
    .filter .icon {
        position: absolute;
        top: 0;
        left: 0;
    }
    .filter .package {
        margin-right: 0.25rem;
        margin-bottom: 0.25rem;
        display: inline-block;
        line-height: 1.6rem;
    }
    .filter input {
        margin: 0;
        padding: 0;
        opacity: 0;
        position: absolute;
        clip: rect(0 0 0 0);
    }
    .filter label {
        padding: 0.1rem 0.25rem;
        border: 1px solid var(--line-color);
        color: var(--line-color);
        border-radius: 0.25rem;
    }
    .filter input:checked + label {
        background-color: var(--wyvr-debug-primary);
        border-color: var(--wyvr-debug-primary);
        color: var(--wyvr-debug-text);
    }
</style>
