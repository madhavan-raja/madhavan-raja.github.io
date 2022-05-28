<script>
  import DarkModeToggle from "./DarkModeToggle.svelte";
  import Info from "./Info.svelte";
  import Publications from "./Publications/Publications.svelte";
  import CompetitiveProgramming from "./CompetitiveProgramming/CompetitiveProgramming.svelte";
  import Projects from "./Projects/Projects.svelte";
  import Contacts from "./Contacts/Contacts.svelte";

  let htmlClasses = document.querySelector("html").classList;

  if (
    localStorage.theme === "dark" ||
    (!("theme" in localStorage) &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    htmlClasses.add("dark");
    localStorage.theme = "dark";
  } else {
    htmlClasses.remove("dark");
    localStorage.removeItem("theme");
  }
</script>

<main>
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
