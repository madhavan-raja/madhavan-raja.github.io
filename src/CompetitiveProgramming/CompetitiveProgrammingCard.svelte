<script>
  export let platformName;
  export let link;
  export let username;
  export let rating;
  export let ratingDescription;
</script>

<div>
  <h3 class="text-item-heading">{platformName}</h3>

  <a class="text-sm font-mono text-link" href={link}>{username}</a>
  <span class="text-sm text-muted">&bull; {rating} ({ratingDescription})</span>
</div>
