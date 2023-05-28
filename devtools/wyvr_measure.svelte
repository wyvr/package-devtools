<script>
    import { onDestroy, onMount } from 'svelte';

    let entries;
    let data;
    let height = 200;
    let navigation;

    onMount(() => {
        entries = performance.getEntries();
        if (!entries) {
            return;
        }

        entries.forEach((entry) => {
            if (entry.entryType == 'navigation') {
                navigation = JSON.parse(JSON.stringify(entry));

            }
            /*if(entry.entryType == 'first-paint') {
                collected.fp = entry;
            }
            if(entry.entryType == 'first-contentful-paint') {
                collected.fcp = entry;
            }*/
        });

        create_observer('largest-contentful-paint', (entries) => {
            console.log(entries);
        });
        addEventListener('mousemove', mousemove);
        addEventListener('mouseup', mouseup);
    });
    onDestroy(() => {
        removeEventListener('mousemove', mousemove);
        removeEventListener('mouseup', mouseup);
    });

    function create_observer(name, cb) {
        if (PerformanceObserver.supportedEntryTypes.indexOf(name) > -1) {
            try {
                new PerformanceObserver((entryList) => {
                    cb(entryList.getEntries() || []);
                }).observe({ type: name, buffered: true });
            } catch (e) {
                console.error(e);
            }
        }
    }

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
    <div class="content" style="--height: {height}px;">
        {#if navigation}
        {navigation.redirectCount}
        <ul>
            <li>navigationStart - redirectStart</li>
            <li>redirectEnd - redirectStart</li>
            <li>domainLookupEnd - domainLookupStart</li>
            <li>connectEnd - connectStart</li>
            <li>[secureConnectionStart]</li>
            <li>responseStart - requestStart</li>
            <li>unloadEnd - unloadStart</li>
            <li>responseEnd - responseStart</li>
            <li>domInteractive</li>
            <li>domComplete - domLoading</li>
            <li>domContentLoadingEventEnd - domContentLoadingEventStart {navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart}</li>
            <li>loadEventEnd - loadEventStart</li>
        </ul>
        {/if}

        <!-- "name": "http://localhost:3000/search/",
    "entryType": "navigation",
    "startTime": 0,
    "duration": 118.30000000074506,
    "initiatorType": "navigation",
    "nextHopProtocol": "http/1.1",
    "workerStart": 0,
    "redirectStart": 0,
    "redirectEnd": 0,
    "fetchStart": 1.5999999977648258,
    "domainLookupStart": 5.800000000745058,
    "domainLookupEnd": 5.800000000745058,
    "connectStart": 5.800000000745058,
    "connectEnd": 5.899999998509884,
    "secureConnectionStart": 0,
    "requestStart": 5.899999998509884,
    "responseStart": 7.300000000745058,
    "responseEnd": 9.199999999254942,
    "transferSize": 14115,
    "encodedBodySize": 13815,
    "decodedBodySize": 13815,
    "serverTiming": [],
    "unloadEventStart": 11.800000000745058,
    "unloadEventEnd": 11.800000000745058,
    "domInteractive": 61.19999999925494,
    "domContentLoadedEventStart": 92.09999999776483,
    "domContentLoadedEventEnd": 100.09999999776483,
    "domComplete": 118.30000000074506,
    "loadEventStart": 118.30000000074506,
    "loadEventEnd": 118.30000000074506,
    "type": "reload",
    "redirectCount": 0 -->

        <pre>{JSON.stringify(navigation, null, 4)}</pre>
    </div>
</div>

<style>
    :global(.wyvr_measure) {
        position: sticky;
        bottom: 0;
        z-index: 10000;
        background: rgba(0, 0, 0, 0.9);
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
