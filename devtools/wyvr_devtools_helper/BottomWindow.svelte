<script>
import { createEventDispatcher, onDestroy, onMount } from 'svelte';
import Tabs from './Tabs.svelte';
import Drag from './Drag.svelte';
const dispatcher = createEventDispatcher();

export let tabs = [];
export let search = false;
export let height = 200;

let el;
let tab;

onMount(() => {
    update_height(el);
});
onDestroy(() => {
    update_height();
});

function update_height(el) {
    if (el) {
        document.body.style.paddingBottom = `${el.offsetHeight}px`;
    } else {
        document.body.style.paddingBottom = '';
    }
}
</script>

<div class="grid" bind:this={el}>
    <Drag
        {height}
        on:change={(e) => {
            height = e.detail;
            setTimeout(update_height, 10);
        }}
    />
    <Tabs
        {tabs}
        {search}
        on:change={(e) => {
            dispatcher('tab', e.detail);
            tab = tabs.find((t) => t.value === e.detail);
        }}
        on:search={(e) => dispatcher('search', e.detail)}
        on:close={() => dispatcher('close')}
    />
    <div class="content" style="--height: {height}px;">
        <slot {tab} />
    </div>
</div>

<style>
    .grid {
        display: flex;
        flex-direction: column;
        color: var(--wyvr-debug-text);
        position: fixed;
        bottom: 0;
        z-index: 100000;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(3px);
        overflow: auto;
        left: 0;
        right: 0;
    }
    .content {
        padding: 10px;
        overflow: auto;
        height: var(--height);
        color: var(--wyvr-debug-text);
        position: relative;
    }
</style>
