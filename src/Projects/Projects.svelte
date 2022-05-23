<script>
  import ProjectsCard from "./ProjectsCard.svelte";
  import client from "../sanity";

  const query = `*[_type == "project"]{name, description, link}`;

  let projects = [];
  client.fetch(query).then((res) => {
    projects = res;
  });
</script>

{#if projects.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Projects</h2>

    {#each projects as project}
      <ProjectsCard
        name={project.name}
        link={project.link}
        description={project.description}
      />
    {/each}
  </div>
{/if}
