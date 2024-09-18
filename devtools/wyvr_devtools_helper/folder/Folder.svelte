<script>
import File from './File.svelte';

export let data;
export let level = 0;
export let highlight = undefined;

$: entries = to_entries(data);

function to_entries(data) {
    if (!data) {
        return [];
    }
    return Object.keys(data)
        .map((key) => ({
            name: key,
            type: typeof data[key] === 'string' ? 'file' : 'folder',
            data: data[key],
            id: key + level
        }))
        .sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
}
</script>

<div class="folder">
    {#each entries as entry (entry.id)}
        {#if entry.type == 'folder'}
            <File file={entry} is_folder={true} {highlight} level={level + 1}>
                <svelte:self data={entry.data} {highlight} level={level + 1} />
            </File>
        {:else}
            <File file={entry} {highlight} level={level + 1} />
        {/if}
    {/each}
</div>

<style>
    .folder {
        position: relative;
        padding-left: 0.5rem;
        line-height: 1rem;
    }
</style>
