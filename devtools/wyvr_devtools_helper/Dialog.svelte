<script>
    import { createEventDispatcher, onDestroy, onMount } from 'svelte';
    const dispatcher = createEventDispatcher();

    export let show = false;
    let open = true;
    let x = 10;
    let y = 10;
    let container;
    onMount(() => {
        addEventListener('mousemove', mousemove);
        addEventListener('mouseup', mouseup);
    });
    onDestroy(() => {
        removeEventListener('mousemove', mousemove);
        removeEventListener('mouseup', mouseup);
    });

    function toggle() {
        open = !open;
        setTimeout(() => moveto(x, y), 10);
    }

    let moving = false;
    function mouseup(e) {
        moving = false;
    }
    function mousemove(e) {
        if (moving) {
            moveto(x + e.movementX, y + e.movementY);
        }
    }
    function moveto(new_x, new_y) {
        const rect = container?.getBoundingClientRect();
        x = Math.max(Math.min(new_x, window.innerWidth - rect.width), 0);
        y = Math.max(Math.min(new_y, window.innerHeight - rect.height), 0);
    }
    function visible_css(value) {
        if (!value) {
            return 'display:none;';
        }
        return '';
    }
</script>

<svelte:window
    on:keydown={(e) => {
        if (e.key == 'Escape') {
            dispatcher('close');
        }
    }}
/>

<div
    class="dialog"
    bind:this={container}
    style="{visible_css(show)}--x: {x}px; --y: {y}px;"
>
    <div
        class="drag topbar"
        on:mousedown={() => {
            moving = true;
        }}
    >
        <button
            on:click={() => {
                dispatcher('close');
            }}
            title="close">⨯</button
        >
        <button on:click={toggle} title={open ? 'hide' : 'show'}
            >{#if open}_{:else}☐{/if}</button
        >
    </div>
    <div class="inner" style={visible_css(open)}>
        <slot />
    </div>
</div>

<style>
    .drag {
        cursor: move;
    }
    .dialog {
        position: fixed;
        left: var(--x);
        top: var(--y);
        z-index: 110000;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(3px);
        max-height: 80vh;
        max-width: 80vw;
        min-width: 200px;
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5);
        color: var(--wyvr-debug-text);
        display: flex;
        flex-direction: column;
    }

    .topbar {
        display: flex;
        flex-direction: row-reverse;
        border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    }
    .topbar button {
        padding: 5px 20px;
        background: transparent;
        border: 0;
        border-left: 2px solid var(--line-color);
        color: var(--wyvr-debug-primary);
        font-size: var(--wyvr-debug-size);
        cursor: pointer;
    }
    .inner {
        overflow: auto;
        flex-grow: 1;
    }
</style>
