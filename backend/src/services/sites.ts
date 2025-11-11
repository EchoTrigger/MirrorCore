export interface SiteCandidate {
  key: string;
  name: string;
  synonyms: string[]; // 包含中英文别名，便于匹配
  buildSearchUrl: (query: string) => string;
  regionHint?: 'global' | 'cn';
}

// 站点候选列表（可根据需要扩展）
export function getSiteCandidates(): SiteCandidate[] {
  const candidates: SiteCandidate[] = [
    {
      key: 'youtube',
      name: 'YouTube',
      synonyms: ['youtube', '优兔', '油管', 'ytb', 'yt', 'YouTube'],
      buildSearchUrl: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
      regionHint: 'global',
    },
    {
      key: 'bilibili',
      name: 'Bilibili',
      synonyms: ['bilibili', '哔哩哔哩', 'b站', 'B站', 'B 站', 'b 站', 'bili'],
      buildSearchUrl: (q: string) => `https://search.bilibili.com/all?keyword=${encodeURIComponent(q)}`,
      regionHint: 'cn',
    },
    {
      key: 'bing',
      name: 'Bing',
      synonyms: ['bing', '必应', '微软必应'],
      buildSearchUrl: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
      regionHint: 'global',
    },
    {
      key: 'baidu',
      name: '百度',
      synonyms: ['baidu', '百度'],
      buildSearchUrl: (q: string) => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`,
      regionHint: 'cn',
    },
    {
      key: 'google',
      name: 'Google',
      synonyms: ['google', '谷歌'],
      buildSearchUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
      regionHint: 'global',
    },
    {
      key: 'duckduckgo',
      name: 'DuckDuckGo',
      synonyms: ['duckduckgo', 'ddg', '鸭鸭搜索'],
      buildSearchUrl: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
      regionHint: 'global',
    },
    {
      key: 'weibo',
      name: '微博',
      synonyms: ['weibo', '微博'],
      buildSearchUrl: (q: string) => `https://s.weibo.com/weibo?q=${encodeURIComponent(q)}`,
      regionHint: 'cn',
    },
    {
      key: 'zhihu',
      name: '知乎',
      synonyms: ['zhihu', '知乎'],
      buildSearchUrl: (q: string) => `https://www.zhihu.com/search?q=${encodeURIComponent(q)}`,
      regionHint: 'cn',
    },
  ];
  return candidates;
}

export function findSiteByKey(key: string): SiteCandidate | undefined {
  const k = (key || '').toLowerCase();
  return getSiteCandidates().find(s => s.key === k);
}

export function resolveSiteFromText(text: string): SiteCandidate | undefined {
  const msg = (text || '').toLowerCase();
  const list = getSiteCandidates();
  for (const site of list) {
    if (site.synonyms.some(alias => msg.includes(alias.toLowerCase()))) {
      return site;
    }
  }
  return undefined;
}

export function buildSearchUrlByKey(siteKey: string, query: string): string {
  const site = findSiteByKey(siteKey);
  const q = stripTitleQuotes(query || '');
  if (site) return site.buildSearchUrl(q);
  // 默认使用 Bing
  const bing = findSiteByKey('bing');
  return bing ? bing.buildSearchUrl(q) : `https://www.bing.com/search?q=${encodeURIComponent(q)}`;
}

// 去掉用户输入中的书名号、引号等
export function stripTitleQuotes(input: string): string {
  let s = (input || '').trim();
  // 中文书名号、引号、以及中英文空格
  s = s.replace(/[\u300a\u300b\u201c\u201d\u300c\u300d\u300e\u300f\u00ab\u00bb]/g, '');
  s = s.replace(/["\'\[\]\(\)]/g, '');
  return s.trim();
}