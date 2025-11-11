import type { Browser, Page } from 'playwright';
import { chromium } from 'playwright';

export type Engine = 'google' | 'bing' | 'baidu';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source: 'duckduckgo' | 'google' | 'bing' | 'baidu';
}

interface PlaywrightOptions {
  engine: Engine;
  headless?: boolean;
  limit?: number;
  timeoutMs?: number;
  locale?: string;
}

const engines = {
  google: {
    url: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}&hl=zh-CN&pws=0`,
    resultItem: 'div#search div.g, div.MjjYud',
    titleSel: 'h3',
    linkSel: 'div.yuRUbf > a, a[jsname][href]',
    snippetSel: 'div.VwiC3b, span.aCOpRe',
  },
  bing: {
    url: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=zh-cn`,
    resultItem: 'li.b_algo',
    titleSel: 'h2',
    linkSel: 'h2 a',
    snippetSel: '.b_caption p, .b_algo p',
  },
  baidu: {
    url: (q: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
    resultItem: '#content_left .result',
    titleSel: 'h3.t, h3.c-title',
    linkSel: 'h3.t a, h3.c-title a',
    snippetSel: '.c-abstract, .c-span-last p',
  },
};

export async function playwrightSearch(
  query: string,
  { engine, headless = true, limit = 10, timeoutMs = 20000, locale = 'zh-CN' }: PlaywrightOptions
): Promise<SearchResult[]> {
  const cfg = engines[engine];
  const browser: Browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    locale,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
  });
  const page: Page = await context.newPage();

  try {
    const url = cfg.url(query);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: timeoutMs });

    // 尝试处理可能的同意弹窗（Google场景最常见）
    const consentBtn = page.locator('button:has-text("同意"), button:has-text("I agree"), button:has-text("接受")');
    if (await consentBtn.count()) {
      await consentBtn.first().click().catch(() => {});
      await page.waitForLoadState('domcontentloaded');
    }

    await page.waitForTimeout(800);

    const results: SearchResult[] = await page.$$eval(
      cfg.resultItem,
      (nodes: Element[], args: { titleSel: string; linkSel: string; snippetSel: string; source: string; limitInline: number }) => {
        const items: { title: string; url: string; snippet?: string; source: string }[] = [];
        for (const node of nodes.slice(0, args.limitInline)) {
          const titleEl = node.querySelector(args.titleSel) as HTMLElement | null;
          const linkEl = node.querySelector(args.linkSel) as HTMLAnchorElement | null;
          const snippetEl = node.querySelector(args.snippetSel) as HTMLElement | null;
          if (!titleEl || !linkEl) continue;
          items.push({
            title: (titleEl.textContent || '').trim(),
            url: linkEl.href,
            snippet: (snippetEl?.textContent || '').trim(),
            source: args.source,
          });
        }
        return items as any;
      },
      { titleSel: cfg.titleSel, linkSel: cfg.linkSel, snippetSel: cfg.snippetSel, source: engine, limitInline: limit }
    );

    return results;
  } finally {
    await browser.close();
  }
}

export default playwrightSearch;