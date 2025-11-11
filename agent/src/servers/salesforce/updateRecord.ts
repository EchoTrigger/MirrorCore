import { z } from 'zod';
import { callMCPTool } from '../../callMCPTool.js';

export const UpdateRecordInputSchema = z.object({
  objectType: z.string(),
  recordId: z.string(),
  data: z.record(z.any())
});
export type UpdateRecordInput = z.infer<typeof UpdateRecordInputSchema>;

export const UpdateRecordResponseSchema = z.object({
  ok: z.boolean(),
  updatedId: z.string().optional()
});
export type UpdateRecordResponse = z.infer<typeof UpdateRecordResponseSchema>;

/**
 * 更新 Salesforce 记录（MCP 工具：salesforce__update_record）
 * 注意：需要有可达的 MCP 服务器并暴露该工具。
 */
export async function updateRecord(input: UpdateRecordInput): Promise<UpdateRecordResponse> {
  const parsed = UpdateRecordInputSchema.parse(input);
  return await callMCPTool<UpdateRecordResponse>('salesforce__update_record', parsed);
}