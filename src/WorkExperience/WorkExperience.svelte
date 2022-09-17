<script>
  import ProjectsCard from "./WorkExperienceCard.svelte";
  import client from "../sanity";

  const query = `*[_type == "workExperience"]{institutionName, role, startDate, endDate}`;

  let experiences = [];
  client.fetch(query).then((res) => {
    experiences = res;
  });
</script>

{#if experiences.length > 0}
  <div class="item-spacing">
    <h2 class="text-section-heading">Experience</h2>

    {#each experiences as experience}
      <ProjectsCard
        institutionName={experience.institutionName}
        role={experience.role}
        startDate={experience.startDate}
        endDate={experience.endDate}
      />
    {/each}
  </div>
{/if}
