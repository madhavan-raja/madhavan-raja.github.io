<script>
  export let name;
  export let pageLink, sourceCodeLink, liveDemoLink;
  export let description;
</script>

<div>
  <h3 class="text-item-heading">{name}</h3>

  {#if pageLink}
    <a class="text-sm text-link mr-5 print:hidden" href={pageLink}>Page</a>
    <span class="text-vivid text-sm hidden print:block">
      Page: <span class="text-link">Page: {pageLink}</span>
    </span>
  {/if}

  {#if sourceCodeLink}
    <a class="text-sm text-link mr-5 print:hidden" href={sourceCodeLink}
      >Source</a
    >
    <span class="text-vivid text-sm hidden print:block">
      Source Code: <span class="text-link">{sourceCodeLink}</span>
    </span>
  {/if}

  {#if liveDemoLink}
    <a class="text-sm text-link mr-5 print:hidden" href={liveDemoLink}>Demo</a>
    <span class="text-vivid text-sm hidden print:block">
      Live Demo: <span class="text-link">{liveDemoLink}</span>
    </span>
  {/if}

  <p class="text-sm text-muted">{description}</p>
</div>
