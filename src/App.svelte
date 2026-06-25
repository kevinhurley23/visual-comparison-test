<script>
  import reportData from '../test-report.json';
  import PageCard from './lib/PageCard.svelte';
  const report = reportData;
  const passedPages = report.pages.filter(page => page.allViewportsPassed).length;
  const allViewports = report.pages.flatMap(page => page.viewports);
  const passedViewports = allViewports.filter(viewport => viewport.passed).length;

  function formatDuration(ms) {
    const time = {
      day: Math.floor(ms / 86400000),
      hour: Math.floor(ms / 3600000) % 24,
      minute: Math.floor(ms / 60000) % 60,
      second: Math.floor(ms / 1000) % 60
    };

    return Object.entries(time)
      .filter(([_, val]) => val > 0)
      .map(([unit, val]) => `${val}${unit[0]}`)
      .join(' ') || "0s";
  }
</script>

<main>
  <div class="overview">
    <h1>Visual Comparison Report</h1>
    <p>Last test was run {report.date}</p>
    <p>Testing took {formatDuration(report.executionTime)}</p>
    <p>Environment: {report.env}</p>
    <p>Page list: {report.pageList}</p>
    <p>Pages passed: {passedPages} / {report.pages.length}</p>
    <p>Viewports passed: {passedViewports} / {allViewports.length}</p>
  </div>

  {#each report.pages as page}
    <PageCard {page} />
  {/each}
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-inline: 50px;
  }
  .overview {
    text-align: center;
    margin-bottom: 24px;
    p {
      font-size: 1.2rem;
      margin-block: 0.5rem;
    }
  }
</style>