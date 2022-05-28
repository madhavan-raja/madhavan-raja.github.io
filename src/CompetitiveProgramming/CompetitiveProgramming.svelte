<script>
  import CompetitiveProgrammingCard from "./CompetitiveProgrammingCard.svelte";
  import client from "../sanity";

  const query = `*[_type == "competitiveProgramming"]{platform, rating, ratingDescription, username, link}`;

  let platforms = [];
  client.fetch(query).then((res) => {
    platforms = res;
  });
</script>

{#if platforms.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Competitive Programming</h2>

    {#each platforms as platform}
      <CompetitiveProgrammingCard
        platformName={platform.platform}
        link={platform.link}
        username={platform.username}
        rating={platform.rating}
        ratingDescription={platform.ratingDescription}
      />
    {/each}
  </div>
{/if}
