import fs from 'fs';
import path from 'path';

export interface DiscoveredServer {
  name: string;
  tools: string[]; // 基于文件名的初步工具列表（.ts 文件名）
}

/**
 * 扫描 agent/src/servers 目录，列出服务器与工具文件
 * 注意：这是一个轻量发现机制，真实工具签名由各工具文件的类型定义保证
 */
export function discoverServers(baseDir?: string): DiscoveredServer[] {
  const root = baseDir || path.resolve(process.cwd(), 'src', 'servers');
  const servers: DiscoveredServer[] = [];

  if (!fs.existsSync(root)) return servers;
  const dirs = fs.readdirSync(root, { withFileTypes: true }).filter(d => d.isDirectory());

  for (const dir of dirs) {
    const serverName = dir.name;
    const serverPath = path.join(root, serverName);
    const files = fs.readdirSync(serverPath, { withFileTypes: true })
      .filter(f => f.isFile() && /\.ts$/.test(f.name) && f.name !== 'index.ts')
      .map(f => f.name.replace(/\.ts$/i, ''));

    servers.push({ name: serverName, tools: files });
  }

  return servers;
}