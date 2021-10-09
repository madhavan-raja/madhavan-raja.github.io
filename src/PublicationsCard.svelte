<script>
  import ItemHeading from "./ItemHeading.svelte";

  export let name;
  export let authors;
  export let journal;
  export let cover;
  export let links;
</script>

<div class="flex space-x-2">
  <img class="h-36" alt={journal} src={cover} />
  <div class="py-2 space-y-2">
    <ItemHeading {name} />
    <div>
      <p class="text-sm text-gray-300">
        {authors}
      </p>
      <p class="text-sm text-gray-400">{journal}</p>
    </div>
    {#if links.length > 0}
      <div class="mt-2 flex space-x-4">
        {#if links.length === 1}
          <a href={links[0]}><span class="text-blue-500">Link</span></a>
        {:else}
          {#each links as link, i}
            <a href={link}><span class="text-blue-500">Part {i + 1}</span></a>
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</div>
