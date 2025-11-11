import express from 'express';
import { search, Mode } from '../services/search';
import { fetchPageContent } from '../services/search/page';

const router = express.Router();

// GET /api/search?query=xxx&mode=auto&engine=google&limit=10
router.get('/', async (req, res) => {
  try {
    const query = (req.query.query as string) || (req.query.q as string);
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ error: '缺少 query 参数' });
    }

    const modeParam = req.query.mode as string | undefined;
    const engineParam = req.query.engine as string | undefined;
  const limitParam = req.query.limit as string | undefined;
  const headlessParam = req.query.headless as string | undefined;
  const localeParam = req.query.locale as string | undefined;
  const timeoutParam = req.query.timeoutMs as string | undefined;

    // 仅将用户显式传入的参数传递到服务层，默认值由服务层根据 .env 决定
    const opts: any = {};
    if (modeParam) opts.mode = modeParam as Mode;
    if (engineParam) opts.engine = engineParam as 'google' | 'bing' | 'baidu';
    if (limitParam) {
      const n = parseInt(limitParam, 10);
      if (Number.isFinite(n) && n > 0) opts.limit = n;
    }
    if (typeof headlessParam === 'string') {
      opts.headless = headlessParam.trim().toLowerCase() === 'true';
    }
  if (localeParam) opts.locale = localeParam;
  if (timeoutParam) {
    const n = parseInt(timeoutParam, 10);
    if (Number.isFinite(n) && n > 0) opts.timeoutMs = n;
  }

    const { results, modeUsed, engineUsed } = await search(query, opts);

    res.json({
      query,
      modeRequested: modeParam || null,
      modeUsed,
      engineRequested: engineParam || null,
      engineUsed: engineUsed || null,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error('Search API error:', error);
    res.status(500).json({ error: '搜索服务异常', details: error instanceof Error ? error.message : '未知错误' });
  }
});

export default router;

// GET /api/search/fetch?url=https://example.com&headless=false&timeoutMs=30000&locale=zh-CN
router.get('/fetch', async (req, res) => {
  try {
    const url = (req.query.url as string) || '';
    if (!url || !/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: '缺少有效的 url 参数（需以 http/https 开头）' });
    }

    const headlessParam = req.query.headless as string | undefined;
    const timeoutParam = req.query.timeoutMs as string | undefined;
    const localeParam = req.query.locale as string | undefined;

    const opts: any = {};
    if (typeof headlessParam === 'string') {
      opts.headless = headlessParam.trim().toLowerCase() === 'true';
    }
    if (timeoutParam) {
      const n = parseInt(timeoutParam, 10);
      if (Number.isFinite(n) && n > 0) opts.timeoutMs = n;
    }
    if (localeParam) opts.locale = localeParam;

    const result = await fetchPageContent(url, opts);
    res.json({
      url,
      ...result,
    });
  } catch (error) {
    console.error('Fetch page content API error:', error);
    res.status(500).json({ error: '页面抓取服务异常', details: error instanceof Error ? error.message : '未知错误' });
  }
});