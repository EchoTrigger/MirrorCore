import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';

interface FetchOptions {
  headless?: boolean;
  timeoutMs?: number;
  locale?: string;
}

export async function fetchPageContent(
  url: string,
  { headless = true, timeoutMs = 30000, locale = 'zh-CN' }: FetchOptions = {}
): Promise<{ title: string; text: string; html?: string }> {
  const browser: Browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    locale,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });
  const page: Page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });
    // 尝试处理常见同意弹窗
    const consentBtn = page.locator('button:has-text("同意"), button:has-text("I agree"), button:has-text("接受")');
    if (await consentBtn.count()) {
      await consentBtn.first().click().catch(() => {});
      await page.waitForLoadState('domcontentloaded');
    }
    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      const title = document.title || '';
      // 优先 main/article，然后回退 body
      const main = document.querySelector('main, article') || document.body;
      const text = (main?.textContent || '').replace(/\s+/g, ' ').trim();
      return { title, text };
    });
    return data;
  } finally {
    await browser.close();
  }
}

export default fetchPageContent;