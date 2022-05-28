<script>
  export let platformName;
  export let link;
  export let username;
  export let rating;
  export let ratingDescription;
</script>

<div class="group inline-block table">
  <a href={link}>
    <h3
      class="text-item-heading mb-1 text-link print:text-vivid inline-block table"
    >
      {platformName}
    </h3>
    <p
      class="text-sm text-muted group-hover:text-link print:text-vivid inline-block table"
    >
      <span class="font-mono">{username}</span> &bull; {rating} ({ratingDescription})
    </p>
    <div class="text-sm text-link hidden print:block">{link}</div>
  </a>
</div>
