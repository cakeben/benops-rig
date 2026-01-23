<script>
  export let label = "";
</script>

<details class="info-tip">
  <summary aria-label={label}>(i)</summary>
  <div class="info-content">
    <slot />
  </div>
</details>
