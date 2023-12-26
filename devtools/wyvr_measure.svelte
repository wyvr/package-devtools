<script>
    import { initPerfume } from 'perfume.js';
    import { onMount } from 'svelte';
    import BottomWindow from './wyvr_devtools_helper/BottomWindow.svelte';

    const coreMetrics = ['TTFB', 'RT', 'FCP', 'LCP', 'FID', 'CLS', 'TBT'];
    const coreMetricsName = {
        TTFB: 'Time to First Byte',
        RT: 'Response Time',
        FCP: 'First Contentful Paint',
        LCP: 'Largest Contentful Paint',
        FID: 'First Input Delay',
        CLS: 'Cumulative Layout Shift',
        TBT: 'Total Blocking Time',
    };

    let core = {};
    let coreKeys = [];

    let entries = [];
    let state = 'idle';

    onMount(() => {
        new initPerfume({
            firstPaint: true,
            firstContentfulPaint: true,
            firstInputDelay: true,
            dataConsumption: true,
            navigationTiming: true,
            resourceTiming: true,
            storageEstimate: true,
            maxMeasureTime: 10000,
            analyticsTracker: (options) => {
                // detect core metrics
                if (coreMetrics.indexOf(options.metricName) > -1) {
                    console.log('CORE');
                    console.log(options);
                    core[options.metricName] = options;
                    core = core;
                    coreKeys = Object.keys(core);
                    return;
                }
                entries = entries.concat(options);
            },
        });
    });

    function getRessourceFile(url) {
        if (url.indexOf('http') > -1) {
            const parts = url.split('/').reverse();
            const index = parts.findIndex((item) => {
                return item.indexOf('.') > -1 || item.indexOf('?') != 0;
            });
            return parts
                .slice(0, index + 1)
                .reverse()
                .join('/')
                .replace(/(\?.*)$/, '<span class="dim">$1</span>');
        }
        return url;
    }
</script>

<BottomWindow
    tabs={[
        { name: 'Core', value: 'core' },
        { name: 'Resources', value: 'resources' },
    ]}
    on:tab={(e) => (state = e.detail)}
    on:close={() => trigger('wyvr_measure_close')}
>
    {#if state == 'idle'}
        &hellip;
    {:else if state == 'core'}
        <div class="core-grid">
            {#each coreKeys as key}
                <div class="core {core[key]?.rating || ''}">
                    {#if core[key]}
                        <h2>
                            {core[key].metricName}
                        </h2>
                        {#if coreMetricsName[core[key].metricName]}
                            <span>{coreMetricsName[core[key].metricName]}</span>
                        {/if}
                        {#if core[key].rating}
                            <b>{core[key].rating}</b>
                        {/if}
                    {/if}
                </div>
            {/each}
        </div>
    {:else if state == 'resources'}
        <ol>
            {#each entries as entry}
                <li>
                    {#if entry.metricName == 'navigationTiming'}
                        <b>{entry.metricName}</b>
                        {entry.data.totalTime}ms
                    {:else if entry.metricName == 'resourceTiming'}
                        <i class="icon {entry.data.initiatorType || 'unknown'}"
                        ></i>
                        <a
                            href={entry.data.name}
                            target="_blank"
                            title={entry.data.name}
                            >{@html getRessourceFile(entry.data.name)}</a
                        >
                        <small>{entry.data.name}</small>
                    {:else if entry.metricName == 'dataConsumption' || entry.metricName == 'storageEstimate' || entry.metricName == 'networkInformation'}
                        <!-- ignore -->
                    {:else}
                        <details>
                            <summary
                                >unhandeled metric {entry.metricName}</summary
                            >
                            <pre>{JSON.stringify(entry, null, 4)}</pre>
                        </details>
                    {/if}
                </li>
            {/each}
        </ol>
    {/if}
</BottomWindow>

<style>
    .core-grid {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        justify-content: flex-start;
        flex-wrap: wrap;
        margin: 0 1rem;
    }
    .core {
        display: flex;
        flex-direction: column;
        width: 200px;
        position: relative;
        color: var(--color);
        padding-left: 1.5rem;
    }

    .core h2 {
        font-size: 1.2rem;
        margin: 0;
        color: #fff;
    }
    .core.good {
        --color: olivedrab;
    }
    .core.needs-improvement {
        --color: coral;
    }
    .core.poor {
        --color: crimson;
    }
    .core:before {
        content: '';
        display: block;
        width: 1rem;
        height: 1rem;
        background: var(--color);
        position: absolute;
        top: 0.2rem;
        left: 0;
        border-radius: 50%;
    }
    .core span {
        font-size: 0.7rem;
        color: #fff;
    }
    ol {
        list-style: none;
        padding: 0;
        margin: 0 0 0.2rem;
    }
    ol a {
        color: #fff;
    }
    .icon {
        font-size: 1.1rem;
        margin-right: 0.5rem;
        font-style: normal;
    }
    .icon:before {
        content: '?';
    }
    i.icon:global(.img:before) {
        content: '🖼️';
    }
    i.icon:global(.script:before) {
        content: '📜';
    }
    i.icon:global(.link:before) {
        content: '🔗';
    }
    i.icon:global(.css:before) {
        content: '🎨';
    }
    i.icon:global(.fetch:before) {
        content: '⬇️';
    }
    i.icon:global(.other:before) {
        content: '📦';
    }

    li small {
        display: block;
        font-size: 0.8rem;
    }
    li small,
    li :global(.dim) {
        opacity: 0.5;
    }
</style>
