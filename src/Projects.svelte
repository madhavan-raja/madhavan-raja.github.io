<script>
  import ProjectsCard from "./ProjectsCard.svelte";
  let projects = [
    {
      name: "FurDB",
      pageLink: null,
      sourceCodeLink: "https://github.com/madhavan-raja/furtail-python",
      liveDemoLink: null,
      description: "A Database Management System",
    },
    {
      name: "Ligh",
      pageLink: null,
      sourceCodeLink: "https://github.com/madhavan-raja/ligh",
      liveDemoLink: null,
      description:
        "A full-stack blog website wrien in Flask, Python, SQLAlchemy, HTML (Jinja), and CSS",
    },
  ];
</script>

{#if projects.length > 0}
  <div class="space-y-5">
    <h2 class="text-3xl text-gray-300">Projects</h2>

    <div class="space-y-4">
      {#each projects as project}
        <ProjectsCard
          name={project.name}
          pageLink={project.pageLink}
          sourceCodeLink={project.sourceCodeLink}
          liveDemoLink={project.liveDemoLink}
          description={project.description}
        />
      {/each}
    </div>
  </div>
{/if}
