import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import chatRoutes from './routes/chat';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 支持图片上传
app.use(express.urlencoded({ extended: true }));

// 路由
app.use('/api/chat', chatRoutes);

// 提供前端页面预览（用于开发联调）
app.use('/preview', express.static(path.resolve(__dirname, '../../desktop/renderer')));

app.get('/', (req, res) => {
  res.send('MirrorCore Backend Server is running!');
});

// WebSocket处理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // 处理流式聊天请求
  socket.on('stream_chat', async (data) => {
    try {
      const { conversationId, message, imageData, enableThinking = false, options } = data;
      
      // 导入必要的模块
      const { v4: uuidv4 } = require('uuid');
      const aiService = require('./services/ai').default;
      const conversationService = require('./services/conversation').default;
      
      let currentConversationId = conversationId;
      let conversation;

      // 如果没有提供对话ID，创建新对话
      if (!currentConversationId) {
        conversation = await conversationService.createConversation(undefined, message);
        currentConversationId = conversation.id;
        socket.emit('conversation_created', { conversationId: currentConversationId });
      } else {
        conversation = await conversationService.getConversation(currentConversationId);
        if (!conversation) {
          socket.emit('error', { message: '对话不存在' });
          return;
        }
      }

      // 创建用户消息
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        imageData
      };

      // 如果对话已存在且不是新创建的，添加用户消息
      if (conversationId) {
        await conversationService.addMessage(currentConversationId, userMessage);
      }

      // 发送用户消息确认
      socket.emit('message_received', { 
        conversationId: currentConversationId,
        message: userMessage 
      });

      // 构建AI消息历史
      // 构建系统提示，支持自定义智能体名称与性格提示词
      const assistantDisplayName = (options && typeof options.agentName === 'string' && options.agentName.trim().length > 0)
        ? options.agentName.trim()
        : 'MirrorCore 智能助手';
      const personalityPrompt = (options && typeof options.personalityPrompt === 'string' && options.personalityPrompt.trim().length > 0)
        ? options.personalityPrompt.trim()
        : '';

      const systemPromptParts = [
        `你的名字是「${assistantDisplayName}」。你是一个智能助手。请友好、专业地回答用户的问题，并根据对话历史提供连贯的回复。`,
        `请在对话中使用该名字进行自我介绍和自称，不要使用其他名称（例如“MirrorCore 智能助手”）。`,
        personalityPrompt ? `性格/风格设定：${personalityPrompt}` : ''
      ].filter(Boolean);

      const systemPrompt = systemPromptParts.join('\n');

      const aiMessages = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // 添加历史消息（限制最近的10条消息以控制上下文长度）
      const recentMessages = conversation.messages.concat(userMessage).slice(-10).map((msg: any) => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content
      }));

      aiMessages.push(...recentMessages);

      // 生成流式AI响应
      let fullContent = '';
      let fullReasoningContent = '';
      const aiMessageId = uuidv4();

      // 发送开始流式响应的信号
      socket.emit('stream_start', { 
        conversationId: currentConversationId,
        messageId: aiMessageId 
      });

      try {
        const aiOptions = {
          ...(options || {}),
          enableThinking: (options && typeof options.enableThinking === 'boolean') ? options.enableThinking : enableThinking
        };
        for await (const chunk of aiService.generateStreamResponse(aiMessages, imageData, aiOptions)) {
          if (chunk.content) {
            fullContent += chunk.content;
            socket.emit('stream_content', {
              conversationId: currentConversationId,
              messageId: aiMessageId,
              content: chunk.content,
              type: 'answer'
            });
          }

          if (chunk.reasoning_content) {
            fullReasoningContent += chunk.reasoning_content;
            socket.emit('stream_content', {
              conversationId: currentConversationId,
              messageId: aiMessageId,
              content: chunk.reasoning_content,
              type: 'reasoning'
            });
          }

          if (chunk.finished) {
            // 创建完整的AI回复消息
            const aiMessage = {
              id: aiMessageId,
              role: 'assistant',
              content: fullContent,
              timestamp: new Date(),
              reasoning_content: fullReasoningContent || undefined
            };

            // 保存AI回复到对话
            await conversationService.addMessage(currentConversationId, aiMessage);

            // 发送流式响应结束信号
            socket.emit('stream_end', {
              conversationId: currentConversationId,
              messageId: aiMessageId,
              message: aiMessage,
              usage: chunk.usage
            });
            break;
          }
        }
      } catch (streamError) {
        console.error('流式响应错误:', streamError);
        
        // 如果流式响应失败，发送错误消息
        const errorMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: '抱歉，AI 服务暂时不可用。请检查您的 AI 服务配置，或稍后再试。',
          timestamp: new Date()
        };

        await conversationService.addMessage(currentConversationId, errorMessage);
        
        socket.emit('stream_end', {
          conversationId: currentConversationId,
          messageId: aiMessageId,
          message: errorMessage,
          error: true
        });
      }

    } catch (error) {
      console.error('WebSocket 聊天错误:', error);
      socket.emit('error', { 
        message: '处理消息时发生错误',
        details: error instanceof Error ? error.message : '未知错误'
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

server.listen(port, () => {
  console.log(`MirrorCore Backend server is listening on port ${port}`);
});