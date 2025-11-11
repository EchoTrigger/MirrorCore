# MirrorCore - 智能模块化AI代理系统 🤖

<div align="center">

![GitHub release (latest by date)](https://img.shields.io/github/v/release/EchoTrigger/MirrorCore)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/EchoTrigger/MirrorCore/ci.yml)
![GitHub issues](https://img.shields.io/github/issues/EchoTrigger/MirrorCore)
![GitHub pull requests](https://img.shields.io/github/issues-pr/EchoTrigger/MirrorCore)
![GitHub stars](https://img.shields.io/github/stars/EchoTrigger/MirrorCore?style=social)

**下一代智能AI代理系统** - 自动加载功能模块，实现传统聊天无法完成的高级任务

</div>

---

## 🎯 核心设计

MirrorCore 的核心设计为：**以“代码沙箱 + 工具 API 编排”为基础的智能代理**。模型不需要把所有工具定义与中间结果塞进上下文，而是在后端受控的代码执行环境中按需加载并调用工具，先进行数据过滤与处理，再将“必要、精炼的结果”交给模型。这一路线与 MCP（Model Context Protocol）的“代码执行”理念高度一致，带来显著的上下文效率、隐私与可维护性优势。

### 🧠 工具按需加载与编排机制（代码沙箱）
- **工具即代码 API**：在受控沙箱中暴露工具方法（如 `tools.search(query, options)`），由代理脚本以熟悉的代码模式进行编排（循环、条件、错误处理）。
- **渐进式披露**：工具按“文件系统”组织，代理先浏览工具目录、再按需加载能力，避免把所有定义一次性放入上下文。
- **上下文最小化**：中间数据在执行环境处理，模型只读取必要结果，显著降低 token 使用与延迟。
- **配置脱离上下文**：搜索/工具行为通过运行时与环境变量管理（`/api/settings/search`），不再通过提示词携带配置，减少噪音并提升可控性。
- **统一服务与默认优先级**：`/api/search` 在未显式传参时自动选择默认值；默认来源优先级：运行时配置 > .env > 代码默认值。

### 🧭 核心设计原则
- **Code-first**：以代码作为编排与控制流核心；工具以 API 形式被调用而非提示词堆叠。
- **On-demand**：按需发现与加载工具；更接近“导航文件系统—选择—使用”的自然工作流。
- **Privacy-by-default**：中间结果默认留在执行环境；仅必要信息进入模型上下文。
- **Runtime configurability**：通过接口热更新运行时配置，避免重启与提示词污染。
- **State & Skills**：代理可在代码层积累可复用的技能与状态，逐步形成稳定能力。

### 🏪 工具目录与扩展生态（路线图）
- **文件树组织工具**：以 `servers/<provider>/<tool>.ts` 等结构映射工具目录，便于代理浏览与按需加载。
- **扩展工具族**：除 `tools.search` 外，规划 `tools.browser`、`tools.fs`、`tools.github` 等，丰富代码编排能力。
- **统一直链与缓存**：服务端解码搜索重定向链接、增加缓存与限流，提升稳定性与一致性。
- **类型化与测试**：工具返回结构类型化、完善集成与端到端测试，保证演进中的可维护性。
> 说明：完整扩展商店为后续阶段目标；当前仓库以“代码执行 + 工具 API”的后端验证为主。

### 📱 全平台部署愿景
当前重点：后端与桌面实验界面，持续验证“代码沙箱 + 工具 API”路线。
版本规划：商业与多端版本（手机、桌面、IoT），对接 MCP 生态与第三方扩展。
- 云端微服务架构与跨平台兼容
- 企业级安全与隐私合规
- 支持外部 MCP 服务器对接（桌面端 MCP 开关为实验性）

---

## 🧱 当前实现架构

为提升理解效率，以下架构与技术栈仅反映“当前仓库已实现”的核心部分：

- agent 包（MCP 代码模式核心）：
  - 使用 @modelcontextprotocol/sdk 的 Client，支持 Streamable HTTP 与 stdio 两种传输
  - 通用调用层：`src/callMCPTool.ts`（`callMCPTool()`、`listMCPTools()`）
  - 文件系统工具发现：`src/discovery.ts`（扫描 `src/servers/*`）
  - 工具封装：`src/servers/google-drive/*`、`src/servers/salesforce/*`、`src/servers/mirrorcore/search.ts`

- backend 包（后端验证）：
  - Node.js + Express，提供搜索与代码执行沙箱接口（如 `/api/search`、`/api/agent/exec`）
  - Playwright + DuckDuckGo 搜索实现；运行时配置热更新（`/api/settings/search`）

- desktop 包（实验界面）：
  - Electron 原型界面（renderer 中提供基础交互与 MCP 设置开关展示）

- docs： `docs/API.md` 作为接口详细规格的扩展参考

当前技术栈：
- Node.js 18+、TypeScript
- @modelcontextprotocol/sdk（Client + HTTP/stdio 传输）
- Express、Playwright、axios、zod
- Electron（示例界面）

---

## 🚀 快速开始

本仓库当前聚焦于“代码执行 + 工具 API”的后端验证与 MCP 代码模式。你可以直接使用 `agent/` 包进行工具发现与示例运行。

1) 安装依赖（Node ≥ 18）
- 进入 `agent/` 目录：`cd agent`
- 安装依赖：`npm install`

2) 配置环境变量（至少其一）
- `MCP_SERVER_URL`：指向你的 MCP HTTP 端点（示例：`http://localhost:3000`，默认路径 `/mcp`）
- `MCP_TRANSPORT`：`http`（默认）或 `stdio`
- `MCP_STDIO_COMMAND` / `MCP_STDIO_ARGS`：如走 stdio 传输，指定启动远端 MCP 服务器的命令与参数
- `MIRRORCORE_BACKEND_URL`：使用 MirrorCore 后端的搜索/抓取示例时指向后端（默认 `http://localhost:3001`）

3) 验证工具发现
- 执行：`npm run list:servers`
- 预期输出示例：`google-drive: getDocument`、`salesforce: updateRecord`、`mirrorcore: search`

4) 运行示例（需远端 MCP 服务器实际暴露对应工具）
- `npm run example:transcript`
  - 说明：示例将从 Google Drive 读取一个文档，然后更新到 Salesforce 的某条记录
  - 要求：远端 MCP 服务器提供 `google_drive__get_document` 与 `salesforce__update_record` 工具

5) 枚举远端工具（快速检验服务器能力）
- `npm run example:list-tools`
  - 说明：输出工具名称、描述、输入/输出 JSON Schema 的 properties/required 等关键信息
  - 支持 HTTP（默认）与 stdio 两种传输，取决于你的环境变量配置

如需进一步开发与集成，请阅读下文的“MCP 代码模式实现”“MirrorCore 能力封装示例”和“开发指南要点”。

---

### MCP stdio 快速起步（可选）

当你的 MCP 服务器以本地进程方式提供连接时，可使用 stdio 传输：

- 环境变量示例（Windows PowerShell）：
  - `$env:MCP_TRANSPORT = 'stdio'`
  - `$env:MCP_STDIO_COMMAND = 'node'`
  - `$env:MCP_STDIO_ARGS = 'path/to/your-mcp-server.js --port 0'`
  - 运行：`npm run example:list-tools`

- 环境变量示例（Linux/macOS）：
  - `export MCP_TRANSPORT=stdio`
  - `export MCP_STDIO_COMMAND=node`
  - `export MCP_STDIO_ARGS="path/to/your-mcp-server.js --port 0"`
  - 运行：`npm run example:list-tools`

提示：`--port 0` 是常见的“自动分配端口”习惯；具体参数取决于你的 MCP 服务器实现。

---

## 🧩 MCP 代码模式（Code Mode）在本仓库的实现

> 参考：
> - Model Context Protocol TypeScript SDK（服务器与客户端）：https://github.com/modelcontextprotocol/typescript-sdk
> - Anthropic 工程博客（代码执行 + MCP）：https://www.anthropic.com/engineering/code-execution-with-mcp

我们将 MCP 服务器呈现为“代码 API”，而不是直接把工具定义塞进模型上下文。代理通过探索文件系统发现工具、按需加载并在受控代码环境中编排，显著降低 token 使用与延迟。

### 目录结构（agent/ 包）

```
agent/
├── package.json
├── tsconfig.json
├── src/
│   ├── callMCPTool.ts               # 通用调用层（正式 MCP 客户端：Client + HTTP/stdio）
│   ├── discovery.ts                 # 文件系统工具发现：servers/*
│   └── servers/
│       ├── google-drive/
│       │   ├── getDocument.ts       # 工具封装：google_drive__get_document
│       │   └── index.ts
│       ├── salesforce/
│       │   ├── updateRecord.ts      # 工具封装：salesforce__update_record
│       │   └── index.ts
│       └── mirrorcore/
│           └── search.ts            # MirrorCore 自身能力的代码 API（非 MCP 工具）
└── examples/
    └── transcript_to_salesforce.ts  # 示例：读取 GDrive 文档并更新 Salesforce 记录
```

### 代码调用示例（Google Drive → Salesforce）

```ts
// Read transcript from Google Docs and add to Salesforce prospect
import * as gdrive from './agent/src/servers/google-drive';
import * as salesforce from './agent/src/servers/salesforce';

const transcript = (await gdrive.getDocument({ documentId: 'abc123' })).content;
await salesforce.updateRecord({
  objectType: 'SalesMeeting',
  recordId: '00Q5f000001abcXYZ',
  data: { Notes: transcript }
});
```

> 运行示例：
> 1) 在 `agent/` 安装依赖：`npm install`（需 Node ≥ 18）
> 2) 配置 MCP 服务器：将 `MCP_SERVER_URL` 指向可达的 MCP HTTP 端点（例如 `http://localhost:3000/mcp`）
> 3) 运行示例：`npm run example:transcript`（需目标 MCP 服务器实际暴露 `google_drive__get_document` 与 `salesforce__update_record` 工具）

### MirrorCore 能力的代码 API 封装示例

我们还提供了对 MirrorCore 后端现有 API 的代码封装（非 MCP 工具）：

```ts
import { search, fetchPage } from './agent/src/servers/mirrorcore/search';

const result = await search({
  query: '大型语言模型代码模式',
  mode: 'auto',
  engine: 'google',
  limit: 5,
  locale: 'zh-CN',
  headless: false,
  timeoutMs: 30000
});

const page = await fetchPage({
  url: result.results[0].url,
  headless: false,
  timeoutMs: 30000,
  locale: 'zh-CN'
});
```

### 工具发现机制（文件系统）
- 代理通过扫描 `agent/src/servers/*` 目录发现可用服务器（如 `google-drive`、`salesforce`、`mirrorcore`）。
- 每个工具对应一个文件（如 `getDocument.ts`、`updateRecord.ts`），明确输入/输出的类型定义。
- 代理只加载当前任务所需的工具定义，避免一次性把所有定义放入模型上下文。

### 传输实现说明（正式客户端）
- `callMCPTool.ts` 已使用 `@modelcontextprotocol/sdk` 提供的 `Client` 与 `StreamableHTTPClientTransport`/`StdioClientTransport` 实现正式调用。
- 上层工具封装（`servers/*/*.ts`）不需要改动，即可在不同传输间切换（通过环境变量或参数指定）。
- 额外提供 `listMCPTools()` 以便在代码中枚举远端服务器公开的工具能力，辅助 agent 做按需加载与探测。

---

## 🛠️ 开发指南要点

- 架构与理念：以“代码执行 + 工具 API 编排”为核心（详见上文“核心愿景”“MCP 代码模式实现”）
- 代码目录约定：工具封装位于 `agent/src/servers/<provider>/<tool>.ts`，每个工具定义清晰的输入/输出（使用 `zod` 进行校验）
- 运行时配置：优先通过环境变量与后端接口进行热更新；避免把配置塞入模型上下文（减少提示词噪音）
- 工具发现：使用 `discoverServers()` 扫描文件系统；代码中也可使用 `listMCPTools()` 枚举远端工具
- 示例与测试：提供跨服务示例（Google Drive → Salesforce）；建议为每个工具封装增加集成测试与端到端测试
- 安全与隐私：中间结果默认留在执行环境，模型仅接触必要结果；敏感数据通过受控接口访问

详细接口规格位于 `docs/API.md`；系统架构、模块商店、DevOps 等完整研发细节将以白皮书形式提供。

---

## 📚 文档整合与精简（状态更新）

---

## 📚 文档整合

- 主干内容（愿景、架构、MCP 代码模式、快速开始、示例）统一在 `README.md`。
- `docs/API.md` 用于接口详细规格；README 提供概览与入口。

| **安全认证** | JWT, OAuth 2.0, 端到端加密 | 企业级安全保障 |

---

## 🧩 MCP代码执行理念与 MirrorCore 的实践

MirrorCore 采用“代码执行 + 工具 API”的方案，理念与 Anthropic 提出的 Model Context Protocol (MCP) 中的“将工具以代码 API 形式呈现、在执行环境中编排”高度一致。参考：Code execution with MCP（https://www.anthropic.com/engineering/code-execution-with-mcp）。

- 痛点（MCP 文中总结）：
  - 工具定义过载上下文：将所有工具描述加载到模型上下文会显著增加延迟与成本。
  - 中间结果 token 冗余：每次工具调用的中间数据都要经过模型上下文，导致额外 token 消耗甚至超过上下文窗口。

- MirrorCore 的实践：
  - 在后端提供代码执行沙箱接口：`POST /api/agent/exec`。
  - 在沙箱中以“代码 API”暴露工具：例如 `tools.search(query, options)`。
  - Agent 以代码编排工具，只将必要的最终结果返回给模型，避免把大量工具定义与中间结果塞入上下文。
  - 配置不进入上下文：通过运行时配置与环境默认值管理搜索行为（`/api/settings/search`），减少提示词（prompt）中的配置噪音。

### 实现办法：工具组织为“文件系统”并按需加载

- 工具以文件树结构组织，便于“渐进式披露”和“按需加载”：
```
servers/
  ├── search/
  │   ├── duckduckgo.ts
  │   ├── bing.ts
  │   ├── baidu.ts
  │   └── index.ts
  ├── browser/
  │   ├── goto.ts
  │   ├── screenshot.ts
  │   └── index.ts
  └── ...
```
- 代理通过浏览工具文件树发现能力，只在需要时加载对应工具定义和依赖；避免一次性把所有工具描述塞进上下文。
- 当前仓库已以统一服务的方式提供工具（如 `tools.search`），后续将补充文件树映射与按需加载机制，让 agent 更擅长“导航—探索—加载—编排”。

### 优势总结（对齐 MCP 理念）

1) 渐进式披露：按需加载工具定义，代理擅长导航文件系统，逐步探索并加载所需工具，而不是一次性加载全部定义。
2) 上下文高效：在执行环境处理数据；处理大型数据集时，先在代码中过滤和转换，再返回精炼结果给模型，降低 token 使用。
3) 强大的控制流：使用熟悉的代码模式（循环、条件判断、错误处理）实现任务编排，而非复杂的链式工具调用。
4) 隐私保护：敏感数据不进入模型上下文，中间结果默认保留在执行环境，模型只接触明确记录或返回的内容。
5) 状态与技能：代理可以维护状态并积累技能（复用工具代码、缓存与配置），实现更强的长期能力。

- 最小示例（搜索 + 轻量摘要，运行于沙箱）：
```
const query = "Playwright 教程";
const res = await tools.search(query, { mode: "auto", engine: "bing", limit: 5 });
const items = (res.results || []).map((r, i) => `(${i+1}) ${r.title}`);
return { ok: true, query, modeUsed: res.modeUsed, engineUsed: res.engineUsed, summary: items.slice(0, 3).join("; ") };
```

- 与“直接工具调用”方式的对比：
  - 直接工具调用：工具定义与每次中间结果都要进模型上下文，易造成上下文爆炸与 token 浪费。
  - MirrorCore 方式：工具在代码执行环境中工作，模型只消费必要的结果与控制指令，显著降低 token 使用与延迟。

- 路线图（MCP 兼容与生态）：
  - 工具文件树映射：以文件树组织工具（例如 `servers/<provider>/<tool>.ts`），便于按需加载与组合。
  - 扩展工具目录：除 `tools.search` 外，计划提供 `tools.browser`、`tools.fs`、`tools.github` 等，丰富代码编排能力。
  - 直链解码与缓存：统一解码 Bing/Baidu 重定向链接、增加缓存与限流，提升稳定性与可用性。
  - 类型化与测试：工具返回结构类型化、完善集成测试确保端到端稳定。

> 桌面端 MCP 开关说明：在界面“设置”页可看到 MCP 开关与服务器地址（`desktop/renderer/index.html`），该功能为实验性展示，当前仓库并未内置 MCP 服务器；如需体验，请连接外部 MCP 兼容服务器。

### 🔐 安全与隐私

- **模块沙箱**：每个模块运行在独立的安全环境中
- **权限控制**：细粒度的API访问权限管理
- **数据加密**：端到端加密保护用户隐私
- **审计日志**：完整的操作记录和安全审计
- **合规认证**：符合GDPR、SOC2等安全标准

---

## 📁 项目结构

```
MirrorCore/
├── agent/                  # MCP 代码模式核心（Client + 工具封装）
│   ├── src/
│   │   ├── callMCPTool.ts  # 通用 MCP 调用层（HTTP/stdio）
│   │   ├── discovery.ts    # 文件系统工具发现（servers/*）
│   │   └── servers/        # 工具封装（google-drive/salesforce/mirrorcore）
│   ├── examples/
│   │   ├── list_remote_tools.ts       # 远端工具枚举示例（新）
│   │   └── transcript_to_salesforce.ts# 跨服务示例（GDrive→Salesforce）
│   ├── package.json
│   └── tsconfig.json
├── backend/                # 后端验证：搜索与代码执行沙箱
│   ├── data/
│   │   └── config.json
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
├── desktop/                # Electron 原型界面
│   ├── renderer/
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── renderer.js
│   ├── src/
│   │   ├── main.ts
│   │   └── preload.ts
│   └── package.json
├── shared/                 # 共享类型
│   ├── src/
│   │   └── types/
│   └── package.json
├── docs/
│   └── API.md             # 接口详细规格（保留）
├── scripts/               # 一键脚本
│   ├── setup.bat
│   └── start-all.bat
└── README.md
```

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- 现代浏览器支持
- 网络连接（智能体需要联网功能）

### 快速部署

```bash
# 1. 克隆智能体项目
git clone https://github.com/your-username/MirrorCore.git
cd MirrorCore

# 2. 安装依赖
npm install
cd backend && npm install && cd ..
cd desktop && npm install && cd ..

# 3. 配置AI服务
cd backend
cp .env.example .env
# 编辑.env文件，配置AI API密钥

# 4. 启动智能体系统
npm run dev:backend    # 终端1: 启动智能体引擎
npm run dev:desktop    # 终端2: 启动前端界面

# 或者在项目根并行启动：
# 该命令会同时启动后端与桌面应用（需要 concurrently）
npm run dev
# Windows 一键脚本（可选）：
# scripts/start-all.bat

> Playwright提示：首次安装依赖会自动执行 `playwright install chromium`（backend/postinstall），如遇网络问题可手动运行：
> `npx playwright install chromium --with-deps` 或配置企业镜像源。
```

### AI服务配置

说明：在 `.env` 中仅选择一个提供商（openai / claude / qwen / local）进行配置。以下为分提供商示例，请勿整段复制到同一个 `.env` 文件中。

OpenAI 示例
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
# 可选：模型与自定义基础URL
OPENAI_MODEL=gpt-4o-mini
OPENAI_BASE_URL=https://api.openai.com/v1
```

Qwen 示例（OpenAI 兼容模式）
```bash
AI_PROVIDER=qwen
# 可二选一：QWEN_API_KEY 或 DASHSCOPE_API_KEY
QWEN_API_KEY=your_qwen_api_key
# DASHSCOPE_API_KEY=your_qwen_api_key
# 可选：覆盖默认兼容接口与模型
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-turbo
```

Claude 示例
```bash
AI_PROVIDER=claude
CLAUDE_API_KEY=your_claude_api_key
# 可选：模型
CLAUDE_MODEL=claude-3-sonnet-20240229
```

通用覆盖（优先级高于特定提供商配置，仅适用于 openai/qwen）
```bash
# 设置后将覆盖对应 provider 的 apiKey / baseURL / model
AI_API_KEY=your_api_key
AI_BASE_URL=https://your-api-endpoint.com/v1
AI_MODEL=gpt-4o-mini
```

本地模拟模式（离线/无密钥调试）
```bash
AI_PROVIDER=local
```

提示：更多变量与默认值请参见 `backend/.env.example`。

---

## ✅ 当前已实现的技术路线（后端验证版）

- 统一搜索服务与默认配置优先级
  - 接口：`GET /api/search`
  - 默认值来源优先级：运行时配置 > 环境变量(.env) > 代码默认值
  - 支持搜索方法：`Auto` | `DuckDuckGo` | `Playwright`
  - 支持搜索引擎：`DuckDuckGo` | `Bing` | `Baidu`
  - 路由层仅透传显式参数，默认值由服务层按优先级自动选择

- 搜索设置热更新（无需重启）
  - 接口：`GET /api/settings/search`、`PUT /api/settings/search`
  - 运行时配置持久化位置：`backend/data/config.json`
  - 环境变量仅作为初始默认值模板（见 `backend/.env.example` 文件末尾）

- 代码执行沙箱与工具 API
  - 接口：`POST /api/agent/exec`
  - 支持在沙箱中执行 JavaScript 代码，并暴露 `tools.search(query, options)` 方法
  - 用于构建“搜索 + 轻量摘要”的最小示例智能体脚本，便于验证端到端能力

- AI 服务状态查询
  - 接口：`GET /api/chat/ai-status`
  - 返回当前提供商、模型、密钥可用性与健康状态，便于部署前检查配置

### 使用示例（Windows PowerShell）

- 更新运行时搜索设置（热更新，无需重启）：
```
$body = @{ method = "Playwright"; engine = "Baidu"; maxResults = 12; headless = $true; timeoutMs = 10000; locale = "zh-CN" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/settings/search" -Method Put -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 4
```

- 查看当前搜索设置（运行时 + 环境）：
```
Invoke-RestMethod -Uri "http://localhost:3000/api/settings/search" -Method Get | ConvertTo-Json -Depth 4
```

- 使用默认设置进行搜索（不显式传参 mode/engine/limit）：
```
Invoke-RestMethod -Uri "http://localhost:3000/api/search?query=Playwright%20%E6%95%99%E7%A8%8B" -Method Get | ConvertTo-Json -Depth 3
```

- 在沙箱中执行最小 agent 脚本（示例：搜索 + 轻量摘要）：
```
$script = @'
const query = "Playwright 教程";
const res = await tools.search(query, { mode: "auto", engine: "bing", limit: 5 });
const items = (res.results || []).map((r, i) => `(${i+1}) ${r.title}`);
return { ok: true, query, modeUsed: res.modeUsed, engineUsed: res.engineUsed, summary: items.slice(0, 3).join("; ") };
'@;
$body = @{ code = $script } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/agent/exec" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 4
```

- 查询 AI 服务状态：
```
Invoke-RestMethod -Uri "http://localhost:3000/api/chat/ai-status" -Method Get | ConvertTo-Json -Depth 4
```

### 使用示例（Linux/macOS，curl）

- 更新运行时搜索设置（热更新，无需重启）：
```bash
curl -X PUT "http://localhost:3000/api/settings/search" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "Playwright",
    "engine": "Baidu",
    "maxResults": 12,
    "headless": true,
    "timeoutMs": 10000,
    "locale": "zh-CN"
  }'
```

- 查看当前搜索设置（运行时 + 环境）：
```bash
curl -s "http://localhost:3000/api/settings/search" | jq
```

- 使用默认设置进行搜索（不显式传参 mode/engine/limit）：
```bash
curl -s "http://localhost:3000/api/search?query=Playwright%20%E6%95%99%E7%A8%8B" | jq
```

- 在沙箱中执行最小 agent 脚本（示例：搜索 + 轻量摘要）：
```bash
curl -X POST "http://localhost:3000/api/agent/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "const query = \'Playwright 教程\'; const res = await tools.search(query, { mode: \'auto\', engine: \'bing\', limit: 5 }); const items = (res.results || []).map((r, i) => \`(${i+1}) ${r.title}\`); return { ok: true, query, modeUsed: res.modeUsed, engineUsed: res.engineUsed, summary: items.slice(0, 3).join(\'; \') };"
  }' | jq
```

- 查询 AI 服务状态：
```bash
curl -s "http://localhost:3000/api/chat/ai-status" | jq
```

### 重要说明与建议

- 环境变量（.env）仅作为初始默认值；运行时更新优先级更高，且无需重启服务。
- Auto 模式会先尝试 DuckDuckGo，必要时回退到 Playwright；Playwright 在复杂网络环境下更稳健。
- Bing 与 Baidu 的搜索结果可能返回重定向链接（如 `http://www.baidu.com/link?...`）；建议后续在服务端统一解码并返回直链以提升可用性。
- 沙箱目前仅支持 JavaScript；为安全起见，限制了部分 Node.js 全局对象与外部网络能力，详见 API 文档说明。

更多接口与字段说明，详见 [docs/API.md](docs/API.md) 新增的“搜索接口与配置（后端实现）”章节。

---

## ❓ 常见问题（FAQ）

- Playwright 无法安装/下载 Chromium
  - 解决：后端已在 postinstall 执行 `playwright install chromium`；如网络受限，手动运行：
    - `npx playwright install chromium --with-deps`
    - 或配置企业/地区镜像源后再执行安装

- AI 状态不可用（/api/chat/ai-status 显示 unavailable）
  - 检查：
    1) `.env` 中是否只设置了单一 `AI_PROVIDER`（openai/claude/qwen/local）
    2) 对应提供商的 API Key 是否有效（OpenAI/Claude/Qwen）
    3) 是否误同时设置了 `AI_API_KEY/AI_BASE_URL` 导致覆盖
    4) 如为 `local` 模式：该模式不调用外部服务，仅用于联调演示

- 端口冲突（默认 3000 被占用）
  - 解决：在 `backend/.env` 中设置 `PORT=3001`，并相应修改桌面端的服务器地址

- PowerShell 序列化注意事项
  - 将哈希表转换为 JSON 时使用 `ConvertTo-Json`，布尔值用 `$true/$false`；字符串需使用双引号

- CORS 或网络访问问题
  - 后端已启用跨域（`cors()`），若前端或外部脚本仍受限，检查网络代理或安全策略

---

## 🎯 使用场景

### 开发助手
- **代码审查**：自动分析代码质量和潜在问题
- **重构建议**：提供代码优化和架构改进建议
- **文档生成**：自动生成API文档和使用说明

### 项目管理
- **任务规划**：将需求分解为具体的开发任务
- **进度跟踪**：监控项目进展和里程碑
- **质量保证**：自动化测试和代码检查

### 自动化操作
- **环境配置**：自动设置开发环境和依赖
- **部署管理**：自动化构建和部署流程
- **监控报告**：系统状态监控和异常报告

---

## 🔧 开发指南

### 添加新功能模块

1. 在`backend/src/services/`中创建模块服务
2. 在`backend/src/routes/`中添加API路由
3. 更新前端界面以支持新功能
4. 编写模块文档和测试用例

### 智能体能力扩展

```typescript
// 示例：添加新的智能体功能
interface AgentModule {
  name: string;
  description: string;
  execute: (params: AgentParams) => Promise<AgentResult>;
  capabilities: string[];
}
```

---

## 📚 文档

- [API 文档](docs/API.md) - 接口与字段的详细说明（仅保留此处，避免重复）
- [贡献指南](CONTRIBUTING.md) - 提交规范与协作流程

---

## 🚀 发展路线图

### 🎯 当前阶段：开发者验证版本 (v0.x)
**目标**：功能验证和技术可行性证明
- ✅ 基础对话界面和后端架构
- ✅ 核心AI推理引擎集成
- 🔄 智能模块加载机制开发
- 📋 用户体验测试和优化

### 🏢 第一阶段：商业版本 (v1.x)
**目标**：前后端分离的云端部署版本
- **云端架构**：微服务化部署，支持弹性扩展
- **多用户支持**：企业级用户管理和权限控制
- **扩展商店上线**：官方和第三方模块生态
- **API开放平台**：为开发者提供模块开发工具
- **安全合规**：企业级安全认证和隐私保护

### 📱 第二阶段：全平台部署 (v2.x)
**目标**：跨设备智能代理生态
- **移动端应用**：iOS/Android原生应用
- **Web端支持**：浏览器版本，无需安装
- **智能设备集成**：
  - 智能音箱和语音助手
  - 智能手表和可穿戴设备
  - 车载系统和IoT设备
  - 智能家居控制中心

### 🌐 第三阶段：AI代理网络 (v3.x)
**目标**：构建智能代理协作网络
- **多代理协作**：不同专业领域的AI代理协同工作
- **知识共享网络**：代理间的知识和经验共享
- **自主学习进化**：基于用户反馈的持续学习
- **生态系统建设**：开发者、用户、企业的完整生态

---

## 💡 商业模式

### 🎯 目标市场
- **个人用户**：追求效率和智能化生活的用户
- **企业客户**：需要智能化办公和自动化的企业
- **开发者生态**：希望构建AI应用的开发者
- **设备制造商**：智能设备和IoT厂商

### 💰 收益模式
- **订阅服务**：按月/年收费的高级功能
- **模块商店**：扩展模块的销售分成
- **企业定制**：为企业客户提供定制化解决方案
- **API服务**：为开发者提供AI能力API
- **硬件合作**：与设备厂商的预装合作

### 🎨 差异化优势
- **智能模块加载**：AI驱动模块系统
- **无缝用户体验**：用户无需学习，AI自动适配
- **开放生态系统**：支持第三方开发者贡献
- **全平台覆盖**：从桌面到移动到IoT的全覆盖
- **隐私优先**：用户数据安全和隐私保护

---

## 📄 许可证

Apache License 2.0 - 详见 [LICENSE](LICENSE) 文件

---

## 🤝 贡献

欢迎为MirrorCore智能体系统贡献代码和想法！

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/NewAgentCapability`)
3. 提交更改 (`git commit -m 'Add new agent capability'`)
4. 推送分支 (`git push origin feature/NewAgentCapability`)
5. 创建Pull Request

---

<div align="center">

**[⬆ 回到顶部](#mirrorcore---联网ai智能体系统-)**

Made with ❤️ by MirrorCore AI Agent Team

</div>

