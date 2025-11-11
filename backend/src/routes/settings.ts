import express from 'express';
import { getSearchRuntimeConfig, setSearchRuntimeConfig } from '../services/config';

const router = express.Router();

// GET /api/settings/search
router.get('/search', async (_req, res) => {
  try {
    const runtime = await getSearchRuntimeConfig();
    // Include env defaults so UI can display both runtime and env
    res.json({
      ok: true,
      runtime: runtime || {},
      env: {
        SEARCH_METHOD: process.env.SEARCH_METHOD || null,
        SEARCH_ENGINE: process.env.SEARCH_ENGINE || null,
        MAX_SEARCH_QUESTIONS: process.env.MAX_SEARCH_QUESTIONS || null,
        MAX_SEARCH_RESULTS: process.env.MAX_SEARCH_RESULTS || null,
        SEARCH_LOCALE: process.env.SEARCH_LOCALE || null,
        SEARCH_HEADLESS: process.env.SEARCH_HEADLESS || null,
        SEARCH_TIMEOUT_MS: process.env.SEARCH_TIMEOUT_MS || null,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || String(err) });
  }
});

// PUT /api/settings/search
// Body: { method, engine, maxQuestions, maxResults, locale, headless, timeoutMs }
router.put('/search', async (req, res) => {
  try {
    const { method, engine, maxQuestions, maxResults, locale, headless, timeoutMs } = req.body || {};

    const updated = await setSearchRuntimeConfig({
      method,
      engine,
      maxQuestions,
      maxResults,
      locale,
      headless,
      timeoutMs,
    });
    res.json({ ok: true, runtime: updated });
  } catch (err) {
    res.status(500).json({ ok: false, error: (err as Error)?.message || String(err) });
  }
});

export default router;