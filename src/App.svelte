<script>
  import DarkModeToggle from "./DarkModeToggle.svelte";
  import Info from "./Info.svelte";
  import Publications from "./Publications.svelte";
  import CompetitiveProgramming from "./CompetitiveProgramming.svelte";
  import Projects from "./Projects.svelte";
  import Contacts from "./Contacts.svelte";
</script>

<main class="bg-gray-200 dark:bg-gray-900 transition-colors">
  <div class="px-8 sm:px-20 md:px-40 lg:px-80">
    <DarkModeToggle />
    <div class="py-10 flex flex-col space-y-12">
      <Info />
      <Publications />
      <CompetitiveProgramming />
      <Projects />
      <Contacts />
    </div>
  </div>
</main>
