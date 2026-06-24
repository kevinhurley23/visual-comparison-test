import path from 'path';
import fs from 'fs';
import pixelmatch from 'pixelmatch';
import { parseArgs } from 'util';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import { execSync } from 'child_process';

// Process arguments
const options = {
  env: { type: 'string', default: 'dev' },
  pagelist: { type: 'string', default: 'test' },
};
const { values: args } = parseArgs({ options, strict: false });
const env = args.env;
const pageList = args.pagelist;
const viewports = [
  1600,
  1000,
  375
];

// Capture and prepare files/directories
const USER_DATA_DIR = './chrome-session';
const SCREENSHOTS_DIR = 'screenshots';
if (fs.existsSync(SCREENSHOTS_DIR)) {
  fs.rmSync(SCREENSHOTS_DIR, { recursive: true, force: true });
}
fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });


(async () => {
  // Import URLs from json file
  const module = await import(`./page-lists/${pageList}.json`, {
    with: { type: 'json' }
  });
  const urls = module.default;

  // Prepare pages array
  const pages = [];
  for (const url of urls) {
    const safePath = url.path === '/' ? 'home': url.path.substring(1).replaceAll('/', '_');
    const label = url.label || url.site + '_' + safePath;

    pages.push({ 
      label: label,
      filename: `${label.replaceAll(' ', '-')}.png`,
      prodURL: `https://${url.site}.bryant.edu${url.path}`,
      testURL: `https://${url.site}${env}.bryant.edu${url.path}`,
      viewports: [] 
    });
  }

  // ==========================================
  // SCREENSHOT CAPTURE
  // ==========================================

  for (const viewport of viewports) {
    console.log(`Capturing screenshots at ${viewport}px width`);
    const VIEWPORT_DIR = path.join(SCREENSHOTS_DIR, `${viewport}`);

    const context = await chromium.launchPersistentContext(USER_DATA_DIR, {
      headless: false, // Keep browser visible
      viewport: { width: viewport, height: 900 },
      httpCredentials: { username: 'www', password: 'bry' }
    });

    const tab = await context.newPage();

    // Helper functions
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    async function takeScreenshot(url, screenshotPath) {
      console.log(`📸 Capturing: ${url}`);
      await tab.goto(url);
      // Inject testing styles after page loads
      await tab.addStyleTag({ path: './testing-styles.css' });
      await delay(500);
      const height = await tab.evaluate(() => document.body.scrollHeight);
      await tab.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
      });
      await delay(Math.max(height / 6, 500));
      await tab.screenshot({ path: screenshotPath, fullPage: true });
    }

    for (const page of pages) {
      const prodScreenshotPath = path.join(VIEWPORT_DIR, 'prod', page.filename);
      const testScreenshotPath = path.join(VIEWPORT_DIR, 'test', page.filename);

      await takeScreenshot(page.prodURL, prodScreenshotPath);
      await takeScreenshot(page.testURL, testScreenshotPath);

      page.viewports.push({
        width: viewport,
        prodPath: prodScreenshotPath,
        testPath: testScreenshotPath,
      });
    }

    await context.close();
  }

  console.log('✅ All screenshots captured.');

  // ===========
  // PIXELMATCH
  // ===========

  for (const page of pages) {
    let viewportFailCount = 0;

    for (const viewport of page.viewports) {
      try {
        console.log(`Comparing screenshots of ${page.label} at ${viewport.width}px`);
        const imgProd = PNG.sync.read(fs.readFileSync(viewport.prodPath));
        const imgTest = PNG.sync.read(fs.readFileSync(viewport.testPath));
        const { width, height } = imgProd;
        const imgDiff = new PNG({ width, height });

        // Run the pixel comparison
        const numDiffPixels = pixelmatch(
          imgProd.data,
          imgTest.data,
          imgDiff.data,
          width,
          height,
          { threshold: 0.1 }
        );

        viewport.passed = numDiffPixels === 0;

        // If it fails, write the visual layout delta overlay out to the diff folder
        if (!viewport.passed) {
          const DIFF_DIR = path.join(SCREENSHOTS_DIR, `${viewport.width}`, 'diff');
          const DIFF_IMG_PATH = path.join(DIFF_DIR, page.filename);

          // Make sure diff folder exists in the folder for this viewport width
          fs.mkdirSync(DIFF_DIR, { recursive: true });

          viewportFailCount++;
          viewport.diffPath = DIFF_IMG_PATH;
          fs.writeFileSync(DIFF_IMG_PATH, PNG.sync.write(imgDiff));
        }
      } catch (diffErr) {
        console.error(`⚠️ Could not compare ${page.label} ${viewport.width}px:`, diffErr.message);
        viewportFailCount++;
        viewport.passed = false;
        viewport.errorMessage = diffErr.message;
      }
    }

    page.allViewportsPassed = viewportFailCount === 0;
  }

  const report = {
    date: new Date().toLocaleString(),
    env: env,
    pageList: pageList,
    pages: pages
  }
  fs.writeFileSync('./test-report.json', JSON.stringify(report, null, 2));
  console.log('📝 JSON report generated.');

  // Automatically trigger the Vite build directly from Node
  console.log('🏗️  Inlining report into index.html...');
  execSync('npx vite build', { stdio: 'inherit' });
  execSync('start dist/index.html');
})();
