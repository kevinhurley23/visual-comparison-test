<script>
  let { viewport } = $props();

  let imgOptions = $derived(
    viewport.diffPath 
      ? ['prod', 'test', 'diff', 'side by side'] 
      : ['prod', 'test', 'side by side']
  );

  let selectedImg = $state('prod');
  // Watch for viewport changes and reset the state
  $effect(() => {
    selectedImg = viewport.diffPath ? 'diff' : 'prod';
  });

  let imgPath = $derived(`${selectedImg}Path`);

  let images = $derived(Object.entries(viewport)
    .filter(([key, value]) => key.includes('Path'))
    .map(item => [item[0].substring(0, 4), item[1]])
  );
</script>

{#if viewport.errorMessage}
  <p>{viewport.errorMessage}</p>
{/if}
  <div class="image-selector-row row">
    {#each imgOptions as option}
      <button class:selected={option == selectedImg} onclick={() => selectedImg = option}>
        {option}
      </button>
    {/each}
  </div>

  {#if selectedImg == 'side by side'}
    <div class="image-grid" style={`grid-template-columns: repeat(${images.length}, 1fr`}>
      {#each images as image}
        <div class="column">
          <p class="label">{image[0]}</p>
          <img src={`../${image[1]}`} alt="">
        </div>
      {/each}
    </div>
  {:else}
    <div class="img-container">
      <img src={`../${viewport[imgPath]}`} alt="">
    </div>
  {/if}


<style>
  .img-container {
    min-height: 0px;
    flex: 1 1 0%;
    overflow: auto;
    width: fit-content;
  }
  .image-grid {
    display: grid;
    gap: 12px;
    overflow: auto;
    .label {
      text-transform: capitalize;
      text-align: center;
    }
  }
  img {
    max-width: 100%;
  }
</style>