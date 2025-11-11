import express from 'express';
import aiService from '../services/ai';
import { buildSearchUrlByKey, getSiteCandidates, resolveSiteFromText, stripTitleQuotes } from '../services/sites';

const router = express.Router();

function extractJson(text: string): any | null {
  const raw = (text || '').trim();
  // 尝试直接解析
  try { return JSON.parse(raw); } catch {}
  // 尝试代码块中的 JSON
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch {}
  }
  return null;
}

// POST /api/intent/site-search
// Body: { text: string }
router.post('/site-search', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ ok: false, error: '缺少文本参数 text' });
    }

    const candidates = getSiteCandidates();
    const siteListForPrompt = candidates.map(c => `${c.name} (${c.key}): 别名[${c.synonyms.join(', ')}]`).join('\n');

    const systemPrompt = [
      '你是一个“站点搜索意图解析器”。你的任务是从用户自然语言（中英双语）中解析：需要打开哪个站点，并在该站点上搜索的关键词。',
      '仅输出 JSON，不要输出任何其他文字。',
      '若能解析到站点与关键词，请返回： {"action":"open_site_search","site":{"key":"<key>","name":"<name>"},"query":"<关键词>"}',
      '若只解析到站点（没有明确关键词），返回： {"action":"open_site","site":{"key":"<key>","name":"<name>"}}',
      '若无法解析，返回： {"action":"none"}',
      '可用站点与别名如下：\n' + siteListForPrompt,
      '注意：保留用户原始关键词中的重要名词，但去掉外层引号或书名号。'
    ].join('\n');

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text }
    ];

    let parsed: any = null;
    try {
      const resp = await aiService.generateResponse(messages, undefined, { temperature: 0, maxTokens: 300 });
      parsed = extractJson(resp.content);
    } catch (e) {
      parsed = null;
    }

    // 本地回退：规则解析
    if (!parsed || !parsed.action || parsed.action === 'none') {
      const site = resolveSiteFromText(text);
      const queryMatch = text.match(/(搜索|搜|查询|检索)\s*([\u300a\u300b\u201c\u201d\u300c\u300d\u300e\u300f\u00ab\u00bb"'《》“”『』\(\)\[\]]?)(.+)$/);
      const queryRaw = queryMatch ? queryMatch[3] : '';
      const query = stripTitleQuotes(queryRaw || '');
      if (site && query) {
        parsed = { action: 'open_site_search', site: { key: site.key, name: site.name }, query };
      } else if (site) {
        parsed = { action: 'open_site', site: { key: site.key, name: site.name } };
      } else {
        parsed = { action: 'none' };
      }
    }

    // 环境回退：如配置阻断 youtube，则切换到 bilibili（更适合中文网络环境）
    const blockYoutube = String(process.env.BLOCK_YOUTUBE || '').toLowerCase() === 'true';
    if (parsed && (parsed.site?.key === 'youtube') && blockYoutube) {
      parsed.site = { key: 'bilibili', name: 'Bilibili' };
    }

    if (parsed.action === 'open_site_search' && parsed.site?.key && parsed.query) {
      const url = buildSearchUrlByKey(parsed.site.key, parsed.query);
      return res.json({ ok: true, intent: { type: 'open', url, name: parsed.site.name } });
    }
    if (parsed.action === 'open_site' && parsed.site?.key) {
      const site = candidates.find(c => c.key === parsed.site.key);
      const url = site ? site.buildSearchUrl('') : undefined;
      // 对于首页打开，构造站点主页（部分站点用搜索页空关键词也可）
      const homepage = {
        youtube: 'https://www.youtube.com/',
        bilibili: 'https://www.bilibili.com/',
        bing: 'https://www.bing.com/',
        baidu: 'https://www.baidu.com/',
        google: 'https://www.google.com/',
        duckduckgo: 'https://duckduckgo.com/',
        weibo: 'https://weibo.com/',
        zhihu: 'https://www.zhihu.com/'
      } as Record<string, string>;
      return res.json({ ok: true, intent: { type: 'open', url: homepage[parsed.site.key] || url, name: parsed.site.name } });
    }

    return res.json({ ok: true, intent: { type: 'none' } });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || String(err) });
  }
});

export default router;