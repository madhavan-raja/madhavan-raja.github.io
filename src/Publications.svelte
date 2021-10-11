<script>
  import PublicationsCard from "./PublicationsCard.svelte";
  let publications = [
    {
      name: "Violence Detection in CCTV footage using Deep Learning with Optical Flow in inconsistent weather and lighting conditions",
      authors: "R Madhavan, Utkarsh, JV Vidhya",
      journal: "Springer CCIS, 2021",
      cover:
        "https://media.springernature.com/w153/springer-static/cover/book/9783030814625.jpg",
      links: [
        "https://www.springer.com/gp/book/9783030814618",
        "https://www.springer.com/gp/book/9783030882433",
      ],
    },
  ];
</script>

{#if publications.length > 0}
  <div class="space-y-5">
    <h2 class="text-3xl text-gray-900 dark:text-gray-300">
      Research Publications
    </h2>

    <div class="space-y-4">
      {#each publications as publication}
        <PublicationsCard
          name={publication.name}
          authors={publication.authors}
          journal={publication.journal}
          cover={publication.cover}
          links={publication.links}
        />
      {/each}
    </div>
  </div>
{/if}
