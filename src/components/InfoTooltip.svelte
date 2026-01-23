<script>
  import { onMount } from "svelte";

  export let id = "";
  export let label = "";
  export let registry;

  let button;
  let open = false;
  let position = "bottom";

  const close = () => {
    open = false;
    if (registry) {
      registry.active = null;
    }
  };

  const openTooltip = () => {
    if (registry && registry.active && registry.active !== id) {
      registry.active = id;
    }
    if (registry) {
      registry.active = id;
    }
    open = true;
  };

  const toggle = () => {
    if (open) {
      close();
    } else {
      openTooltip();
    }
  };

  const handleKey = (event) => {
    if (event.key === "Escape") {
      close();
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggle();
    }
  };

  const handleDocumentClick = (event) => {
    if (!open) {
      return;
    }
    if (!button) {
      return;
    }
    const tooltip = button.nextElementSibling;
    if (button.contains(event.target) || (tooltip && tooltip.contains(event.target))) {
      return;
    }
    close();
  };

  const updatePosition = () => {
    if (!button) {
      return;
    }
    const rect = button.getBoundingClientRect();
    const availableBelow = window.innerHeight - rect.bottom;
    position = availableBelow < 220 ? "top" : "bottom";
  };

  const onOpen = () => {
    updatePosition();
  };

  onMount(() => {
    document.addEventListener("click", handleDocumentClick);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
      window.removeEventListener("resize", updatePosition);
    };
  });

  $: if (registry && registry.active !== id && open) {
    open = false;
  }

  $: if (open) {
    onOpen();
  }
</script>

<span class="info-tooltip">
  <button
    bind:this={button}
    class="info-button"
    type="button"
    aria-label={label}
    aria-describedby={open ? `${id}-tip` : undefined}
    on:click={toggle}
    on:keydown={handleKey}
    on:focus={openTooltip}
  >
    (i)
  </button>
  {#if open}
    <div class={`tooltip-panel ${position}`} id={`${id}-tip`} role="tooltip">
      <slot />
    </div>
  {/if}
</span>
