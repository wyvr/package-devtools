<script>
    import { onDestroy, onMount } from 'svelte';
    import { get_parent_node, search } from './wyvr_inspect/helper.js';
    import Tree from './wyvr_data/tree.svelte';

    let hydrate_components = [];
    let active_component;
    let data;
    let structure;
    let show = true;
    let x = 10;
    let y = 10;
    let container;
    onMount(() => {
        reset_data();
        hydrate_components = Array.from(document.querySelectorAll('[data-hydrate]'));
        hydrate_components.map((el) => {
            el.addEventListener('click', inspect);
        });
        if (hydrate_components.length == 0) {
            wyvr_message('no elements to inspect available');
        }
        document.body.classList.add('wyvr_inspect_outline');
        addEventListener('mousemove', mousemove);
        addEventListener('mouseup', mouseup);
    });
    onDestroy(() => {
        document.body.classList.remove('wyvr_inspect_outline');
        hydrate_components.map((el) => {
            el.removeEventListener('click', inspect);
        });
        removeEventListener('mousemove', mousemove);
        removeEventListener('mouseup', mouseup);

        if (active_component) {
            active_component.classList.remove('wyvr_inspect_active');
        }
    });

    async function inspect({ target }) {
        if (!target || target == document.body) {
            console.error('can not get target from event', e);
            return;
        }
        target = get_parent_node(target, (target) => target.getAttribute('data-hydrate'));
        if (target == active_component) {
            return;
        }
        if (active_component) {
            active_component.classList.remove('wyvr_inspect_active');
        }
        active_component = target;
        target.classList.add('wyvr_inspect_active');

        const active_data = {
            name: target.getAttribute('data-hydrate').split('_').pop(),
            path: target.getAttribute('data-hydrate-path'),
        };

        const props = await wyvr_props(target);
        active_data.props = props;

        if (!structure) {
            structure = await wyvr_devtools_inspect_structure_data();
        }
        if (structure) {
            const active_data_path = active_data.path.replace(/^@src\//, 'src/');
            const search_result = []
                .concat(
                    search(structure.doc, active_data_path),
                    search(structure.layout, active_data_path),
                    search(structure.page, active_data_path)
                )
                .filter(Boolean);
            if (search_result.length > 0) {
                const struc = search_result[0];
                console.log(struc);
                if (struc.pkg) {
                    active_data.pkg = struc.pkg;
                }
                if (struc.config) {
                    active_data.config = struc.config;
                }
            } else {
                console.warn('component', active_data.path, 'could not be found');
            }
        }

        data = active_data;
    }

    function reset_data() {
        data = {
            name: undefined,
            path: undefined,
            props: undefined,
            config: undefined,
            pkg: undefined,
        };
    }

    function toggle() {
        show = !show;
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
</script>

<svelte:window
    on:keydown={(e) => {
        if (e.key == 'Escape') {
            show = false;
        }
    }}
/>

{#if active_component && data}
    <div class="sidebar" bind:this={container} style="--x: {x}px; --y: {y}px;">
        <div
            class="drag topbar"
            on:mousedown={() => {
                moving = true;
            }}
        >
            <button
                on:click={() => {
                    trigger('wyvr_inspect_close');
                }}
                title="close">⨯</button
            >
            <button on:click={toggle} title={show ? 'hide' : 'show'}
                >{#if show}_{:else}☐{/if}</button
            >
        </div>
        {#if show}
            <div class="inner">
                <div class="block">
                    <Tree data={{ name: data.name, path: data.path }} open={true}
                        ><div class="headline">
                            <span class="icon">🔍</span><span class="text">Component</span>
                        </div></Tree
                    >
                </div>
                <div class="block">
                    {#if data.pkg}
                        <Tree data={data.pkg} open={true}
                            ><div class="headline">
                                <span class="icon">📦</span><span class="text">Package</span>
                            </div></Tree
                        >
                    {:else}
                        <em>no package found</em>
                    {/if}
                </div>
                {#if data.props}
                    <div class="block">
                        <Tree data={data.props} open={true}
                            ><div class="headline">
                                <span class="icon">🔧</span><span class="text">Props</span>
                            </div></Tree
                        >
                    </div>
                {/if}
                {#if data.config}
                    <div class="block">
                        <Tree data={data.config} open={true}
                            ><div class="headline">
                                <span class="icon">⚙</span><span class="text">Config</span>
                            </div></Tree
                        >
                    </div>
                {/if}
            </div>
        {/if}
    </div>
{/if}

<style>
    :root {
        --wyvr-inspect-outline: rgba(255, 55, 0, 0.5);
        --wyvr-inspect-outline-active: #f30;
        --line-color: rgba(255, 255, 255, 0.3);
    }
    .drag {
        cursor: move;
    }
    .sidebar {
        position: fixed;
        left: var(--x);
        top: var(--y);
        z-index: 10000;
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

    .headline {
        font-weight: 700;
    }
    .headline .icon {
        padding-right: 10px;
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
    .block {
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding: 20px;
    }
    .block:first-child {
        border-top: none;
    }
    :global(.wyvr_inspect_outline [data-hydrate]) {
        outline: 2px solid var(--wyvr-inspect-outline);
        min-width: 10px;
        min-height: 10px;
    }
    :global(.wyvr_inspect_outline [data-hydrate] *) {
        pointer-events: none;
    }
    :global(.wyvr_inspect_outline [data-hydrate]:hover) {
        outline: 2px solid var(--wyvr-inspect-outline-active);
    }
    :global(.wyvr_inspect_active) {
        outline: 2px solid var(--wyvr-debug-primary) !important;
    }
    table {
        width: 100%;
        border-spacing: 1px;
        --radius: calc(var(--size) * 0.125);
    }
</style>
