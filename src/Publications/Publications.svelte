<script>
  import PublicationsCard from "./PublicationsCard.svelte";
  import client from "../sanity";

  const query = `*[_type == "publication"]{name, authors, link, journal}`;

  let publications = [];
  client.fetch(query).then((res) => {
    publications = res;
  });
</script>

{#if publications.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Publications</h2>

    {#each publications as publication}
      <PublicationsCard
        name={publication.name}
        authors={publication.authors.join(", ")}
        journal={publication.journal}
        link={publication.link}
      />
    {/each}
  </div>
{/if}
