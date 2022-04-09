<script>
  export let name;
  export let link;
  export let description;
</script>

<div class="group">
  <a href={link}>
    <h3
      class="text-sm sm:text-lg font-semibold text-link group-hover:text-link"
    >
      {name}
    </h3>

    <p class="text-sm text-muted group-hover:text-link">{description}</p>

    <span class="text-vivid text-sm hidden print:block">
      Page: <span class="text-link">Page: {link}</span>
    </span>
  </a>
</div>
