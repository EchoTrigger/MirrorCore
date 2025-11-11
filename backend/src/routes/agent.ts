import express from 'express';
import { executeCode } from '../services/agent-exec';
import { search as unifiedSearch } from '../services/search';

const router = express.Router();

// POST /api/agent/exec
// Body: { code: string, params?: any, timeoutMs?: number, searchOptions?: any }
// Executes provided JS code in a restricted VM with access to whitelisted tools.
router.post('/exec', async (req, res) => {
  const { code, params, timeoutMs, searchOptions } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ ok: false, error: 'Missing code (string) in body.' });
  }

  const tools = {
    // Expose unified search as a tool. The code can call: await tools.search(query, opts)
    search: async (query: string, opts?: any) => {
      const { results, modeUsed, engineUsed } = await unifiedSearch(query, opts || searchOptions || {});
      return { results, modeUsed, engineUsed };
    },
  };

  try {
    const output = await executeCode(code, params, tools, { timeoutMs });
    return res.json({ ok: true, output });
  } catch (err) {
    const msg = (err as Error)?.message || String(err);
    return res.status(500).json({ ok: false, error: msg });
  }
});

export default router;