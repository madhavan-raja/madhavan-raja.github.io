<script>
  export let name;
  export let pageLink, sourceCodeLink, liveDemoLink;
  export let description;
</script>

<div>
  <h3 class="text-item-heading">{name}</h3>

  {#if pageLink}
    <a class="text-sm text-link mr-5" href={pageLink}>Page</a>
  {/if}

  {#if sourceCodeLink}
    <a class="text-sm text-link mr-5" href={sourceCodeLink}>Source</a>
  {/if}

  {#if liveDemoLink}
    <a class="text-sm text-link mr-5" href={liveDemoLink}>Demo</a>
  {/if}

  <p class="text-sm text-muted">{description}</p>
</div>
