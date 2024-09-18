<script>
export let data;
export let path = '';
export let highlight = undefined;
export let searching = false;
export let open = false;

$: tree = to_tree(data);
$: empty = tree.length === 0;

$: update_open(searching);

function to_tree(data) {
    if (!data) {
        return [];
    }
    if (Array.isArray(data)) {
        return data.map((item, index) => to_item(item, index.toString()));
    }
    return Object.keys(data)
        .map((key) => to_item(data[key], key))
        .sort((a, b) => {
            if (a.key < b.key) {
                return -1;
            }
            if (a.key > b.key) {
                return 1;
            }
            return 0;
        });
}
function to_item(value, key) {
    const type = Array.isArray(value) ? 'array' : typeof value;
    return { key, value, type };
}
function get_path(path, segment) {
    if (!Number.isNaN(segment)) {
        return `${path}[${segment}]`;
    }
    return [path, segment].filter((x) => x).join('.');
}

function get_type_icon(type, value) {
    switch (type) {
        case 'string':
            return 'T';
        case 'number':
            return 'N';
        case 'boolean':
            return '☑';
        case 'array':
            return `[${value ? value.length : '0'}]`;
        case 'object':
        case 'undefined':
            if (value == null) {
                return '✘';
            }
            return '{…}';
        default:
            return '?';
    }
}

function toggle() {
    open = !open;
}

function copy(text) {
    if (typeof text === 'string') {
        text = text.replace(/^"(.*)"$/, '$1');
    }
    navigator.clipboard.writeText(text).then(() => {
        wyvr_message('copied to clipboard');
    });
}
function copy_pre(e) {
    const pre = e.target.parentNode.querySelector('pre');
    if (!pre) {
        return;
    }
    copy(pre.innerText);
}
function get_text(text, highlight) {
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (highlight) {
        text = text.replace(new RegExp(`(${highlight})`, 'gi'), '<span class="highlight">$1</span>');
    }
    if (text.match(/^".*"$/)) {
        return text;
    }
    text = `<code>${text}</code>`;
    return text;
}
function update_open(searching) {
    if (searching) {
        open = true;
    }
}
</script>

<div class="tree">
    <div class="main">
        {#if !empty}<button on:click={toggle} class="btn">{#if open}-{:else}+{/if}</button>{/if}
        <slot />
        {#if empty}<em>has no data</em>{/if}    
</div>
    {#if open}
        {#each tree as node}
            {@const cur_path = get_path(path, node.key, node.type)}
            <div class="node" data-highlight={highlight}>
                <button
                    class="key"
                    title={cur_path}
                    on:click={() => {
                        copy(cur_path);
                    }}
                >
                    {@html get_text(node.key, highlight)}
                    <span class="icon"
                        >{get_type_icon(node.type, node.value)}</span
                    >
                </button>
                <div class="value">
                    {#if node.type == 'string' || node.type == 'boolean' || node.type == 'number'}
                        <button on:click={copy_pre} class="btn">copy</button>
                        <pre>{@html get_text(
                                JSON.stringify(node.value, null, 4),
                                highlight,
                            )}</pre>
                    {:else if node.type == 'array'}
                        <svelte:self
                            data={node.value}
                            path={cur_path}
                            {highlight}
                            {searching}
                        />
                    {:else if node.type == 'object'}
                        {#if node.value == null}
                            <pre><code>null</code></pre>
                        {:else if Object.keys(node.value).length == 0}
                            <pre><code>empty</code></pre>
                        {:else}
                            <svelte:self
                                data={node.value}
                                path={cur_path}
                                {highlight}
                                {searching}
                            />
                        {/if}
                    {:else if node.type == 'undefined'}
                        <pre><code>undefined</code></pre>
                    {:else}
                        UNKNOWN {node.type}
                    {/if}
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    :root {
        --line-color: rgba(255, 255, 255, 0.3);
    }
    .tree {
        width: fit-content;
    }
    .tree :global(.highlight) {
        background-color: var(--wyvr-debug-primary);
        color: var(--wyvr-debug-text);
        display: inline-block;
        padding: 1px;
        border-radius: 1px;
    }
    .main {
        display: flex;
        gap: 10px;
        align-items: flex-end;
    }
    .node {
        padding-left: 30px;
        padding-top: 5px;
        padding-bottom: 5px;
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: baseline;
        position: relative;
    }
    .node:before {
        content: '';
        position: absolute;
        left: 12px;
        top: 0;
        height: 100%;
        width: 2px;
        background-color: var(--line-color);
    }
    .node:last-child::before {
        height: 19px;
    }
    .node:after {
        content: '';
        position: absolute;
        left: 14px;
        top: 17px;
        height: 2px;
        width: 16px;
        background-color: var(--line-color);
    }
    .key {
        display: inline-block;
        margin-right: 10px;
        white-space: nowrap;
        border: 1px solid var(--wyvr-debug-text);
        border-radius: 0.25rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        font-family: monospace;
        background-color: var(--wyvr-debug-text);
        color: var(--wyvr-debug-text-shadow);
        font-size: 1rem;
        cursor: pointer;
    }
    .icon {
        font-family: serif;
        display: inline-block;
        background-color: color-mix(in srgb, var(--wyvr-debug-primary) 30%, transparent);
        padding: 0.1rem 0.25rem;
        margin-right: -0.5rem;
    }
    pre {
        padding: 0;
        margin: 0;
        text-overflow: ellipsis;
        overflow: hidden;
        max-width: 500px;
    }
    pre :global(code) {
        color: var(--wyvr-debug-primary);
    }
    .btn {
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
        text-transform: none;
        font-weight: normal;
    }
    .value {
        position: relative;
        flex: 0 1 auto;
        overflow: hidden;
        min-height: 1.4em;
    }
    .value > .btn {
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0;
        transition: opacity 0.2s linear !important;
    }
    .value:hover > .btn {
        opacity: 1;
    }
</style>
