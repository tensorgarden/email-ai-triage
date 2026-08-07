import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.SCREENSHOT_URL || 'http://127.0.0.1:3000';
const outDir = path.resolve('docs/screenshots');

const captures = [
  {
    file: '00-full-page.png',
    description: 'Full-page portfolio demo screenshot',
    fullPage: true
  },
  {
    file: '01-hero-stats.png',
    description: 'Dashboard hero stats showing unread, triaged, drafts ready, tasks, and AI accuracy',
    locator: 'section.mb-8'
  },
  {
    file: '02-category-breakdown-digest.png',
    description: 'Category breakdown chart and daily digest panels with AI highlights',
    // Capture the parent that contains first two cards (Daily Digest and Category Breakdown)
    script: async (page) => {
      const cards = await page.locator('div.space-y-6 > div').count();
      if (cards > 0) {
        const firstCard = page.locator('div.space-y-6 > div').nth(0);
        await firstCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        return firstCard;
      }
      throw new Error('Could not find daily digest card');
    }
  },
  {
    file: '03-review-queue.png',
    description: 'Human review queue with flagged emails and verification checklists',
    // Capture the review queue - it's in the sidebar, 3rd card in space-y-6 grid
    script: async (page) => {
      const cards = await page.locator('div.space-y-6 > div').count();
      if (cards >= 3) {
        const reviewCard = page.locator('div.space-y-6 > div').nth(2);
        await reviewCard.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        return reviewCard;
      }
      throw new Error('Could not find review queue card');
    }
  },
  {
    file: '04-email-list.png',
    description: 'Email inbox with expandable threads, summaries, and priority indicators',
    locator: 'div.lg\\:col-span-2 > div'
  },
  {
    file: '05-full-dashboard.png',
    description: 'Full dashboard overview with all sections visible',
    locator: 'main'
  }
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });

try {
  await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30000 });
  await page.emulateMedia({ colorScheme: 'light' });
  
  const manifest = [];
  for (const capture of captures) {
    try {
      const outputPath = path.join(outDir, capture.file);
      if (capture.fullPage) {
        await page.screenshot({ path: outputPath, fullPage: true });
        console.log(`✓ ${capture.file}`);
      } else {
        let element;
        if (capture.script) {
          element = await capture.script(page);
        } else {
          element = page.locator(capture.locator).first();
          await element.waitFor({ state: 'visible', timeout: 15000 });
        }
        await element.scrollIntoViewIfNeeded({ timeout: 5000 });
        await page.waitForTimeout(800);
        await element.screenshot({ path: outputPath });
        console.log(`✓ ${capture.file}`);
      }
      manifest.push({ file: `docs/screenshots/${capture.file}`, description: capture.description });
    } catch (e) {
      console.error(`✗ ${capture.file}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(JSON.stringify({ ok: true, baseUrl, screenshots: manifest }, null, 2));
} catch (error) {
  await browser.close();
  console.error('Fatal error:', error.message);
  process.exit(1);
}
