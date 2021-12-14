<script>
  export let name;
  export let link;
  export let paths;
</script>

<a class="print:hidden" href={link}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-7 w-7 text-vivid"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <title>{name}</title>
    {#each paths as path}
      <path d={path} />
    {/each}
  </svg>
</a>

<div class="hidden print:block">
  <div class="text-vivid">{name}: <span class="text-link">{link}</span></div>
</div>
