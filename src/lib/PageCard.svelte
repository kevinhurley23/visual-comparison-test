<script>
  import Viewport from "./Viewport.svelte";

  let { page } = $props();
  const allPassed = page.allViewportsPassed;
  let viewports = $state(page.viewports);
  let selectedViewport = $state(viewports[0]);
</script>

<details class="page-card" open={!allPassed} style={`border-color: ${allPassed ? 'rgb(88, 214, 142)' : 'rgb(253, 100, 142)'};`}>
  <summary>
    <h2>
      {page.label}
      {allPassed ? '✅ All viewports passed' : '❌ One or more viewports failed'}
    </h2>
  </summary>

  <div class="details-content">
    <a href={page.prodURL} target="_blank">{page.prodURL}</a>
    <a href={page.testURL} target="_blank">{page.testURL}</a>
    <div class="viewport-selector-row row">
      {#each viewports as viewport}
        <button class:selected={selectedViewport == viewport} onclick={() => selectedViewport = viewport}>
          {viewport.width}
          {viewport.passed ? '✅' : '❌'}
        </button>
      {/each}
    </div>
  
    <Viewport viewport={selectedViewport} />
  </div>
</details>

<style>
  .page-card {
    background-color: rgb(212, 233, 243);
    border: 2px solid black;
    border-radius: 12px;
    margin-bottom: 24px;
    padding: 16px;
    width: min(1632px, 100%);
  }
  summary {
    cursor: pointer;
    text-align: center;
    &::marker {
      font-size: 1.8rem;
    }
  }
  h2 {
    text-align: center;
    display: inline-block;
  }
  .details-content {
    overflow: clip;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-height: 80vh;
  }
</style>