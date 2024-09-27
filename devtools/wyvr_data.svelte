<script>
    import { onDestroy, onMount } from 'svelte';
    import TreeView from './wyvr_data/TreeView.svelte';
    import BottomWindow from './wyvr_devtools_helper/BottomWindow.svelte';
    import Loader from './wyvr_devtools_helper/Loader.svelte';
    import { keys, tabs } from './wyvr_data/tabs';

    let term;

    let view;
</script>

<BottomWindow
    {tabs}
    search={true}
    height={400}
    on:tab={(e) => {
        term = '';
        view = e.detail;
    }}
    on:search={(e) => (term = e.detail)}
    on:close={() => trigger('wyvr_data_close')}
    let:tab
>
    {#if tab}
        <TreeView {tab} {term}></TreeView>
    {:else}
        <Loader></Loader>
    {/if}
</BottomWindow>
