/*
 * MCP 代码模式调用层（正式客户端实现）
 * 提供：
 * - callMCPTool<T>()：通用工具调用
 * - listMCPTools()：列出远端服务器工具
 * 说明：
 * - 使用 @modelcontextprotocol/sdk 的 Client 与 StreamableHTTP/Stdio 传输
 * - 保持稳定的函数签名，便于上层工具封装不随传输实现变化
 */

import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { StdioClientTransport, getDefaultEnvironment } from '@modelcontextprotocol/sdk/client/stdio.js';

export type ToolInput = Record<string, any> | undefined;

export interface CallOptions {
  /** MCP 服务器基础地址，例如 http://localhost:3000 */
  baseUrl?: string;
  /** HTTP 路径（默认 /mcp），如果你使用自定义代理可调整 */
  httpPath?: string;
  /** 超时时间毫秒（部分传输会在内部使用） */
  timeoutMs?: number;
  /** 传输方式：'http'（Streamable HTTP）或 'stdio' */
  transport?: 'http' | 'stdio';
}

type ClientKey = string; // baseUrl + httpPath + transport
const clientCache = new Map<ClientKey, Client>();

async function getClient(options?: CallOptions): Promise<{ client: Client; key: ClientKey }> {
  const baseUrl = options?.baseUrl || process.env.MCP_SERVER_URL || 'http://localhost:3000';
  const httpPath = options?.httpPath || '/mcp';
  const transport = options?.transport || (process.env.MCP_TRANSPORT as any) || 'http';
  const key = `${transport}::${baseUrl}${httpPath}`;

  const existing = clientCache.get(key);
  if (existing) {
    return { client: existing, key };
  }

  const client = new Client({ name: 'mirrorcore-agent', version: '0.1.0' });

  if (transport === 'http') {
    const endpoint = new URL(httpPath || '/mcp', baseUrl);
    const httpTransport = new StreamableHTTPClientTransport(endpoint);
    await client.connect(httpTransport);
  } else if (transport === 'stdio') {
    // 说明：stdio 传输的具体子进程与环境需你按目标 MCP 服务器配置
    const env = getDefaultEnvironment();
    const stdioTransport = new StdioClientTransport({
      // 例如：command: 'node', args: ['path/to/mcp-server.js']
      // 这里保留占位，用户根据实际 MCP 服务器配置填写
      command: process.env.MCP_STDIO_COMMAND || 'node',
      args: (process.env.MCP_STDIO_ARGS || '').split(' ').filter(Boolean),
      env,
    });
    await client.connect(stdioTransport);
  } else {
    throw new Error(`Unsupported transport: ${transport}`);
  }

  clientCache.set(key, client);
  return { client, key };
}

/**
 * 列出远端服务器工具（用于代理按需加载）
 */
export async function listMCPTools(options?: CallOptions): Promise<any[]> {
  const { client } = await getClient(options);
  const result = await client.listTools();
  return (result as any).tools as any[];
}

/**
 * 通用工具调用：在代码模式下以 API 的方式调用 MCP 工具
 * 注意：这是一个稳定的函数签名，即使未来切换传输实现也无需变更上层工具封装
 */
export async function callMCPTool<TOutput = unknown>(
  toolName: string,
  input?: ToolInput,
  options?: CallOptions
): Promise<TOutput> {
  const { client } = await getClient(options);
  const result = await client.callTool({ name: toolName, arguments: input ?? {} });

  // 解析返回内容（与服务器 registerTool 返回结构保持兼容）
  const structured = (result as any)?.structuredContent;
  if (structured !== undefined) {
    return structured as TOutput;
  }
  const content = (result as any)?.content as Array<{ type: string; text?: string }> | undefined;
  if (content && content.length > 0) {
    const firstText = content.find(c => c.type === 'text')?.text;
    if (firstText) {
      try {
        return JSON.parse(firstText) as TOutput;
      } catch {
        return firstText as unknown as TOutput;
      }
    }
  }
  // 空响应
  return undefined as unknown as TOutput;
}