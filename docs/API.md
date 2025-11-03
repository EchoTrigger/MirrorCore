# MirrorCore AI智能体系统 - API文档 🤖

本文档详细描述了MirrorCore AI智能体系统的模块化功能接口和API规范。

## 📋 目录

- [智能体核心API](#-智能体核心api)
- [代码分析模块](#-代码分析模块)
- [项目管理模块](#-项目管理模块)
- [文件操作模块](#-文件操作模块)
- [命令执行模块](#-命令执行模块)
- [浏览器控制模块](#-浏览器控制模块)
- [网络搜索模块](#-网络搜索模块)
- [实时预览模块](#-实时预览模块)

---

## 🤖 智能体核心API

### 基础信息

**Base URL**: `http://localhost:3000/api`

**认证方式**: 功能测试阶段无需认证

**响应格式**: JSON

### 智能体状态检查

#### GET /agent/status

获取智能体系统运行状态

**响应示例**:
```json
{
  "status": "running",
  "version": "1.0.0",
  "uptime": 3600,
  "modules": {
    "codeAnalysis": "active",
    "projectManagement": "active",
    "fileOperations": "active",
    "commandExecution": "active",
    "browserControl": "active",
    "webSearch": "active"
  },
  "aiService": {
    "provider": "openai",
    "model": "gpt-4",
    "status": "connected"
  }
}
```

#### GET /agent/capabilities

获取智能体能力清单

**响应示例**:
```json
{
  "capabilities": [
    "natural_language_understanding",
    "code_analysis_and_generation",
    "project_management",
    "file_system_operations",
    "command_execution",
    "web_automation",
    "real_time_search",
    "task_planning"
  ],
  "supportedLanguages": [
    "javascript", "typescript", "python", 
    "java", "cpp", "go", "rust", "html", "css"
  ],
  "integrations": [
    "git", "npm", "docker", "browser_automation"
  ]
}
```

---

## 💬 对话交互API

### 智能体对话

#### POST /chat/message

与智能体进行对话交互

**请求体**:
```json
{
  "message": "请帮我分析这个React组件的性能问题",
  "context": {
    "projectPath": "/path/to/project",
    "currentFile": "src/components/MyComponent.jsx",
    "taskType": "code_analysis"
  },
  "attachments": [
    {
      "type": "file",
      "path": "src/components/MyComponent.jsx"
    }
  ]
}
```

**响应示例**:
```json
{
  "response": "我来分析这个React组件的性能问题...",
  "actions": [
    {
      "type": "code_analysis",
      "moduleId": "code-analyzer",
      "status": "completed",
      "results": {
        "issues": [
          {
            "type": "performance",
            "severity": "medium",
            "line": 15,
            "message": "建议使用React.memo优化重渲染"
          }
        ]
      }
    }
  ],
  "suggestions": [
    "使用React.memo包装组件",
    "优化useEffect依赖数组",
    "考虑使用useMemo缓存计算结果"
  ]
}
```

#### GET /chat/history

获取对话历史

**查询参数**:
- `limit`: 返回条数限制 (默认: 50)
- `offset`: 偏移量 (默认: 0)

**响应示例**:
```json
{
  "messages": [
    {
      "id": "msg_001",
      "timestamp": "2024-01-15T10:30:00Z",
      "type": "user",
      "content": "请帮我创建一个新的React组件",
      "context": {
        "projectPath": "/path/to/project"
      }
    },
    {
      "id": "msg_002",
      "timestamp": "2024-01-15T10:30:05Z",
      "type": "agent",
      "content": "我来帮您创建React组件...",
      "actions": [
        {
          "type": "file_creation",
          "status": "completed"
        }
      ]
    }
  ],
  "total": 25,
  "hasMore": true
}
```

---

## 📝 代码分析模块

### 代码分析

#### POST /modules/code-analysis/analyze

分析代码文件或项目

**请求体**:
```json
{
  "target": {
    "type": "file", // "file" | "directory" | "project"
    "path": "/path/to/file.js"
  },
  "options": {
    "depth": "deep", // "shallow" | "medium" | "deep"
    "includeTests": true,
    "languages": ["javascript", "typescript"],
    "metrics": ["complexity", "maintainability", "performance"]
  }
}
```

**响应示例**:
```json
{
  "analysisId": "analysis_001",
  "status": "completed",
  "results": {
    "overview": {
      "totalFiles": 15,
      "totalLines": 2500,
      "languages": ["javascript", "typescript"],
      "complexity": "medium"
    },
    "issues": [
      {
        "file": "src/utils/helper.js",
        "line": 42,
        "type": "complexity",
        "severity": "high",
        "message": "函数复杂度过高，建议重构",
        "suggestion": "将大函数拆分为多个小函数"
      }
    ],
    "metrics": {
      "maintainabilityIndex": 75,
      "cyclomaticComplexity": 8.5,
      "technicalDebt": "2.5 hours"
    },
    "suggestions": [
      "添加单元测试覆盖",
      "优化函数复杂度",
      "改进变量命名"
    ]
  }
}
```

### 代码生成

#### POST /modules/code-analysis/generate

生成代码片段或文件

**请求体**:
```json
{
  "request": "创建一个React Hook用于管理用户状态",
  "context": {
    "language": "typescript",
    "framework": "react",
    "style": "functional"
  },
  "specifications": {
    "features": ["state management", "persistence", "validation"],
    "patterns": ["custom hook", "typescript generics"]
  }
}
```

**响应示例**:
```json
{
  "generatedCode": {
    "filename": "useUserState.ts",
    "content": "import { useState, useEffect } from 'react';\n\n// Generated code...",
    "language": "typescript",
    "framework": "react"
  },
  "explanation": "这个自定义Hook提供了用户状态管理功能...",
  "usage": {
    "example": "const { user, updateUser, isLoading } = useUserState();",
    "imports": ["import { useUserState } from './hooks/useUserState';"]
  }
}
```

---

## 🗂️ 项目管理模块

### 任务管理

#### POST /modules/project-management/tasks

创建新任务

**请求体**:
```json
{
  "title": "实现用户认证功能",
  "description": "添加登录、注册和密码重置功能",
  "priority": "high", // "low" | "medium" | "high" | "urgent"
  "category": "feature", // "feature" | "bug" | "refactor" | "docs"
  "estimatedHours": 8,
  "assignee": "developer",
  "tags": ["authentication", "security", "frontend"],
  "subtasks": [
    "设计登录界面",
    "实现API接口",
    "添加表单验证",
    "编写单元测试"
  ]
}
```

**响应示例**:
```json
{
  "taskId": "task_001",
  "status": "created",
  "createdAt": "2024-01-15T10:30:00Z",
  "estimatedCompletion": "2024-01-16T18:30:00Z",
  "generatedFiles": [
    "docs/tasks/task_001_authentication.md",
    "src/components/auth/LoginForm.jsx"
  ]
}
```

#### GET /modules/project-management/tasks

获取任务列表

**查询参数**:
- `status`: 任务状态 (`pending`, `in_progress`, `completed`, `blocked`)
- `priority`: 优先级过滤
- `assignee`: 负责人过滤
- `limit`: 返回数量限制

**响应示例**:
```json
{
  "tasks": [
    {
      "id": "task_001",
      "title": "实现用户认证功能",
      "status": "in_progress",
      "priority": "high",
      "progress": 65,
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T14:20:00Z",
      "subtasks": {
        "total": 4,
        "completed": 2
      }
    }
  ],
  "summary": {
    "total": 12,
    "pending": 3,
    "inProgress": 5,
    "completed": 4
  }
}
```

### 项目分析

#### GET /modules/project-management/analysis

获取项目整体分析

**响应示例**:
```json
{
  "projectHealth": {
    "score": 85,
    "status": "good",
    "factors": {
      "codeQuality": 88,
      "testCoverage": 75,
      "documentation": 80,
      "performance": 92
    }
  },
  "progress": {
    "overall": 68,
    "milestones": [
      {
        "name": "MVP Release",
        "progress": 85,
        "dueDate": "2024-02-01"
      }
    ]
  },
  "recommendations": [
    "增加单元测试覆盖率",
    "完善API文档",
    "优化构建性能"
  ]
}
```

---

## 📁 文件操作模块

### 文件管理

#### POST /modules/file-operations/create

创建文件或目录

**请求体**:
```json
{
  "path": "/path/to/new/file.js",
  "type": "file", // "file" | "directory"
  "content": "// 文件内容",
  "template": "react-component", // 可选模板
  "options": {
    "overwrite": false,
    "createDirectories": true
  }
}
```

#### PUT /modules/file-operations/update

更新文件内容

**请求体**:
```json
{
  "path": "/path/to/file.js",
  "content": "// 更新后的内容",
  "operation": "replace", // "replace" | "append" | "prepend" | "patch"
  "backup": true
}
```

#### GET /modules/file-operations/read

读取文件内容

**查询参数**:
- `path`: 文件路径
- `encoding`: 编码格式 (默认: utf8)

#### DELETE /modules/file-operations/delete

删除文件或目录

**请求体**:
```json
{
  "path": "/path/to/file.js",
  "recursive": false, // 目录删除时是否递归
  "backup": true
}
```

### 文件搜索

#### GET /modules/file-operations/search

搜索文件内容

**查询参数**:
- `query`: 搜索关键词
- `path`: 搜索路径
- `fileTypes`: 文件类型过滤
- `caseSensitive`: 是否区分大小写

**响应示例**:
```json
{
  "results": [
    {
      "file": "src/components/Header.jsx",
      "matches": [
        {
          "line": 15,
          "content": "const handleClick = () => {",
          "context": "function definition"
        }
      ]
    }
  ],
  "summary": {
    "totalFiles": 5,
    "totalMatches": 12
  }
}
```

---

## ⚙️ 命令执行模块

### 命令执行

#### POST /modules/command-execution/run

执行系统命令

**请求体**:
```json
{
  "command": "npm install",
  "workingDirectory": "/path/to/project",
  "options": {
    "timeout": 30000,
    "shell": true,
    "env": {
      "NODE_ENV": "development"
    }
  },
  "async": false // 是否异步执行
}
```

**响应示例**:
```json
{
  "executionId": "exec_001",
  "status": "completed", // "running" | "completed" | "failed"
  "exitCode": 0,
  "stdout": "added 150 packages in 5.2s",
  "stderr": "",
  "duration": 5200,
  "startTime": "2024-01-15T10:30:00Z",
  "endTime": "2024-01-15T10:30:05Z"
}
```

#### GET /modules/command-execution/status/{executionId}

获取命令执行状态

**响应示例**:
```json
{
  "executionId": "exec_001",
  "status": "running",
  "progress": 65,
  "currentOutput": "Installing dependencies...",
  "estimatedTimeRemaining": 2000
}
```

### 脚本管理

#### POST /modules/command-execution/scripts

创建和管理脚本

**请求体**:
```json
{
  "name": "deploy-staging",
  "description": "部署到测试环境",
  "commands": [
    "npm run build",
    "docker build -t app:staging .",
    "docker push registry/app:staging"
  ],
  "workingDirectory": "/path/to/project",
  "environment": "staging"
}
```

---

## 🌐 浏览器控制模块

### 浏览器自动化

#### POST /modules/browser-control/navigate

导航到指定URL

**请求体**:
```json
{
  "url": "https://example.com",
  "options": {
    "waitForLoad": true,
    "timeout": 10000,
    "viewport": {
      "width": 1920,
      "height": 1080
    }
  }
}
```

#### POST /modules/browser-control/interact

与页面元素交互

**请求体**:
```json
{
  "action": "click", // "click" | "type" | "select" | "hover"
  "selector": "#submit-button",
  "value": "text to type", // 仅对type操作有效
  "options": {
    "waitForElement": true,
    "timeout": 5000
  }
}
```

#### GET /modules/browser-control/extract

提取页面数据

**查询参数**:
- `selectors`: CSS选择器列表
- `attributes`: 要提取的属性
- `format`: 返回格式 (json | csv | xml)

**响应示例**:
```json
{
  "data": [
    {
      "selector": "h1",
      "text": "页面标题",
      "attributes": {
        "class": "main-title"
      }
    }
  ],
  "metadata": {
    "url": "https://example.com",
    "timestamp": "2024-01-15T10:30:00Z",
    "pageTitle": "Example Page"
  }
}
```

### 页面分析

#### GET /modules/browser-control/analyze

分析页面结构和性能

**响应示例**:
```json
{
  "structure": {
    "elements": 245,
    "forms": 3,
    "links": 28,
    "images": 15
  },
  "performance": {
    "loadTime": 1250,
    "domContentLoaded": 800,
    "firstContentfulPaint": 600
  },
  "accessibility": {
    "score": 85,
    "issues": [
      {
        "type": "missing-alt-text",
        "severity": "medium",
        "count": 3
      }
    ]
  }
}
```

---

## 🔍 网络搜索模块

### 实时搜索

#### POST /modules/web-search/search

执行网络搜索

**请求体**:
```json
{
  "query": "React 18 新特性",
  "options": {
    "maxResults": 10,
    "language": "zh-CN",
    "region": "CN",
    "timeRange": "past_year", // "any" | "past_day" | "past_week" | "past_month" | "past_year"
    "sources": ["web", "news", "academic"] // 搜索源类型
  }
}
```

**响应示例**:
```json
{
  "searchId": "search_001",
  "query": "React 18 新特性",
  "results": [
    {
      "title": "React 18 新特性详解",
      "url": "https://example.com/react-18-features",
      "snippet": "React 18 引入了并发渲染、自动批处理等新特性...",
      "source": "web",
      "publishDate": "2024-01-10T00:00:00Z",
      "relevanceScore": 0.95
    }
  ],
  "summary": {
    "totalResults": 8,
    "searchTime": 450,
    "sources": {
      "web": 6,
      "news": 2
    }
  }
}
```

### 内容分析

#### POST /modules/web-search/analyze-url

分析指定URL的内容

**请求体**:
```json
{
  "url": "https://example.com/article",
  "options": {
    "extractText": true,
    "extractImages": false,
    "extractLinks": true,
    "summarize": true
  }
}
```

**响应示例**:
```json
{
  "url": "https://example.com/article",
  "metadata": {
    "title": "文章标题",
    "description": "文章描述",
    "author": "作者名",
    "publishDate": "2024-01-10T00:00:00Z",
    "language": "zh-CN"
  },
  "content": {
    "text": "提取的文本内容...",
    "wordCount": 1250,
    "readingTime": "5 minutes"
  },
  "summary": "这篇文章主要讨论了...",
  "keyPoints": [
    "要点1",
    "要点2",
    "要点3"
  ],
  "links": [
    {
      "text": "相关链接",
      "url": "https://related.com"
    }
  ]
}
```

---

## 👁️ 实时预览模块

### 开发服务器管理

#### POST /modules/preview/start

启动开发服务器

**请求体**:
```json
{
  "projectPath": "/path/to/project",
  "serverType": "webpack-dev-server", // "webpack-dev-server" | "vite" | "next" | "custom"
  "port": 3000,
  "options": {
    "hot": true,
    "open": false,
    "https": false
  }
}
```

**响应示例**:
```json
{
  "serverId": "server_001",
  "status": "running",
  "url": "http://localhost:3000",
  "pid": 12345,
  "startTime": "2024-01-15T10:30:00Z",
  "logs": [
    "Server started on port 3000",
    "Webpack compiled successfully"
  ]
}
```

#### GET /modules/preview/status/{serverId}

获取服务器状态

**响应示例**:
```json
{
  "serverId": "server_001",
  "status": "running", // "starting" | "running" | "stopped" | "error"
  "uptime": 3600,
  "requests": 45,
  "lastActivity": "2024-01-15T11:30:00Z",
  "performance": {
    "avgResponseTime": 120,
    "memoryUsage": "45MB",
    "cpuUsage": "2.5%"
  }
}
```

#### POST /modules/preview/stop/{serverId}

停止开发服务器

### 实时同步

#### POST /modules/preview/sync

同步文件变更到预览

**请求体**:
```json
{
  "serverId": "server_001",
  "changes": [
    {
      "type": "file_changed",
      "path": "src/App.jsx",
      "content": "// 更新后的内容"
    }
  ],
  "options": {
    "hotReload": true,
    "preserveState": true
  }
}
```

---

## 🔧 错误处理

### 标准错误响应

所有API在发生错误时返回统一格式：

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "请求参数无效",
    "details": {
      "field": "path",
      "reason": "路径不存在"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_001"
  }
}
```

### 错误代码

| 代码 | 描述 | HTTP状态码 |
|------|------|-----------|
| `INVALID_REQUEST` | 请求参数无效 | 400 |
| `UNAUTHORIZED` | 未授权访问 | 401 |
| `FORBIDDEN` | 禁止访问 | 403 |
| `NOT_FOUND` | 资源不存在 | 404 |
| `MODULE_ERROR` | 模块执行错误 | 500 |
| `AI_SERVICE_ERROR` | AI服务错误 | 502 |
| `TIMEOUT` | 请求超时 | 504 |

---

## 📊 监控和日志

### 系统监控

#### GET /monitoring/metrics

获取系统性能指标

**响应示例**:
```json
{
  "system": {
    "uptime": 86400,
    "memoryUsage": {
      "used": "512MB",
      "total": "2GB",
      "percentage": 25
    },
    "cpuUsage": 15.5
  },
  "modules": {
    "codeAnalysis": {
      "requestCount": 150,
      "avgResponseTime": 250,
      "errorRate": 0.02
    }
  },
  "aiService": {
    "requestCount": 300,
    "avgResponseTime": 800,
    "tokensUsed": 45000
  }
}
```

### 日志管理

#### GET /monitoring/logs

获取系统日志

**查询参数**:
- `level`: 日志级别 (`debug`, `info`, `warn`, `error`)
- `module`: 模块过滤
- `startTime`: 开始时间
- `endTime`: 结束时间
- `limit`: 返回条数

---

## 🚀 WebSocket API

### 实时通信

智能体支持WebSocket连接以实现实时通信：

**连接地址**: `ws://localhost:3000/ws`

### 消息格式

```json
{
  "type": "message_type",
  "id": "unique_message_id",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    // 消息数据
  }
}
```

### 消息类型

- `agent_response`: 智能体响应
- `task_update`: 任务状态更新
- `file_change`: 文件变更通知
- `system_event`: 系统事件
- `error`: 错误通知

---

## 📚 SDK和客户端库

### JavaScript/TypeScript SDK

```typescript
import { MirrorCoreAgent } from '@mirrorcore/sdk';

const agent = new MirrorCoreAgent({
  baseUrl: 'http://localhost:3000/api',
  websocket: true
});

// 发送消息给智能体
const response = await agent.chat.sendMessage({
  message: "请帮我分析这个项目",
  context: { projectPath: "/path/to/project" }
});

// 执行代码分析
const analysis = await agent.codeAnalysis.analyze({
  target: { type: "project", path: "/path/to/project" },
  options: { depth: "deep" }
});
```

### Python SDK

```python
from mirrorcore_sdk import MirrorCoreAgent

agent = MirrorCoreAgent(base_url="http://localhost:3000/api")

# 发送消息
response = agent.chat.send_message(
    message="请帮我创建一个新组件",
    context={"project_path": "/path/to/project"}
)

# 执行命令
result = agent.command_execution.run(
    command="npm test",
    working_directory="/path/to/project"
)
```

---

## 🔒 安全考虑

### 功能测试阶段安全措施

1. **本地访问限制**: API仅监听本地地址
2. **文件系统保护**: 限制文件操作范围
3. **命令执行限制**: 禁止危险系统命令
4. **资源限制**: 限制内存和CPU使用
5. **日志脱敏**: 敏感信息不记录到日志

### 生产环境安全规划

- JWT认证和授权
- API速率限制
- 输入验证和清理
- HTTPS强制加密
- 审计日志记录

---

## 📄 许可证

本API文档遵循 Apache License 2.0 - 详见 [LICENSE](../LICENSE) 文件

---

<div align="center">

**🤖 MirrorCore AI智能体系统 API文档**

Made with ❤️ by MirrorCore AI Agent Team

</div>