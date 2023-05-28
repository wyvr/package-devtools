<script>
    import { onDestroy, onMount } from 'svelte';
    import WyvrInspectRow from './wyvr_inspect_row.svelte';
    import { get_parent_node } from './wyvr_inspect/helper.mjs';

    let hydrate_components = [];
    let active_component;
    let data;
    let structure;
    let show = true;
    let x = 10;
    let y = 10;
    onMount(() => {
        reset_data();
        hydrate_components = Array.from(document.querySelectorAll('[data-hydrate]'));
        hydrate_components.map((el) => {
            el.addEventListener('click', inspect);
        });
        if(hydrate_components.length == 0) {
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
        if (props) {
            const props_keys = Object.keys(props);
            if (props_keys.length > 0) {
                active_data.props_keys = props_keys;
                active_data.props = props;
            }
        }

        if (!structure) {
            structure = await wyvr_devtools_inspect_structure_data();
        }
        if (structure) {
            const search_result = [].concat(
                search(structure.doc, active_data.path.replace(/^@[src]{3}\//, '')),
                search(structure.layout, active_data.path.replace(/^@[src]{3}\//, '')),
                search(structure.page, active_data.path.replace(/^@[src]{3}\//, ''))
            );
            const struc = search_result[0];
            if (search_result.length > 0) {
                if (struc) {
                    if (struc.pkg) {
                        active_data.pkg = struc.pkg;
                    }
                    if (struc.config) {
                        active_data.config = struc.config;
                        active_data.config_keys = Object.keys(struc.config);
                    }
                }
            }
        }

        data = active_data;
    }

    function reset_data() {
        data = {
            name: undefined,
            path: undefined,
            props: undefined,
            props_keys: [],
            config: undefined,
            config_keys: [],
            pkg: undefined,
        };
    }

    function search(node, name) {
        if (!node || typeof node != 'object') {
            return [];
        }
        if (node.file == name) {
            return [node];
        }
        if (Array.isArray(node.components) && node.components.length > 0) {
            return node.components
                .map((entry) => search(entry, name))
                .filter((x) => x)
                .flat();
        }
        return [];
    }

    function toggle() {
        show = !show;
    }

    let moving = false;
    function mouseup(e) {
        moving = false;
    }
    function mousemove(e) {
        if (moving) {
            x = Math.max(x + e.movementX, 0);
            y = Math.max(y + e.movementY, 0);
        }
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
    <div class="sidebar" style="--x: {x}px; --y: {y}px;">
        <div
            class="drag topbar"
            on:mousedown={() => {
                moving = true;
            }}
        >
            <button
                on:click={() => {
                    trigger('wyvr_inspect_close');
                }} title="close">⨯</button
            >
            <button on:click={toggle} title={show ? 'hide' : 'show'}
                >{#if show}_{:else}☐{/if}</button
            >
        </div>
        {#if show}
            <div class="block">
                <div class="headline"><span class="icon">🔍</span><span class="text">Component</span></div>
                <table>
                    <WyvrInspectRow key={data.name} value={data.path} />
                </table>
            </div>
            <div class="block">
                <div class="headline"><span class="icon">📦</span><span class="text">Package</span></div>
                {#if data.pkg}
                    <table>
                        <WyvrInspectRow key={data.pkg.name} value={data.pkg.path} />
                    </table>
                {:else}
                    <em>no package found</em>
                {/if}
            </div>
            {#if data.props && data.props_keys}
                <div class="block">
                    <div class="headline"><span class="icon">🛠</span><span class="text">Props</span></div>
                    <table>
                        {#each data.props_keys as key}
                            <WyvrInspectRow {key} value={data.props[key]} type={'json'} />
                        {/each}
                    </table>
                </div>
            {/if}
            {#if data.config}
                <div class="block">
                    <div class="headline"><span class="icon">⚙</span><span class="text">Config</span></div>
                    <table>
                        {#each data.config_keys as key}
                            <WyvrInspectRow {key} value={data.config[key]} type={'config'} />
                        {/each}
                    </table>
                </div>
            {/if}
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
        overflow: auto;
        min-width: 200px;
        box-shadow: 0 5px 10px rgba(0,0,0,0.5);
        color: var(--wyvr-debug-text);
    }

    .headline {
        padding-bottom: 10px;
        font-weight: 700;
    }
    .headline .icon {
        padding-right: 10px;
    }
    .topbar {
        display: flex;
        flex-direction: row-reverse;
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
