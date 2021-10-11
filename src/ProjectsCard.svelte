<script>
  import ItemHeading from "./ItemHeading.svelte";
  export let name;
  export let pageLink, sourceCodeLink, liveDemoLink;
  export let description;
</script>

<div>
  <ItemHeading {name} />

  {#if pageLink}
    <a class="text-sm text-blue-700 dark:text-blue-500" href={pageLink}>Page</a>
  {/if}

  {#if sourceCodeLink}
    <a class="text-sm text-blue-700 dark:text-blue-500" href={sourceCodeLink}
      >Source Code</a
    >
  {/if}

  {#if liveDemoLink}
    <a class="text-sm text-blue-700 dark:text-blue-500" href={liveDemoLink}
      >Live Demo</a
    >
  {/if}

  <p class="text-sm text-gray-700 dark:text-gray-400">{description}</p>
</div>
