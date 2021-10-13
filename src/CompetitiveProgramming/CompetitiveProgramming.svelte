<script>
  import CompetitiveProgrammingCard from "./CompetitiveProgrammingCard.svelte";

  let platforms = [
    {
      name: "CodeChef",
      username: "flipped_flop",
      link: "https://www.codechef.com/users/flipped_flop",
      rating: 1862,
      ratingDescription: "4★",
    },
    {
      name: "Codeforces",
      username: "madhavan_raja",
      link: "https://codeforces.com/profile/madhavan_raja",
      rating: 1586,
      ratingDescription: "Specialist",
    },
  ];
</script>

{#if platforms.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Competitive Programming</h2>

    {#each platforms as platform}
      <CompetitiveProgrammingCard
        platformName={platform.name}
        link={platform.link}
        username={platform.username}
        rating={platform.rating}
        ratingDescription={platform.ratingDescription}
      />
    {/each}
  </div>
{/if}
