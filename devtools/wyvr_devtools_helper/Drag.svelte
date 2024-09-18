<script>
import { createEventDispatcher, onMount, onDestroy } from 'svelte';

export let height;

let moving = false;

const dispatcher = createEventDispatcher();

function mouseup(e) {
    moving = false;
}

function mousemove(e) {
    if (moving && height !== undefined) {
        height = Math.max(height + e.movementY * -1, 0);
        dispatcher('change', height);
    }
}

onMount(() => {
    addEventListener('mousemove', mousemove);
    addEventListener('mouseup', mouseup);
});

onDestroy(() => {
    removeEventListener('mousemove', mousemove);
    removeEventListener('mouseup', mouseup);
});
</script>

<div
    class="drag"
    aria-hidden="true"
    on:mousedown={() => {
        moving = true;
    }}
/>

<style>
    .drag {
        --line-color: rgba(255, 255, 255, 0.3);
        cursor: ns-resize;
        height: 4px;
        background-color: var(--line-color);
    }
    .drag:hover,
    .drag:active {
        height: 10px;
    }
    .drag:active {
        --line-color: var(--wyvr-debug-primary);
    }
</style>
