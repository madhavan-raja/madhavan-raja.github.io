<script>
  export let name;
  export let authors;
  export let journal;
  export let link;
</script>

<div class="group">
  <a href={link}>
    <h3 class="text-item-heading mb-1 text-link">{name}</h3>
    <p class="text-sm text-vivid group-hover:text-link">
      {authors}
    </p>
    <p class="text-sm text-muted group-hover:text-link">{journal}</p>
    <span class="text-link hidden print:block">{link}</span>
  </a>
</div>
