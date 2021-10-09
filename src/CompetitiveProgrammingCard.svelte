<script>
  import ItemHeading from "./ItemHeading.svelte";

  export let platformName;
  export let link;
  export let username;
  export let rating;
  export let ratingDescription;
</script>

<div>
  <ItemHeading name={platformName} />

  <a class="text-sm font-mono text-gray-300 text-blue-500" href={link}
    >{username}</a
  >
  <span class="text-sm text-gray-400"
    >&bull; {rating} ({ratingDescription})</span
  >
</div>
