import axios from 'axios';
import cheerio from 'cheerio';

export interface SearchResult {
  title: string;
  url: string;
  snippet?: string;
  source: 'duckduckgo' | 'google' | 'bing' | 'baidu';
}

export interface DdgOptions {
  region?: string; // 如 'cn-zh'
  safe?: number; // 0/1/2
  limit?: number; // 返回条数
  timeoutMs?: number;
}

/**
 * 使用 DuckDuckGo 的 HTML 简版结果页进行轻量搜索
 */
export async function ddgSearch(query: string, opts: DdgOptions = {}): Promise<SearchResult[]> {
  const {
    region = 'cn-zh',
    safe = 1,
    limit = 10,
    timeoutMs = 15000,
  } = opts;

  const params = new URLSearchParams({
    q: query,
    kl: region,
    safesearch: String(safe),
  });

  const url = `https://html.duckduckgo.com/html/?${params.toString()}`;

  const res = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      'Accept-Language': 'zh-CN,zh;q=0.9',
    },
    timeout: timeoutMs,
  });

  const $ = cheerio.load(res.data);
  const results: SearchResult[] = [];

  // DuckDuckGo 简版页面选择器（若失效需调整）
  $('.result__a').each((i, el) => {
    if (i >= limit) return false;
    const title = $(el).text().trim();
    const href = $(el).attr('href') || '';
    let urlResolved = href.startsWith('http') ? href : new URL(href, 'https://duckduckgo.com').href;
    // 处理 DuckDuckGo 重定向链接（/l/?uddg= 形式）以返回真实目标 URL
    try {
      const u = new URL(urlResolved);
      if ((u.hostname === 'duckduckgo.com' || u.hostname.endsWith('.duckduckgo.com')) && u.pathname.startsWith('/l/')) {
        const uddg = u.searchParams.get('uddg');
        if (uddg) {
          const decoded = decodeURIComponent(uddg);
          if (decoded && decoded.startsWith('http')) {
            urlResolved = decoded;
          }
        }
      }
    } catch {}
    const snippet = $(el).closest('.result').find('.result__snippet').text().trim();
    results.push({ title, url: urlResolved, snippet, source: 'duckduckgo' });
  });

  return results;
}

export default ddgSearch;