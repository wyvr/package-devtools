<script>
    import { createEventDispatcher, onMount } from 'svelte';
    const dispatcher = createEventDispatcher();

    export let tabs = [];
    export let search = false;
    export let close = true;

    let index = 0;
    $: active = tabs[index]?.value;
    $: update(active);

    $: internal_tabs = tabs.filter((tab) => tab && tab.value && tab.name);
    let term = '';

    function update(active) {
        dispatcher('change', active);
    }
    onMount(() => {
        update(active);
    });
</script>

<div class="tabs">
    {#each internal_tabs as tab, idx}
        <button
            on:click={() => {
                index = idx;
            }}
            class:active={active == tab.value}>{tab.name}</button
        >
    {/each}
    <div class="fill">
        {#if search}
            <input bind:value={term} on:input={() => dispatcher('search', term)} placeholder="Search" />
        {/if}
    </div>
    {#if close}
        <button on:click={() => dispatcher('close')} title="close">⨯</button>
    {/if}
</div>

<style>
    .tabs {
        --line-color: rgba(255, 255, 255, 0.3);
        border-bottom: 2px solid var(--line-color);
        display: flex;
        flex-direction: row;
    }
    button {
        padding: 5px 20px;
        background: transparent;
        border: 0;
        color: var(--wyvr-debug-primary);
        font-size: var(--wyvr-debug-size);
        cursor: pointer;
    }
    button.active {
        color: var(--wyvr-debug-text);
        border-bottom: 5px solid var(--wyvr-debug-text);
    }
    button:focus,
    input:focus {
        outline: 2px dotted var(--wyvr-debug-primary);
    }
    input {
        border: 0;
        border-left: 2px solid var(--line-color);
        border-radius: 0;
        background: transparent;
        padding: 0 10px;
        color: var(--wyvr-debug-text);
        width: 100%;
    }
    input:focus {
        background: rgba(255, 255, 255, 0.1);
    }
    .fill {
        flex-grow: 1;
        display: flex;
    }
    .fill input {
        flex-grow: 1;
    }
</style>
