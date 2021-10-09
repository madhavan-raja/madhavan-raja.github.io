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
  <div class="space-y-5">
    <h2 class="text-3xl text-gray-300">Competitive Programming</h2>

    <div class="space-y-4">
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
  </div>
{/if}
