import fs from 'fs/promises';
import path from 'path';

export interface SearchRuntimeConfig {
  method?: string; // DuckDuckGo | Playwright | Auto
  engine?: string; // DuckDuckGo | Google | Bing | Baidu
  maxQuestions?: number;
  maxResults?: number;
  locale?: string; // e.g., zh-CN
  headless?: boolean;
  timeoutMs?: number;
}

interface RuntimeConfigFile {
  search?: SearchRuntimeConfig;
}

const dataDir = path.resolve(__dirname, '../../data');
const configPath = path.resolve(dataDir, 'config.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch {}
}

export async function readRuntimeConfig(): Promise<RuntimeConfigFile> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(configPath, 'utf8');
    const json = JSON.parse(raw);
    return typeof json === 'object' && json ? json : {};
  } catch {
    return {};
  }
}

export async function writeRuntimeConfig(next: RuntimeConfigFile): Promise<void> {
  await ensureDataDir();
  const content = JSON.stringify(next, null, 2);
  await fs.writeFile(configPath, content, 'utf8');
}

export async function getSearchRuntimeConfig(): Promise<SearchRuntimeConfig | undefined> {
  const conf = await readRuntimeConfig();
  return conf.search;
}

export async function setSearchRuntimeConfig(update: SearchRuntimeConfig): Promise<SearchRuntimeConfig> {
  const conf = await readRuntimeConfig();
  const current = conf.search || {};
  const merged: SearchRuntimeConfig = {
    ...current,
    ...update,
  };
  await writeRuntimeConfig({ ...conf, search: merged });
  return merged;
}