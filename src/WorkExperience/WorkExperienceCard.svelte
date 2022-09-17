<script>
  export let institutionName;
  export let role;
  export let startDate;
  export let endDate;
</script>

<div class="group inline-block table">
  <h3
    class="text-item-heading mb-1 text-link print:text-vivid inline-block table"
  >
    {role}, {institutionName}
  </h3>
  <p class="text-sm text-muted group-hover:text-link inline-block table">
    {startDate} - {endDate}
  </p>
</div>
