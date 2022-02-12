<script>
  import ProjectsCard from "./ProjectsCard.svelte";
  let projects = [
    {
      name: "Misere Tic Tac Toe AI",
      pageLink: null,
      sourceCodeLink: "https://github.com/madhavan-raja/misere-tic-tac-toe-ml",
      liveDemoLink: null,
      description: "Regression Learning for a variation of a Tic Tac Toe game.",
    },
    {
      name: "FurDB",
      pageLink: null,
      sourceCodeLink: "https://github.com/madhavan-raja/fur",
      liveDemoLink: null,
      description:
        "A space-efficient Database Management System. Currently WIP, the repository may not be updated in a while.",
    },
    {
      name: "Ligh",
      pageLink: null,
      sourceCodeLink: "https://github.com/madhavan-raja/ligh",
      liveDemoLink: null,
      description:
        "A full-stack blog website written in Flask, Python, SQLAlchemy, HTML (Jinja), and CSS.",
    },
    {
      name: "Procedural Music Generator",
      pageLink: null,
      sourceCodeLink:
        "https://github.com/madhavan-raja/procedural-music-generator",
      liveDemoLink:
        "https://madhavan-raja.github.io/procedural-music-generator",
      description: "Generates endless music from a given key and scale.",
    },
    {
      name: "Reverse Flappy Bird",
      pageLink: null,
      sourceCodeLink: "https://github.com/madhavan-raja/reverse-flappy-bird",
      liveDemoLink: "https://madhavan-raja.github.io/reverse-flappy-bird",
      description: "A variation of the Flappy Bird game.",
    },
  ];
</script>

{#if projects.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Projects</h2>

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
{/if}
