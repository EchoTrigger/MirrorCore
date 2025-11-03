# 🤝 贡献指南

感谢您对MirrorCore项目的关注！我们欢迎所有形式的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发环境设置](#开发环境设置)
- [提交指南](#提交指南)
- [代码规范](#代码规范)
- [测试](#测试)
- [文档](#文档)

## 🤝 行为准则

参与此项目即表示您同意遵守我们的[行为准则](CODE_OF_CONDUCT.md)。

## 🚀 如何贡献

### 🐛 报告Bug

1. 检查[现有Issues](https://github.com/EchoTrigger/MirrorCore/issues)确保Bug未被报告
2. 使用Bug报告模板创建新Issue
3. 提供详细的重现步骤和环境信息

### ✨ 建议新功能

1. 检查[现有Issues](https://github.com/EchoTrigger/MirrorCore/issues)确保功能未被建议
2. 使用功能请求模板创建新Issue
3. 详细描述功能的用途和实现建议

### 🔧 代码贡献

1. Fork此仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 🛠️ 开发环境设置

### 前置要求

- Node.js 18.0+
- npm 9.0+
- Git

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/EchoTrigger/MirrorCore.git
cd MirrorCore

# 安装依赖
npm install
cd backend && npm install
cd ../desktop && npm install
cd ../shared && npm install

# 启动开发服务器
npm run dev
```

### 项目结构

```
MirrorCore/
├── backend/          # 后端服务
├── desktop/          # 桌面应用
├── shared/           # 共享类型和工具
├── docs/            # 文档
├── scripts/         # 构建脚本
└── .github/         # GitHub配置
```

## 📝 提交指南

### 提交消息格式

使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)格式：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 类型

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档变更
- `style`: 代码格式化
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统
- `ci`: CI配置
- `chore`: 其他变更

### 示例

```
feat(backend): 添加智能模块加载机制

实现了基于用户意图的动态模块加载功能，包括：
- 意图识别引擎
- 模块匹配算法
- 动态加载器

Closes #123
```

## 📏 代码规范

### TypeScript/JavaScript

- 使用ESLint和Prettier进行代码格式化
- 遵循Airbnb代码风格指南
- 使用TypeScript严格模式
- 函数和变量使用驼峰命名
- 常量使用大写下划线命名

### 文件命名

- 组件文件：`PascalCase.tsx`
- 工具文件：`camelCase.ts`
- 类型文件：`camelCase.types.ts`
- 测试文件：`*.test.ts` 或 `*.spec.ts`

### 代码注释

```typescript
/**
 * 智能模块加载器
 * @param intent 用户意图
 * @param context 上下文信息
 * @returns 匹配的模块列表
 */
export async function loadModules(
  intent: UserIntent,
  context: Context
): Promise<Module[]> {
  // 实现逻辑
}
```

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定模块测试
cd backend && npm test
cd desktop && npm test

# 运行测试覆盖率
npm run test:coverage
```

### 测试要求

- 新功能必须包含单元测试
- 测试覆盖率应保持在80%以上
- 使用Jest作为测试框架
- 使用描述性的测试名称

### 测试示例

```typescript
describe('ModuleLoader', () => {
  it('should load email module for email intent', async () => {
    const intent = { type: 'email', action: 'send' };
    const modules = await loadModules(intent, {});
    
    expect(modules).toHaveLength(1);
    expect(modules[0].name).toBe('EmailAssistant');
  });
});
```

## 📚 文档

### 文档类型

- **API文档**: 在`docs/API.md`中维护
- **开发文档**: 在`docs/DEVELOPMENT.md`中维护
- **用户指南**: 在`docs/GETTING_STARTED.md`中维护
- **代码注释**: 直接在代码中添加

### 文档要求

- 使用Markdown格式
- 包含代码示例
- 保持文档与代码同步
- 使用中文编写

## 🏷️ 版本发布

### 版本号规则

遵循[语义化版本](https://semver.org/lang/zh-CN/)：

- `MAJOR`: 不兼容的API变更
- `MINOR`: 向后兼容的功能性新增
- `PATCH`: 向后兼容的问题修正

### 发布流程

1. 更新版本号
2. 更新CHANGELOG.md
3. 创建Git标签
4. 推送到GitHub
5. 自动触发CI/CD发布

## 🎯 智能模块开发

### 模块结构

```typescript
export class CustomModule extends BaseModule {
  name = 'CustomModule';
  version = '1.0.0';
  
  async canHandle(intent: UserIntent): Promise<boolean> {
    // 判断是否能处理此意图
  }
  
  async execute(context: Context): Promise<ModuleResult> {
    // 执行模块逻辑
  }
}
```

### 模块发布

1. 在`modules/`目录下创建模块
2. 编写模块测试
3. 更新模块文档
4. 提交Pull Request
5. 通过审核后合并

## 🆘 获取帮助

- 📧 邮件: []
- 💬 讨论: [GitHub Discussions](https://github.com/EchoTrigger/MirrorCore/discussions)
- 🐛 问题: [GitHub Issues](https://github.com/EchoTrigger/MirrorCore/issues)

## 📄 许可证

通过贡献代码，您同意您的贡献将在与此项目相同的[Apache License 2.0](LICENSE)下获得许可。

---

再次感谢您的贡献！🎉