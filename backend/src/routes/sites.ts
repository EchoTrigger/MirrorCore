import express from 'express';
import { buildSearchUrlByKey, getSiteCandidates } from '../services/sites';

const router = express.Router();

// GET /api/sites
router.get('/', (_req, res) => {
  try {
    const list = getSiteCandidates().map(s => ({
      key: s.key,
      name: s.name,
      synonyms: s.synonyms,
      regionHint: s.regionHint
    }));
    res.json({ ok: true, sites: list });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || String(err) });
  }
});

// GET /api/sites/search-url?siteKey=...&q=...
router.get('/search-url', (req, res) => {
  try {
    const siteKey = String(req.query.siteKey || '').trim();
    const q = String(req.query.q || '').trim();
    if (!siteKey) return res.status(400).json({ ok: false, error: '缺少 siteKey 参数' });
    const url = buildSearchUrlByKey(siteKey, q);
    res.json({ ok: true, url });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || String(err) });
  }
});

export default router;