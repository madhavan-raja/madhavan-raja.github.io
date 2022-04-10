<script>
  export let name;
  export let link;
  export let description;
</script>

<div class="group">
  <a href={link}>
    <h3 class="text-item-heading mb-1 text-link print:text-vivid">
      {name}
    </h3>
    <p class="text-sm text-muted group-hover:text-link">{description}</p>
    <span class="text-sm text-link hidden print:block">
      {link}
    </span>
  </a>
</div>
