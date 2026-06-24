<script>
  import reportData from '../test-report.json';
  const report = reportData;
</script>

<main>
  <h1>Visual Comparison Report ({report.date})</h1>
  <p>Environment: {report.env}</p>
  <p>Page list: {report.pageList}</p>
</main>