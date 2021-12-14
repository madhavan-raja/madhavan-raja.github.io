<script>
  export let name;
  export let authors;
  export let journal;
  export let cover;
  export let link;
</script>

<div class="flex">
  <img class="h-36 mr-5 shadow-xl print:hidden" alt={journal} src={cover} />
  <div class="py-2 space-y-2">
    <h3 class="text-item-heading">{name}</h3>
    <div>
      <p class="text-sm text-vivid">
        {authors}
      </p>
      <p class="text-sm text-muted">{journal}</p>
    </div>
    {#if link}
      <div class="mt-2 flex">
        <a href={link}><span class="text-link print:hidden">Link</span></a>
        <span class="text-link hidden print:block">{link}</span>
      </div>
    {/if}
  </div>
</div>
