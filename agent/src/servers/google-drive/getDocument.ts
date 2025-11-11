import { z } from 'zod';
import { callMCPTool } from '../../callMCPTool.js';

export const GetDocumentInputSchema = z.object({
  documentId: z.string()
});
export type GetDocumentInput = z.infer<typeof GetDocumentInputSchema>;

export const GetDocumentResponseSchema = z.object({
  content: z.string()
});
export type GetDocumentResponse = z.infer<typeof GetDocumentResponseSchema>;

/**
 * 读取 Google Drive 文档内容（MCP 工具：google_drive__get_document）
 * 注意：需要有可达的 MCP 服务器并暴露该工具。
 */
export async function getDocument(input: GetDocumentInput): Promise<GetDocumentResponse> {
  const parsed = GetDocumentInputSchema.parse(input);
  return await callMCPTool<GetDocumentResponse>('google_drive__get_document', parsed);
}