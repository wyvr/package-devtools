<script>
    import { onDestroy, onMount } from 'svelte';
    import Tabs from './wyvr_devtools_helper/Tabs.svelte';

    const coreMetrics = ["TTFB", "RT", "FCP", "LCP", "FID", "CLS", "TBT"];

    $: core = {};
    $: coreKeys = Object.keys(core);

    $: entries = [];
    let height = 200;

    onMount(() => {
        new Perfume({
            firstPaint: true,
            firstContentfulPaint: true,
            firstInputDelay: true,
            dataConsumption: true,
            navigationTiming: true,
            resourceTiming: true,
            storageEstimate: true,
            analyticsTracker: (options) => {
                console.log(options);
                // detect core metrics
                if (coreMetrics.indexOf(options.metricName) > -1) {
                    console.log('CORE');
                    core[options.metricName] = options;
                    core = core;
                    return;
                }
                entries = entries.concat(options);
            },
        });
        addEventListener("mousemove", mousemove);
        addEventListener("mouseup", mouseup);
    });
    onDestroy(() => {
        removeEventListener("mousemove", mousemove);
        removeEventListener("mouseup", mouseup);
    });

    let moving = false;
    function mouseup(e) {
        moving = false;
    }
    function mousemove(e) {
        if (moving) {
            height = Math.max(height + e.movementY * -1, 0);
        }
    }
</script>

<div class="grid">
    <div
        class="drag"
        on:mousedown={() => {
            moving = true;
        }}
    />
    <Tabs
        tabs={[
            { name: 'Core', value: 'core' },
            { name: 'Resources', value: 'resources' },
        ]}
        on:change={(e) => (state = e.detail)}
        on:close={() => trigger('wyvr_measure_close')}
    />
    <div class="content" style="--height: {height}px;">
        {#each coreKeys as key}
            {#if core[key]}
                <h2>
                    {core[key].metricName}{#if core[key].rating}<i
                            style="margin-left:10px;">{core[key].rating}</i
                        >{/if}
                </h2>
                <pre>{JSON.stringify(core[key], null, 4)}</pre>
            {:else}
                <h2>{key} loading</h2>
            {/if}
        {/each}
        <hr />
        {#each entries as entry}
            <h2>
                {entry.metricName}{#if entry.rating}<i style="margin-left:10px;"
                        >{entry.rating}</i
                    >{/if}
            </h2>
            <pre>{JSON.stringify(entry, null, 4)}</pre>
        {/each}
    </div>
</div>

<style>
    :global(.wyvr_measure) {
        position: sticky;
        bottom: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        backdrop-filter: blur(3px);
        overflow: auto;
        --line-color: rgba(255, 255, 255, 0.3);
    }

    .drag {
        cursor: ns-resize;
        height: 2px;
        background: var(--line-color);
    }
    .drag:hover {
        height: 5px;
    }
    .drag:active {
        --line-color: var(--wyvr-debug-primary);
    }
    .grid {
        display: flex;
        flex-direction: column;
    }
    .content {
        padding: 10px;
        overflow: auto;
        height: var(--height);
    }
</style>
