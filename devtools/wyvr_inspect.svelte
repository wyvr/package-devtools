<script>
    import { onDestroy, onMount } from 'svelte';
    import { get_parent_node, search } from './wyvr_inspect/helper.js';
    import Dialog from './wyvr_devtools_helper/Dialog.svelte';
    import Data from './wyvr_inspect/Data.svelte';
    import { wyvr_props } from '@wyvr/generator/src/resource/props.js';

    let hydrate_components = [];
    let active_component;
    let data;
    let structure;
    onMount(() => {
        reset_data();
        hydrate_components = Array.from(
            document.querySelectorAll('[data-hydrate]'),
        );
        hydrate_components.map((el) => {
            el.addEventListener('click', inspect);
        });
        if (hydrate_components.length == 0) {
            wyvr_message('no elements to inspect available');
        }
        document.body.classList.add('wyvr_inspect_outline');
    });
    onDestroy(() => {
        document.body.classList.remove('wyvr_inspect_outline');
        hydrate_components.map((el) => {
            el.removeEventListener('click', inspect);
        });

        if (active_component) {
            active_component.classList.remove('wyvr_inspect_active');
        }
    });

    async function inspect({ target }) {
        if (!target || target == document.body) {
            console.error('can not get target from event', e);
            return;
        }
        target = get_parent_node(target, (target) => {
            return target.getAttribute('data-hydrate');
        });
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
            const active_data_path = active_data.path.replace(
                /^@src\//,
                'src/',
            );
            const search_result = []
                .concat(
                    search(structure.doc, active_data_path),
                    search(structure.layout, active_data_path),
                    search(structure.page, active_data_path),
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
                console.warn(
                    'component',
                    active_data.path,
                    'could not be found',
                );
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
</script>

<Dialog
    show={active_component && data}
    on:close={() => trigger('wyvr_inspect_close')}
>
    <Data {data} component={active_component} />
</Dialog>

<style>
    :root {
        --wyvr-inspect-outline: rgba(255, 55, 0, 0.5);
        --wyvr-inspect-outline-active: #f30;
        --line-color: rgba(255, 255, 255, 0.3);
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
</style>
