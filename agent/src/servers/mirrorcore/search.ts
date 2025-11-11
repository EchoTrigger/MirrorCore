import axios from 'axios';
import { z } from 'zod';

export const SearchInputSchema = z.object({
  query: z.string().min(1),
  mode: z.enum(['auto', 'fast', 'research', 'chinese']).optional(),
  engine: z.enum(['google', 'bing', 'baidu', 'duckduckgo']).optional(),
  limit: z.number().int().positive().optional(),
  locale: z.string().optional(),
  headless: z.boolean().optional(),
  timeoutMs: z.number().int().positive().optional()
});
export type SearchInput = z.infer<typeof SearchInputSchema>;

export const SearchResultSchema = z.object({
  query: z.string(),
  modeRequested: z.string().nullable(),
  modeUsed: z.string(),
  engineRequested: z.string().nullable(),
  engineUsed: z.string().nullable(),
  count: z.number().int(),
  results: z.array(z.object({
    title: z.string().optional(),
    url: z.string(),
    snippet: z.string().optional()
  }))
});
export type SearchResult = z.infer<typeof SearchResultSchema>;

/**
 * 使用 MirrorCore 后端的搜索能力（代码 API 封装，非 MCP 工具）
 */
export async function search(input: SearchInput): Promise<SearchResult> {
  const parsed = SearchInputSchema.parse(input);
  const baseUrl = process.env.MIRRORCORE_BACKEND_URL || 'http://localhost:3001';

  const resp = await axios.get(`${baseUrl}/api/search`, {
    params: {
      query: parsed.query,
      mode: parsed.mode,
      engine: parsed.engine,
      limit: parsed.limit,
      headless: parsed.headless,
      locale: parsed.locale,
      timeoutMs: parsed.timeoutMs
    },
    timeout: parsed.timeoutMs ?? 30000
  });

  return SearchResultSchema.parse(resp.data);
}

export const FetchPageInputSchema = z.object({
  url: z.string().url(),
  headless: z.boolean().optional(),
  timeoutMs: z.number().int().positive().optional(),
  locale: z.string().optional()
});
export type FetchPageInput = z.infer<typeof FetchPageInputSchema>;

export const FetchPageResultSchema = z.object({
  url: z.string(),
  contentText: z.string().optional(),
  contentHtml: z.string().optional(),
  statusCode: z.number().int().optional()
});
export type FetchPageResult = z.infer<typeof FetchPageResultSchema>;

/**
 * 使用 MirrorCore 后端的页面抓取能力（代码 API 封装，非 MCP 工具）
 */
export async function fetchPage(input: FetchPageInput): Promise<FetchPageResult> {
  const parsed = FetchPageInputSchema.parse(input);
  const baseUrl = process.env.MIRRORCORE_BACKEND_URL || 'http://localhost:3001';

  const resp = await axios.get(`${baseUrl}/api/search/fetch`, {
    params: {
      url: parsed.url,
      headless: parsed.headless,
      timeoutMs: parsed.timeoutMs,
      locale: parsed.locale
    },
    timeout: parsed.timeoutMs ?? 30000
  });

  return FetchPageResultSchema.parse(resp.data);
}