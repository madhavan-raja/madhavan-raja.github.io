<script>
  import ProjectsCard from "./ProjectsCard.svelte";
  let projects = [
    {
      name: "FurDB",
      link: "https://github.com/madhavan-raja/furdb",
      description: "A small and space-efficient Database Management System.",
    },
    {
      name: "Misere Tic Tac Toe AI",
      link: "https://github.com/madhavan-raja/misere-tic-tac-toe-ml",
      description: "Regression Learning for a variation of a Tic Tac Toe game.",
    },
    {
      name: "Ligh",
      link: "https://github.com/madhavan-raja/ligh",
      description:
        "A full-stack blog website written in Flask, Python, SQLAlchemy, HTML (Jinja), and CSS.",
    },
    {
      name: "Procedural Music Generator",
      link: "https://github.com/madhavan-raja/procedural-music-generator",
      description: "Generates endless music from a given key and scale.",
    },
    {
      name: "Reverse Flappy Bird",
      link: "https://github.com/madhavan-raja/reverse-flappy-bird",
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
        link={project.link}
        description={project.description}
      />
    {/each}
  </div>
{/if}
