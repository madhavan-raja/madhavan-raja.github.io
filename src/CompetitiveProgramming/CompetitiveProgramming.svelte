<script>
  import CompetitiveProgrammingCard from "./CompetitiveProgrammingCard.svelte";

  let platforms = [
    {
      platform: "CodeChef",
      username: "flipped_flop",
      link: "https://www.codechef.com/users/flipped_flop",
      rating: 1862,
      ratingDescription: "4★",
    },
    {
      platform: "Codeforces",
      username: "madhavan_raja",
      link: "https://codeforces.com/profile/madhavan_raja",
      rating: 1586,
      ratingDescription: "Specialist",
    },
  ];

  // import client from "../sanity";

  // const query = `*[_type == "publication"]{name, authors, link, journal}`;

  // let platforms = [];
  // client.fetch(query).then((res) => {
  //   platforms = res;
  // });
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
