# 🚀 MirrorCore AI智能体系统 - 功能测试安装指南

欢迎使用 MirrorCore AI智能体系统！本指南将引导您完成智能体的本地功能测试环境搭建。

## 🎯 关于功能测试阶段

**当前状态**：MirrorCore正处于**功能测试阶段**
- 🧪 **测试目的**：验证AI智能体的各项核心能力
- 🏠 **本地运行**：在本地环境中测试智能体功能模块
- 🚀 **未来目标**：完成测试后将部署到云端服务器
- ⚠️ **重要提醒**：本地测试不是最终形态，而是开发验证过程

### 测试验证的智能体能力
- ✅ **代码分析与编辑**：智能代码理解、生成和重构
- ✅ **项目管理**：任务规划、进度跟踪、文档生成
- ✅ **文件系统操作**：智能文件管理和内容处理
- ✅ **命令执行**：自动化脚本运行和系统操作
- ✅ **浏览器控制**：网页自动化和数据提取
- ✅ **实时预览**：开发服务器管理和UI测试

---

## 📋 测试环境要求

### 必需软件
- **Node.js** >= 18.0.0 ([下载地址](https://nodejs.org/))
- **Git** ([下载地址](https://git-scm.com/))
- **现代浏览器** (Chrome, Firefox, Edge)

### 支持的操作系统
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+

### 硬件要求
- **内存**: 最少 4GB RAM（推荐 8GB+）
- **存储**: 至少 1GB 可用空间
- **网络**: 必需（智能体需要联网功能进行测试）

---

## 🤖 AI智能体服务配置

MirrorCore智能体支持多种AI服务提供商：

### 推荐配置（测试阶段）

#### 1. OpenAI 配置
```bash
AI_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4  # 推荐使用GPT-4获得最佳智能体性能
```

#### 2. Claude 配置
```bash
AI_PROVIDER=claude
CLAUDE_API_KEY=your_claude_api_key
CLAUDE_MODEL=claude-3-sonnet-20240229
```

#### 3. 自定义API配置
```bash
AI_PROVIDER=custom
AI_API_KEY=your_api_key
AI_BASE_URL=https://your-api-endpoint.com/v1
AI_MODEL=your_model_name
```

### 测试模式说明
- **完整功能测试**：需要配置AI API密钥
- **基础功能测试**：可使用模拟模式（功能受限）
- **网络功能测试**：需要稳定的网络连接

---

## 🛠️ 智能体测试环境搭建

### 方法一：快速搭建（推荐）

```bash
# 1. 克隆智能体项目
git clone https://github.com/your-username/MirrorCore.git
cd MirrorCore

# 2. 安装所有依赖
npm install
cd backend && npm install && cd ..
cd desktop && npm install && cd ..

# 3. 配置AI智能体服务
cd backend
cp .env.example .env
# 编辑.env文件，配置您的AI API密钥

# 4. 启动智能体测试环境
npm run dev:backend    # 终端1: 启动智能体核心引擎
npm run dev:desktop    # 终端2: 启动智能体前端界面
```

### 方法二：自动化脚本（Windows）

```powershell
# 1. 克隆项目
git clone https://github.com/your-username/MirrorCore.git
cd MirrorCore

# 2. 运行自动安装脚本
cd scripts
setup.bat

# 3. 启动智能体系统
start-all.bat
```

---

## ⚙️ 智能体功能测试配置

### 环境变量配置 (.env)

创建 `backend/.env` 文件并配置以下参数：

```bash
# === AI智能体核心配置 ===
AI_PROVIDER=openai                    # AI服务提供商
OPENAI_API_KEY=your_openai_api_key   # API密钥
AI_MODEL=gpt-4                       # 推荐模型

# === 智能体功能模块配置 ===
ENABLE_CODE_ANALYSIS=true           # 启用代码分析模块
ENABLE_PROJECT_MANAGEMENT=true      # 启用项目管理模块
ENABLE_FILE_OPERATIONS=true         # 启用文件操作模块
ENABLE_COMMAND_EXECUTION=true       # 启用命令执行模块
ENABLE_BROWSER_CONTROL=true         # 启用浏览器控制模块
ENABLE_WEB_SEARCH=true              # 启用网络搜索模块

# === 测试环境配置 ===
NODE_ENV=development                 # 开发测试模式
LOG_LEVEL=debug                     # 详细日志输出
ENABLE_CORS=true                    # 允许跨域请求
```

### 功能模块测试配置

#### 代码分析模块
```bash
# 支持的编程语言
SUPPORTED_LANGUAGES=javascript,typescript,python,java,cpp,go,rust
# 代码分析深度
CODE_ANALYSIS_DEPTH=deep
```

#### 项目管理模块
```bash
# 任务管理功能
ENABLE_TODO_MANAGEMENT=true
ENABLE_PROGRESS_TRACKING=true
ENABLE_DOCUMENTATION_GENERATION=true
```

#### 浏览器控制模块
```bash
# 浏览器自动化配置
BROWSER_TYPE=chromium
ENABLE_HEADLESS_MODE=false  # 测试时建议关闭无头模式
```

---

## 🧪 功能测试验证

### 启动智能体系统

1. **启动智能体核心引擎**
```bash
cd backend
npm run dev
```
预期输出：
```
🤖 MirrorCore AI Agent Engine Starting...
✅ AI Service Connected: OpenAI GPT-4
✅ Code Analysis Module Loaded
✅ Project Management Module Loaded
✅ File Operations Module Loaded
✅ Command Execution Module Loaded
✅ Browser Control Module Loaded
🚀 Agent Engine Running on http://localhost:3000
```

2. **启动智能体前端界面**
```bash
cd desktop
npm run dev
```
预期输出：
```
🖥️ MirrorCore Agent Interface Starting...
✅ Electron App Initialized
✅ Agent Communication Established
🎨 Agent Interface Ready
```

### 核心功能测试清单

#### ✅ 基础智能体功能
- [ ] 自然语言理解和响应
- [ ] 会话记忆和对话连续性
- [ ] 任务规划和分解能力

#### ✅ 代码智能功能
- [ ] 代码分析和理解
- [ ] 代码生成和重构
- [ ] 项目结构分析
- [ ] 文件编辑和管理

#### ✅ 自动化功能
- [ ] 命令执行和脚本运行
- [ ] 文件系统操作
- [ ] 开发服务器管理

#### ✅ 网络功能
- [ ] 实时信息搜索
- [ ] 网页内容分析
- [ ] 浏览器自动化控制

#### ✅ 项目管理功能
- [ ] 任务创建和跟踪
- [ ] 进度监控
- [ ] 文档自动生成

---

## 🔧 测试过程故障排除

### AI智能体服务相关

**问题**: 智能体无法启动或响应异常
**解决方案**: 
1. 检查 `.env` 文件中的AI API密钥配置
2. 访问 `http://localhost:3000/api/chat/ai-status` 检查服务状态
3. 确认网络连接正常，智能体需要联网功能

**问题**: 功能模块加载失败
**解决方案**: 
1. 检查环境变量中的模块启用配置
2. 查看控制台日志输出
3. 确认所有依赖已正确安装

### 智能体功能测试相关

**问题**: 代码分析功能异常
**解决方案**: 
1. 确认项目文件结构完整
2. 检查文件读取权限
3. 验证支持的编程语言配置

**问题**: 浏览器控制功能失效
**解决方案**: 
1. 确认浏览器驱动已安装
2. 检查浏览器版本兼容性
3. 验证网络连接状态

---

## 📊 测试数据和日志

### 测试日志位置
```
MirrorCore/
├── logs/
│   ├── agent-engine.log      # 智能体引擎日志
│   ├── code-analysis.log     # 代码分析模块日志
│   ├── project-mgmt.log      # 项目管理模块日志
│   ├── browser-control.log   # 浏览器控制模块日志
│   └── error.log            # 错误日志
```

### 测试数据收集
- **性能指标**：响应时间、内存使用、CPU占用
- **功能覆盖**：各模块功能测试完成度
- **错误统计**：异常类型和频率分析
- **用户体验**：界面响应性和操作流畅度

---

## 🚀 测试完成后的下一步

### 测试报告生成
完成功能测试后，系统将自动生成：
- 📊 **功能测试报告**：各模块测试结果汇总
- 📈 **性能分析报告**：系统性能指标分析
- 🐛 **问题清单**：发现的问题和改进建议
- 📋 **部署准备清单**：云端部署前的准备工作

### 云端部署准备
测试验证完成后，将进行：
1. **服务器环境配置**：云端运行环境搭建
2. **多用户支持**：用户管理和权限系统
3. **负载均衡**：高并发请求处理能力
4. **监控系统**：实时状态监控和告警

---

## 📚 测试阶段文档

- [智能体功能API文档](docs/API.md) - 各功能模块接口说明
- [开发测试指南](docs/DEVELOPMENT.md) - 智能体架构和测试规范
- [问题反馈指南](docs/TROUBLESHOOTING.md) - 常见问题和解决方案

---

## 🤝 测试反馈

### 反馈渠道
- **GitHub Issues**: 报告功能问题和改进建议
- **测试日志**: 自动收集的系统运行数据
- **用户体验**: 界面和交互优化建议

### 测试贡献
欢迎参与MirrorCore智能体系统的功能测试：

1. Fork测试项目
2. 创建测试分支 (`git checkout -b test/NewFeatureTest`)
3. 提交测试结果 (`git commit -m 'Add test results for new feature'`)
4. 推送测试分支 (`git push origin test/NewFeatureTest`)
5. 创建测试报告Pull Request

---

## 📄 许可证

Apache License 2.0 - 详见 [LICENSE](LICENSE) 文件

---

<div align="center">

**🧪 功能测试阶段 - 为云端部署做准备**

Made with ❤️ by MirrorCore AI Agent Team

</div>