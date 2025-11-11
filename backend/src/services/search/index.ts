import ddgSearch, { DdgOptions, SearchResult as DdgResult } from './ddg';
import playwrightSearch, { Engine, SearchResult as PwResult } from './playwright';
import { getSearchRuntimeConfig } from '../config';

export type Mode = 'duckduckgo' | 'playwright' | 'auto';
export type SearchResult = DdgResult | PwResult;

export interface SearchOptions {
  mode?: Mode;
  engine?: Engine; // 仅在 Playwright 或 auto 回退时生效
  limit?: number;
  timeoutMs?: number;
  headless?: boolean;
  locale?: string;
  ddg?: DdgOptions;
}

function normalizeMode(val?: string | null): Mode | undefined {
  if (!val) return undefined;
  const v = String(val).trim().toLowerCase();
  if (['duckduckgo', 'ddg'].includes(v)) return 'duckduckgo';
  if (['playwright', 'pw'].includes(v)) return 'playwright';
  if (['auto', 'default'].includes(v)) return 'auto';
  return undefined;
}

function normalizeEngine(val?: string | null): Engine | undefined {
  if (!val) return undefined;
  const v = String(val).trim().toLowerCase();
  if (v === 'google') return 'google';
  if (v === 'bing') return 'bing';
  if (v === 'baidu') return 'baidu';
  // 'duckduckgo' 不适用于 playwright 引擎选择；忽略
  return undefined;
}

export async function search(query: string, opts: SearchOptions = {}): Promise<{ results: SearchResult[]; modeUsed: Mode; engineUsed?: Engine }>{
  const runtime = await getSearchRuntimeConfig();
  const envMode = normalizeMode(process.env.SEARCH_METHOD);
  const envEngine = normalizeEngine(process.env.SEARCH_ENGINE);
  const envLimit = (() => { const n = parseInt(process.env.MAX_SEARCH_RESULTS || '', 10); return Number.isFinite(n) && n > 0 ? n : undefined; })();
  const envTimeout = (() => { const n = parseInt(process.env.SEARCH_TIMEOUT_MS || '', 10); return Number.isFinite(n) && n > 0 ? n : undefined; })();
  const envHeadless = (() => { const v = (process.env.SEARCH_HEADLESS || 'true').trim().toLowerCase(); return v === 'true'; })();
  const envLocale = (process.env.SEARCH_LOCALE || 'zh-CN');

  const mode = opts.mode ?? normalizeMode(runtime?.method) ?? envMode ?? 'auto';
  const engine = opts.engine ?? normalizeEngine(runtime?.engine) ?? envEngine ?? 'bing';
  const limit = opts.limit ?? (runtime?.maxResults ?? envLimit ?? 10);
  const timeoutMs = opts.timeoutMs ?? (runtime?.timeoutMs ?? envTimeout);
  const headless = opts.headless ?? (typeof runtime?.headless === 'boolean' ? runtime?.headless : envHeadless);
  const locale = opts.locale ?? (runtime?.locale ?? envLocale);
  const ddgOpts = opts.ddg;

  if (mode === 'duckduckgo') {
    const results = await ddgSearch(query, { ...(ddgOpts || {}), limit, timeoutMs });
    return { results, modeUsed: 'duckduckgo' };
  }

  if (mode === 'playwright') {
    const results = await playwrightSearch(query, { engine, limit, timeoutMs, headless, locale });
    return { results, modeUsed: 'playwright', engineUsed: engine };
  }

  // auto 策略：先 ddg，数量不足再走 playwright
  try {
    const ddgRes = await ddgSearch(query, { ...(ddgOpts || {}), limit, timeoutMs });
    if (ddgRes.length >= Math.min(5, limit)) {
      return { results: ddgRes, modeUsed: 'duckduckgo' };
    }
    const pwRes = await playwrightSearch(query, { engine, limit, timeoutMs, headless, locale });
    return { results: pwRes, modeUsed: 'playwright', engineUsed: engine };
  } catch {
    // ddg 失败时，先尝试 playwright 再兜底 ddg
    try {
      const pwRes = await playwrightSearch(query, { engine, limit, timeoutMs, headless, locale });
      return { results: pwRes, modeUsed: 'playwright', engineUsed: engine };
    } catch {
      try {
        const ddgRes = await ddgSearch(query, { ...(ddgOpts || {}), limit, timeoutMs });
        return { results: ddgRes, modeUsed: 'duckduckgo' };
      } catch {
        return { results: [], modeUsed: 'auto' };
      }
    }
  }
}

export default { search };