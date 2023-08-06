import Toolbar from './wyvr_measure.svelte';

// https://stackoverflow.com/questions/16808486/explanation-of-window-performance-javascript

let is_active = !!sessionStorage.getItem('wyvr_measure');
let target;
let component;

export default {
    icon: '📈',
    name: 'Measure Performance',
    description: 'get performance data from the current page',
    onMount: () => {
        if (is_active) {
            
            target = document.createElement('div');
            target.classList.add('wyvr_measure');
            document.body.appendChild(target);
            component = new Toolbar({ target });
            on('wyvr_measure_close', () => {
                close();
                location.reload();
            });
        }
    },
    onClick: () => {
        if (is_active) {
            close();
        } else {
            sessionStorage.setItem('wyvr_measure', 'true');
        }
        location.reload();
    },
};

function close() {
    sessionStorage.removeItem('wyvr_measure');
}

/*

wyvr_message('reloading to measure CWV');
    const url = location.origin + location.pathname;
    location = location.search.indexOf('wyvr_debug_measure_cwv') > -1 ? url : `${url}?wyvr_debug_measure_cwv`;


    if (window.location.search.indexOf('wyvr_debug_measure_cwv') > -1) {
        try {
            // LCP
            let lastLcp;
            new PerformanceObserver((entryList) => {
                (entryList.getEntries() || []).forEach((entry) => {
                    if (entry.startTime !== lastLcp) {
                        console.group(`New LCP: ${entry.startTime}ms`);
                        console.log(`Size: ${entry.size} px^2`);
                        console.log('HTML:', entry.element || '(no element)');
                        console.groupEnd();
                        lastLcp = entry.startTime;
                    }
                });
            }).observe({ type: 'largest-contentful-paint', buffered: true });
    
            // CLS
            new PerformanceObserver((entryList) => {
                let cls = 0;
                let nodes = [];
                (entryList.getEntries() || []).forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        // omit entries likely caused by user input
                        cls += entry.value;
                        nodes = [].concat(
                            nodes,
                            entry.sources.map((source) => {
                                return source.node;
                            })
                        );
                    }
                });
                if (cls > 0 || nodes.length > 0) {
                    console.group(`Cumulative Layout Shift: ${cls}ms`);
                    console.log(`Shifting nodes`, nodes);
                    console.groupEnd();
                }
            }).observe({ type: 'layout-shift', buffered: true });
    
            // FCP
            new PerformanceObserver((entryList) => {
                (entryList.getEntriesByName('first-contentful-paint') || []).forEach((entry) => {
                    console.group(`First Contentful Paint: ${entry.startTime}ms`);
                    console.groupEnd();
                });
            }).observe({ type: 'paint', buffered: true });
    
            // FID
            new PerformanceObserver((entryList) => {
                let entry = (entryList.getEntries() || []).find((x) => x);
                if (!entry) {
                    return;
                }
                let fid = entry.processingStart - entry.startTime;
                console.group(`First Input Delay: ${fid}ms`);
                console.log(entry);
                console.groupEnd();
            }).observe({ type: 'first-input', buffered: true });
            document.body.click();
        } catch (e) {
            console.error('Measuring CWV is not supported');
        }
    }*/
