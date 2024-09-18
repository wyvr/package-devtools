<script>
import { get_ext_color, get_ext_icon, get_folder_color, get_folder_icon } from './helper.js';

export let file;
export let level = 0;
export let is_folder = false;
export let highlight = undefined;

let ext = file?.name.split('.').pop();

function get_icon(ext) {
    if (is_folder) {
        if (level == 1) {
            return get_folder_icon(file.name);
        }
        return get_folder_icon();
    }
    return get_ext_icon(ext);
}

function get_color(ext) {
    if (is_folder) {
        if (level == 1) {
            return get_folder_color(file.name);
        }
        return get_folder_color();
    }

    return get_ext_color(ext);
}

function get_text(text, highlight) {
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (highlight) {
        text = text.replace(new RegExp(`(${highlight})`, 'gi'), '<span class="highlight">$1</span>');
    }
    if (text.match(/^".*"$/)) {
        return text;
    }
    return text;
}

function select(data) {
    trigger('wyvr_file_manager_select', { data });
}
</script>

<div class="file">
    <i class="ri-{get_icon(ext)}" style="color: {get_color(ext)};"></i>
    {#if file.type == 'file'}
        <button class="btn" on:click={select(file.data)} title={file.data}>
            {@html get_text(file.name, highlight)}
        </button>
    {:else}
        {@html get_text(file.name, highlight)}
    {/if}
    <slot />
</div>

<style>
    .file {
        position: relative;
        padding-top: 0.5rem;
        padding-left: 1rem;
        line-height: 1rem;
    }
    .file:before {
        content: ' ';
        position: absolute;
        width: 0.75rem;
        height: 2px;
        background-color: var(--line-color);
        left: 1px;
        top: 1rem;
        margin-top: -1px;
    }
    .file:after {
        content: ' ';
        position: absolute;
        width: 2px;
        height: 100%;
        background-color: var(--line-color);
        left: 0;
        top: 2px;
        margin-left: -1px;
    }
    .file:last-child::after {
        height: calc(1rem - 1px);
    }
    .btn {
        font-size: 1rem;
        background: none;
        border: none;
        color: var(--wyvr-debug-text);
        cursor: pointer;
        padding: 0;
        line-height: 1rem;
        text-transform: none;
        font-weight: normal;
    }
</style>
