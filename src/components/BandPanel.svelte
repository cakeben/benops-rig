<script>
  export let title = "Band classification";
  export let panels = [];
  export let note = "";
  export let compact = false;
</script>

<section class={`band-panel ${compact ? "compact" : ""}`}>
  <h3>{title}</h3>
  {#if note}
    <p class="panel-note">{note}</p>
  {/if}
  <div class="band-grid">
    {#each panels as panel}
      <div class="band-card">
        <h4>{panel.title}</h4>
        {#if panel.empty}
          <p class="empty">{panel.empty}</p>
        {:else}
          <ul class="band-list">
            {#each panel.entries as entry}
              <li>
                <strong>{entry.rate}</strong> on {entry.amount}
                <span class="band-label">{entry.label}</span>
                <span class="band-range">{entry.range}</span>
              </li>
            {/each}
          </ul>
          <p class="band-meta">Effective rate: {panel.effectiveRate}</p>
          <p class="band-why">{panel.why}</p>
          <ul class="band-changes">
            {#each panel.changes as change}
              <li>{change}</li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>
</section>
