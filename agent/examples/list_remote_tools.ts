/*
 * 列出远端 MCP 工具与其输入/输出模式（JSON Schema）
 * 使用：
 *   # HTTP 传输（默认）
 *   MCP_SERVER_URL=http://localhost:3000 MCP_TRANSPORT=http npx tsx examples/list_remote_tools.ts
 *
 *   # stdio 传输
 *   MCP_TRANSPORT=stdio MCP_STDIO_COMMAND=node MCP_STDIO_ARGS="path/to/server.js" npx tsx examples/list_remote_tools.ts
 */

import { listMCPTools } from '../src/callMCPTool';

type AnyObject = Record<string, unknown>;

function getEnvOptions() {
  const baseUrl = process.env.MCP_SERVER_URL || 'http://localhost:3000';
  const transport = (process.env.MCP_TRANSPORT as 'http' | 'stdio') || 'http';
  const httpPath = process.env.MCP_HTTP_PATH || '/mcp';
  return { baseUrl, transport, httpPath };
}

function safeKeys(obj?: AnyObject | null): string[] {
  if (!obj || typeof obj !== 'object') return [];
  return Object.keys(obj);
}

function printTool(tool: AnyObject, index: number) {
  const name = String(tool.name || `tool_${index + 1}`);
  const title = (tool.annotations as AnyObject)?.title as string | undefined;
  const description = tool.description as string | undefined;

  const inputSchema = tool.inputSchema as AnyObject | undefined;
  const outputSchema = tool.outputSchema as AnyObject | undefined;

  const inputProps = safeKeys(inputSchema?.properties as AnyObject);
  const inputRequired = Array.isArray(inputSchema?.required) ? (inputSchema!.required as string[]) : [];
  const outputProps = safeKeys(outputSchema?.properties as AnyObject);

  console.log(`\n— ${name}${title ? ` (${title})` : ''}`);
  if (description) console.log(`  描述: ${description}`);
  console.log(`  输入: { properties: [${inputProps.join(', ')}], required: [${inputRequired.join(', ')}] }`);
  if (outputSchema) {
    console.log(`  输出: { properties: [${outputProps.join(', ')}] }`);
  } else {
    console.log(`  输出: 未声明（将通过 content 文本返回）`);
  }
}

async function main() {
  const options = getEnvOptions();
  console.log(`MCP 传输: ${options.transport}  基址: ${options.baseUrl}  路径: ${options.httpPath}`);
  try {
    const tools = await listMCPTools(options);
    if (!tools || tools.length === 0) {
      console.log('未发现远端工具（tools 列表为空）。');
      return;
    }
    console.log(`\n📋 远端工具 (${tools.length}):`);
    tools.forEach((t, i) => printTool(t as AnyObject, i));
    console.log('\n完成。');
  } catch (err: any) {
    console.error('\n❌ 列出工具失败：', err?.message || String(err));
    console.error('请确认 MCP_SERVER_URL/MCP_TRANSPORT/MCP_STDIO_* 等环境变量配置，以及远端 MCP 服务器可用。');
  }
}

main();