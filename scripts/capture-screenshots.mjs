import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.SCREENSHOT_URL || 'http://127.0.0.1:3107';
const outDir = path.resolve('docs/screenshots');

const captures = [
  {
    file: '01-hero-stats.png',
    description: 'Dashboard hero stats showing unread, triaged, drafts ready, tasks, and AI accuracy',
    locator: 'section.mb-8'
  },
  {
    file: '02-category-breakdown-digest.png',
    description: 'Category breakdown and daily digest panels',
    locator: 'div.grid.grid-cols-1'
  },
  {
    file: '03-review-queue.png',
    description: 'Human review queue with flagged emails and verification checklists',
    locator: 'h3:has-text("Human Review Queue")'
  },
  {
    file: '04-email-list.png',
    description: 'Email inbox with expandable threads and AI summaries',
    locator: 'div.space-y-2'
  },
  {
    file: '05-full-dashboard.png',
    description: 'Full dashboard overview with all sections',
    locator: 'main'
  },
  {
    file: '00-full-page.png',
    description: 'Full-page portfolio demo screenshot',
    fullPage: true
  }
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.emulateMedia({ colorScheme: 'light' });

const manifest = [];
for (const capture of captures) {
  try {
    const outputPath = path.join(outDir, capture.file);
    if (capture.fullPage) {
      await page.screenshot({ path: outputPath, fullPage: true });
    } else {
      const element = page.locator(capture.locator).first();
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await element.screenshot({ path: outputPath });
    }
    manifest.push({ file: `docs/screenshots/${capture.file}`, description: capture.description });
  } catch (e) {
    console.log(`Warning: Capture failed for ${capture.file}: ${e.message}`);
  }
}

await browser.close();
console.log(JSON.stringify({ ok: true, baseUrl, screenshots: manifest }, null, 2));
