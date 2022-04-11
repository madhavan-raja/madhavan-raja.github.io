<script>
  import PublicationsCard from "./PublicationsCard.svelte";
  let publications = [
    {
      name: "Violence Detection in CCTV footage using Deep Learning with Optical Flow in inconsistent weather and lighting conditions",
      authors: "R Madhavan, Utkarsh, JV Vidhya",
      journal: "Springer (CCIS, volume 1440), 2021",
      link: "https://link.springer.com/chapter/10.1007/978-3-030-81462-5_56",
    },
  ];
</script>

{#if publications.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Publications</h2>

    {#each publications as publication}
      <PublicationsCard
        name={publication.name}
        authors={publication.authors}
        journal={publication.journal}
        link={publication.link}
      />
    {/each}
  </div>
{/if}
