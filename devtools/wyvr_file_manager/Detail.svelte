<script>
import Loader from './../wyvr_devtools_helper/Loader.svelte';
import { get_ext_color, get_ext_icon, get_ext } from './../wyvr_devtools_helper/folder/helper.js';

export let file = undefined;
export let pkg = undefined;
export let packages = undefined;

let debouncer;

let copy_package;
let state = 'idle';

$: is_npm = pkg?.path.indexOf('/node_modules/') > -1;
$: pkg_index = packages?.findIndex((p) => p.name === pkg?.name) ?? -1;
$: copyable_packages = packages?.slice(0, pkg_index).filter((pkg) => {
    return pkg.type === 'local';
});

$: update_state(file, pkg);

function update_state() {
    state = 'idle';
}

function join(...parts) {
    return parts.filter(Boolean).join('/').replace(/\/+/g, '/');
}

function copy() {
    const to_path = packages.find((pkg) => pkg.name === copy_package)?.path;
    if (!to_path || !file || !pkg.path) {
        wyvr_message('error while copying file');
        return;
    }
    trigger('wyvr_devtools_action', {
        type: 'file_system',
        action: 'copy',
        path: join(pkg.path, file),
        to: join(to_path, file)
    });
    update_package_tree();
    wyvr_message('copying file');
}
function remove() {
    if (!file || !pkg.path) {
        wyvr_message('error while deleting file');
        return;
    }
    trigger('wyvr_devtools_action', {
        type: 'file_system',
        action: 'delete',
        path: join(pkg.path, file)
    });
    update_package_tree();
    wyvr_message('deleting file');
}
function update_package_tree() {
    state = 'busy';
    clearTimeout(debouncer);
    debouncer = setTimeout(() => {
        trigger('wyvr_devtools_action', { type: 'package_tree' });
        // update seleted file
        setTimeout(() => {
            trigger('wyvr_file_manager_select', { data: file });
        }, 1000);
    }, 1000);
}
</script>

<div class="block">
    <div class="headline">File</div>
    <i
        class="ri-{get_ext_icon(get_ext(file))}"
        style="color: {get_ext_color(get_ext(file))};"
    ></i>
    {file}
</div>
{#if pkg}
    <div class="block">
        <div class="headline">Package</div>

        <b>{pkg.name}</b><br />
        <code>{pkg.path}</code>
    </div>
{/if}
{#if state == 'busy'}
    <div class="block">
        <Loader></Loader>
    </div>
{:else}
    {#if copyable_packages && copyable_packages.length > 0}
        <div class="block">
            Copy file to package
            <select bind:value={copy_package}>
                {#each copyable_packages as pkg}
                    <option value={pkg.name}>{pkg.name}</option>
                {/each}
            </select>
            <button on:click={copy}>Copy</button>
        </div>
    {/if}
    {#if !is_npm}
        <div class="block">
            <button on:click={remove}>Delete</button>
        </div>
    {/if}
{/if}

<style>
    .headline {
        opacity: 0.5;
    }
    .block {
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding: 20px;
    }
    button {
        font-size: 1rem;
        font-family: monospace;
        background: var(--wyvr-debug-bg);
        border: 1px solid var(--wyvr-debug-primary);
        color: var(--wyvr-debug-primary);
        cursor: pointer;
        padding: 0.1rem 0.5rem;
        border-radius: 0.25rem;
        text-align: center;
        min-width: 24px;
        line-height: 1rem;
    }
    select {
        background: var(--wyvr-debug-bg);
        color: #fff;
        font-size: 1rem;
        border: 1px solid var(--wyvr-debug-primary);
        padding: 0.1rem 0.5rem;
        border-radius: 0.25rem;
        cursor: pointer;
    }
</style>
