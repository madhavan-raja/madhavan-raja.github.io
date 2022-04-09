<script>
  export let platformName;
  export let link;
  export let username;
  export let rating;
  export let ratingDescription;
</script>

<div class="group">
  <a href={link}>
    <h3 class="text-sm sm:text-lg font-semibold text-link">{platformName}</h3>

    <a
      class="text-sm font-mono text-muted group-hover:text-link print:text-vivid"
      href={link}
    >
      {username}
    </a>
    <span class="text-sm text-muted group-hover:text-link">
      &bull; {rating} ({ratingDescription})
    </span>
    <div class="text-sm text-link hidden print:block">{link}</div>
  </a>
</div>
