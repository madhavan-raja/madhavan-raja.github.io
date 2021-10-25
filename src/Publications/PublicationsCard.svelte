<script>
  export let name;
  export let authors;
  export let journal;
  export let cover;
  export let link;
</script>

<div class="flex">
  <img class="h-36 mr-5 shadow-xl" alt={journal} src={cover} />
  <div class="py-2 space-y-2">
    <h3 class="text-item-heading">{name}</h3>
    <div>
      <p class="text-sm text-vivid">
        {authors}
      </p>
      <p class="text-sm text-muted">{journal}</p>
    </div>
    {#if link}
      <div class="mt-2 flex space-x-4">
        <a href={link}><span class="text-link">Link</span></a>
      </div>
    {/if}
  </div>
</div>
