<script>
  export let name;
  export let authors;
  export let journal;
  export let link;
</script>

<div class="group inline-block table">
  <a href={link}>
    <h3
      class="text-item-heading mb-1 text-link print:text-vivid inline-block table"
    >
      {name}
    </h3>
    <p class="text-sm text-vivid group-hover:text-link inline-block table">
      {authors}
    </p>
    <p class="text-sm text-muted group-hover:text-link inline-block table">
      {journal}
    </p>
    <span class="text-link hidden print:block">{link}</span>
  </a>
</div>
