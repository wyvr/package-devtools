<script>
import { onMount, onDestroy } from 'svelte';
import BottomWindow from './wyvr_devtools_helper/BottomWindow.svelte';
import Loader from './wyvr_devtools_helper/Loader.svelte';
import Folder from './wyvr_devtools_helper/Folder.svelte';
import Dialog from './wyvr_devtools_helper/Dialog.svelte';
import Detail from './wyvr_file_manager/Detail.svelte';

let packages = undefined;
let package_tree = undefined;
let init_files = undefined;
let state = undefined;
let term = undefined;
let searching = false;
let show_dialog = false;

let selected_file;
let selected_pkg;
let selected_package_filter = undefined;

onMount(() => {
    on('wyvr_devtools_action_result', (data) => {
        switch (data.action) {
            case 'config':
                packages = config_to_packages(data.data);
                break;
            case 'package_tree':
                package_tree = data.data;
                init_files = config_to_list(data.data);
                break;
        }
    });
    trigger('wyvr_devtools_action', { type: 'config' });
    trigger('wyvr_devtools_action', { type: 'package_tree' });
    on('wyvr_file_manager_select', (e) => {
        selected_file = e.data;
        selected_pkg = package_tree[e.data];
        show_dialog = true;
    });
});

onDestroy(() => {
    off('wyvr_devtools_action_result');
    off('wyvr_file_manager_select');
});

$: files = filter_packages(
    term
        ? init_files.filter((path) => {
              if (!term) return true;
              return path.toLowerCase().includes(term.toLowerCase());
          })
        : init_files,
    selected_package_filter
);

function get_npm_link(path) {
    if (!path) return '';
    return `https://www.npmjs.com/search?q=${encodeURIComponent(path.split('/').slice(0, 2).join('/'))}`;
}

function config_to_packages(config) {
    if (!Array.isArray(config?.packages)) {
        return [];
    }
    return config.packages.map((pkg) => {
        const pattern = '/node_modules/';
        const npm_index = pkg.path.indexOf(pattern);
        if (npm_index > -1) {
            pkg.type = 'npm';
            pkg.path = pkg.path.substr(npm_index + pattern.length);
        } else {
            pkg.type = 'local';
        }
        return pkg;
    });
}

function config_to_list(config) {
    if (!config) {
        return [];
    }
    return Object.keys(config).filter(Boolean);
}

function update_package_filter(e) {
    const active = Object.keys(e.detail).filter((key) => e.detail[key]);
    if (active.length == packages.length) {
        selected_package_filter = undefined;
    } else {
        selected_package_filter = active;
    }
}

function filter_packages(files, selected_package_filter) {
    if (selected_package_filter == undefined) {
        return files;
    }
    return files.filter((file) => {
        const pkg = package_tree[file];
        if (!pkg) {
            return false;
        }
        return selected_package_filter.includes(pkg.name);
    });
}
</script>

<BottomWindow
    height={400}
    search={state != 'packages'}
    tabs={[
        { name: 'Tree', value: 'tree', icon: '<i class="ri-node-tree"></i>' },
        {
            name: 'Packages',
            value: 'packages',
            icon: '<i class="ri-folders-line"></i>',
        },
    ]}
    on:search={(e) => {
        term = e.detail;
        searching = true;
    }}
    on:tab={(e) => {
        state = e.detail;
        term = undefined;
        searching = false;
    }}
    on:close={() => trigger('wyvr_file_manager_close')}
>
    {#if state == 'packages'}
        {#if packages}
            <ol>
                {#each packages as pkg}
                    <li>
                        {#if pkg.type == 'npm'}
                            <a href={get_npm_link(pkg.path)} target="_blank">
                                <i class="ri-npmjs-line" title="npm package"
                                ></i>
                                {pkg.name}
                            </a>
                            <code>{pkg.path}</code>
                        {:else}
                            <i class="ri-folder-line" title="local"></i>
                            {pkg.name}

                            <code>{pkg.path}</code>
                        {/if}
                    </li>
                {/each}
            </ol>
        {:else}
            <Loader></Loader>
        {/if}
    {:else if state == 'tree'}
        <Folder
            data={files}
            highlight={term}
            {packages}
            on:selected_packages={update_package_filter}
        ></Folder>
    {/if}
</BottomWindow>
<Dialog
    show={show_dialog}
    on:close={() => {
        selected_file = undefined;
        selected_pkg = undefined;
        show_dialog = false;
    }}
>
    <Detail file={selected_file} pkg={selected_pkg} {packages}></Detail>
</Dialog>

<style>
    i[class^='ri-'] {
        font-size: 1.4rem;
    }
    code {
        display: block;
        padding-left: 1.5rem;
        font-size: 0.75rem;
        opacity: 0.75;
    }
</style>
