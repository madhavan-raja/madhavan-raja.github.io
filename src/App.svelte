<script>
  import Info from "./Info.svelte";
  import Publications from "./Publications.svelte";
  import CompetitiveProgramming from "./CompetitiveProgramming.svelte";
  import Projects from "./Projects.svelte";
  import Contacts from "./Contacts.svelte";
</script>

<main class="bg-gray-900">
  <div class="px-8 sm:px-20 md:px-40 lg:px-80">
    <div class="py-10 flex flex-col space-y-10">
      <Info />
      <Publications />
      <CompetitiveProgramming />
      <Projects />
      <Contacts />
    </div>
  </div>
</main>
