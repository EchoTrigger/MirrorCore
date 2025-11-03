import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';

// AI 提供商类型
export type AIProvider = 'openai' | 'claude' | 'qwen' | 'local';

// AI 消息接口
export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
}

// AI 响应接口
export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  reasoning_content?: string; // 思考过程
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

// 流式响应接口
export interface AIStreamResponse {
  content?: string;
  reasoning_content?: string;
  finished: boolean;
  provider: AIProvider;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

// AI 服务配置
interface AIConfig {
  provider: AIProvider;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

class AIService {
  private openaiClient?: OpenAI;
  private claudeClient?: Anthropic;
  private config: AIConfig;

  constructor() {
    const provider = (process.env.AI_PROVIDER as AIProvider) || 'local';
    
    // 根据提供商获取对应的配置
    let apiKey = process.env.AI_API_KEY; // 通用配置优先
    let baseURL = process.env.AI_BASE_URL;
    let model = process.env.AI_MODEL;

    // 如果没有通用配置，使用特定提供商的配置
    if (!apiKey) {
      switch (provider) {
        case 'openai':
          apiKey = process.env.OPENAI_API_KEY;
          baseURL = baseURL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
          model = model || process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
          break;
        case 'claude':
          apiKey = process.env.CLAUDE_API_KEY;
          model = model || process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
          break;
        case 'qwen':
          apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
          baseURL = baseURL || process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
          model = model || process.env.QWEN_MODEL || 'qwen-turbo';
          break;
      }
    }

    this.config = {
      provider,
      apiKey,
      baseURL,
      model
    };

    this.initializeClients();
  }

  private initializeClients() {
    // 初始化 OpenAI 客户端
    if (this.config.provider === 'openai' && this.config.apiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL
      });
    }

    // 初始化通义千问客户端（使用 OpenAI 兼容接口）
    if (this.config.provider === 'qwen' && this.config.apiKey) {
      this.openaiClient = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
      });
    }

    // 初始化 Claude 客户端
    if (this.config.provider === 'claude' && this.config.apiKey) {
      this.claudeClient = new Anthropic({
        apiKey: this.config.apiKey
      });
    }
  }

  // 生成 AI 响应
  async generateResponse(messages: AIMessage[], imageData?: string): Promise<AIResponse> {
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.generateOpenAIResponse(messages, imageData);
        case 'qwen':
          return await this.generateQwenResponse(messages, imageData);
        case 'claude':
          return await this.generateClaudeResponse(messages, imageData);
        case 'local':
        default:
          return this.generateLocalResponse(messages, imageData);
      }
    } catch (error) {
      console.error('AI 服务错误:', error);
      // 如果外部服务失败，回退到本地模拟响应
      return this.generateLocalResponse(messages, imageData);
    }
  }

  // 生成流式 AI 响应
  async* generateStreamResponse(messages: AIMessage[], imageData?: string, enableThinking: boolean = false): AsyncGenerator<AIStreamResponse> {
    try {
      switch (this.config.provider) {
        case 'qwen':
          yield* this.generateQwenStreamResponse(messages, imageData, enableThinking);
          break;
        case 'openai':
          yield* this.generateOpenAIStreamResponse(messages, imageData);
          break;
        default:
          // 对于不支持流式的提供商，返回单次响应
          const response = await this.generateResponse(messages, imageData);
          yield {
            content: response.content,
            reasoning_content: response.reasoning_content,
            finished: true,
            provider: response.provider,
            model: response.model,
            usage: response.usage
          };
      }
    } catch (error) {
      console.error('AI 流式服务错误:', error);
      // 错误时返回本地响应
      const response = this.generateLocalResponse(messages, imageData);
      yield {
        content: response.content,
        finished: true,
        provider: response.provider,
        model: response.model
      };
    }
  }

  // OpenAI 响应生成
  private async generateOpenAIResponse(messages: AIMessage[], imageData?: string): Promise<AIResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI 客户端未初始化');
    }

    const model = this.config.model || 'gpt-3.5-turbo';
    
    // 处理图片消息
    const formattedMessages = messages.map(msg => {
      if (msg.role === 'user' && imageData) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:image/jpeg;base64,${imageData}` 
              } 
            }
          ]
        };
      }
      return { 
        role: msg.role, 
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      };
    });

    const completion = await this.openaiClient.chat.completions.create({
      model: model,
      messages: formattedMessages as any,
      max_tokens: 2000,
      temperature: 0.7
    });

    return {
      content: completion.choices[0].message.content || '抱歉，我无法生成响应。',
      provider: 'openai',
      model: model,
      usage: completion.usage
    };
  }

  // 通义千问响应生成
  private async generateQwenResponse(messages: AIMessage[], imageData?: string): Promise<AIResponse> {
    if (!this.openaiClient) {
      throw new Error('通义千问客户端未初始化');
    }

    const model = this.config.model || 'qwen-turbo';
    
    // 处理图片消息和多模态内容
    const formattedMessages = this.formatMessagesForQwen(messages, imageData);

    const completion = await this.openaiClient.chat.completions.create({
      model: model,
      messages: formattedMessages as any,
      max_tokens: 2000,
      temperature: 0.7
    });

    return {
      content: completion.choices[0].message.content || '抱歉，我无法生成响应。',
      provider: 'qwen',
      model: model,
      usage: completion.usage
    };
  }

  // 通义千问流式响应生成
  private async* generateQwenStreamResponse(messages: AIMessage[], imageData?: string, enableThinking: boolean = false): AsyncGenerator<AIStreamResponse> {
    if (!this.openaiClient) {
      throw new Error('通义千问客户端未初始化');
    }

    const model = this.config.model || 'qwen-turbo';
    
    // 处理图片消息和多模态内容
    const formattedMessages = this.formatMessagesForQwen(messages, imageData);

    const stream = await this.openaiClient.chat.completions.create({
      model: model,
      messages: formattedMessages as any,
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
      // 通义千问特有的思考功能参数
      ...(enableThinking && model.includes('qwen3') && {
        enable_thinking: true,
        thinking_budget: 81920
      })
    });

    let reasoningContent = '';
    let answerContent = '';
    let isAnswering = false;

    for await (const chunk of stream) {
      if (!chunk.choices?.length) {
        // 处理使用统计信息
        if (chunk.usage) {
          yield {
            finished: true,
            provider: 'qwen',
            model: model,
            usage: chunk.usage
          };
        }
        continue;
      }

      const delta = chunk.choices[0].delta;

      // 处理思考过程
      if ((delta as any).reasoning_content) {
        reasoningContent += (delta as any).reasoning_content;
        yield {
          reasoning_content: (delta as any).reasoning_content,
          finished: false,
          provider: 'qwen',
          model: model
        };
      }
      // 处理正式回复
      else if (delta.content) {
        if (!isAnswering) {
          isAnswering = true;
        }
        answerContent += delta.content;
        yield {
          content: delta.content,
          finished: false,
          provider: 'qwen',
          model: model
        };
      }
    }

    // 发送完成信号
    yield {
      finished: true,
      provider: 'qwen',
      model: model
    };
  }

  // OpenAI 流式响应生成
  private async* generateOpenAIStreamResponse(messages: AIMessage[], imageData?: string): AsyncGenerator<AIStreamResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI 客户端未初始化');
    }

    const model = this.config.model || 'gpt-3.5-turbo';
    
    // 处理图片消息
    const formattedMessages = messages.map(msg => {
      if (msg.role === 'user' && imageData) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) },
            { 
              type: 'image_url', 
              image_url: { 
                url: `data:image/jpeg;base64,${imageData}` 
              } 
            }
          ]
        };
      }
      return { 
        role: msg.role, 
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      };
    });

    const stream = await this.openaiClient.chat.completions.create({
      model: model,
      messages: formattedMessages as any,
      stream: true,
      max_tokens: 2000,
      temperature: 0.7
    });

    for await (const chunk of stream) {
      if (!chunk.choices?.length) {
        if (chunk.usage) {
          yield {
            finished: true,
            provider: 'openai',
            model: model,
            usage: chunk.usage
          };
        }
        continue;
      }

      const delta = chunk.choices[0].delta;
      if (delta.content) {
        yield {
          content: delta.content,
          finished: false,
          provider: 'openai',
          model: model
        };
      }
    }

    yield {
      finished: true,
      provider: 'openai',
      model: model
    };
  }

  // 格式化消息为通义千问格式
  private formatMessagesForQwen(messages: AIMessage[], imageData?: string): any[] {
    return messages.map(msg => {
      // 如果消息已经是多模态格式，直接返回
      if (Array.isArray(msg.content)) {
        return { role: msg.role, content: msg.content };
      }

      // 如果是用户消息且有图片数据，转换为多模态格式
      if (msg.role === 'user' && imageData) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.content },
            { 
              type: 'image_url', 
              image_url: { 
                url: imageData.startsWith('data:') ? imageData : `data:image/jpeg;base64,${imageData}` 
              } 
            }
          ]
        };
      }

      // 普通文本消息
      return { role: msg.role, content: msg.content };
    });
  }

  // Claude 响应生成
  private async generateClaudeResponse(messages: AIMessage[], imageData?: string): Promise<AIResponse> {
    if (!this.claudeClient) {
      throw new Error('Claude 客户端未初始化');
    }

    const model = this.config.model || 'claude-3-sonnet-20240229';
    
    // 转换消息格式为 Claude 格式
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const response = await this.claudeClient.messages.create({
      model: model,
      max_tokens: 2000,
      system: typeof systemMessage === 'string' ? systemMessage : JSON.stringify(systemMessage),
      messages: userMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
      }))
    });

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '抱歉，我无法生成响应。',
      provider: 'claude',
      model: model,
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens
      }
    };
  }

  // 本地模拟响应生成
  private generateLocalResponse(messages: AIMessage[], imageData?: string): AIResponse {
    const userMessage = messages[messages.length - 1]?.content || '';
    const messageText = typeof userMessage === 'string' ? userMessage : JSON.stringify(userMessage);
    
    let response = '';

    if (imageData) {
      response = '我看到您发送了一张图片。由于当前使用的是本地模拟模式，我无法分析图片内容。请配置 AI 服务以获得图片分析功能。';
    } else if (messageText.includes('你好') || messageText.includes('hello')) {
      response = '您好！我是 MirrorCore 的智能助手。很高兴为您服务！';
    } else if (messageText.includes('天气')) {
      response = '抱歉，我无法获取实时天气信息。请配置 AI 服务以获得更多功能。';
    } else if (messageText.includes('时间') || messageText.includes('日期')) {
      response = `当前时间是：${new Date().toLocaleString('zh-CN')}`;
    } else {
      const responses = [
        '这是一个很有趣的问题！不过我需要更强大的 AI 服务来给您更好的回答。',
        '感谢您的提问！为了提供更准确和有用的回答，建议您配置 OpenAI、Claude 或通义千问等 AI 服务。',
        '我会尽力帮助您！不过作为本地模拟版本，我的能力有限。配置外部 AI 服务后，您将获得更好的对话体验。'
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
    }

    return {
      content: response,
      provider: 'local',
      model: 'local-simulation'
    };
  }

  // 获取配置信息
  getConfig(): AIConfig {
    return { ...this.config };
  }

  // 检查服务健康状态
  async checkHealth(): Promise<{ available: boolean; provider: AIProvider; error?: string }> {
    try {
      if (this.config.provider === 'local') {
        return { available: true, provider: 'local' };
      }

      if (!this.config.apiKey) {
        return { 
          available: false, 
          provider: this.config.provider, 
          error: 'API 密钥未配置' 
        };
      }

      // 这里可以添加实际的健康检查逻辑
      return { available: true, provider: this.config.provider };
    } catch (error) {
      return { 
        available: false, 
        provider: this.config.provider, 
        error: error instanceof Error ? error.message : '未知错误' 
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;