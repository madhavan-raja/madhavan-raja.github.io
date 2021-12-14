<script>
  export let platformName;
  export let link;
  export let username;
  export let rating;
  export let ratingDescription;
</script>

<div>
  <h3 class="text-item-heading">{platformName}</h3>

  <a class="text-sm font-mono text-link print:text-vivid" href={link}>
    {username}
  </a>
  <span class="text-sm text-muted">
    &bull; {rating} ({ratingDescription})
  </span>
  <div class="text-sm text-link hidden print:block">{link}</div>
</div>
