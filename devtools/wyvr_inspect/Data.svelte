<script>
    import Tree from './../wyvr_devtools_helper/Tree.svelte';
    export let data = undefined;
    export let component = undefined;
</script>

{#if component && data}
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
                    <span class="icon">📦</span><span class="text">Package</span
                    >
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
{/if}

<style>
    :root {
        --wyvr-inspect-outline: rgba(255, 55, 0, 0.5);
        --wyvr-inspect-outline-active: #f30;
        --line-color: rgba(255, 255, 255, 0.3);
    }

    .headline {
        font-weight: 700;
    }
    .headline .icon {
        padding-right: 10px;
    }
    .block {
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding: 20px;
    }
    .block:first-child {
        border-top: none;
    }
</style>
