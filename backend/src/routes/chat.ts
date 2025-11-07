import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import aiService, { AIMessage } from '../services/ai';
import conversationService from '../services/conversation';
import { 
  Message, 
  SendMessageRequest, 
  SendMessageResponse,
  ConversationHistoryResponse 
} from '../../../shared/src/types/conversation';

const router = express.Router();

// 流式聊天消息
router.post('/stream', async (req, res) => {
  try {
    const { conversationId, message, imageData, enableThinking = false, model, temperature, maxTokens, agentName } = req.body;
    
    if (!message && !imageData) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    let currentConversationId = conversationId;
    let conversation;

    // 如果没有提供对话ID，创建新对话
    if (!currentConversationId) {
      conversation = await conversationService.createConversation(undefined, message);
      currentConversationId = conversation.id;
    } else {
      conversation = await conversationService.getConversation(currentConversationId);
      if (!conversation) {
        return res.status(404).json({ error: '对话不存在' });
      }
    }

    // 创建用户消息
    const userMessage: Message = {
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

    // 设置SSE响应头
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // 发送初始事件
    res.write(`data: ${JSON.stringify({
      type: 'start',
      conversationId: currentConversationId,
      userMessage: userMessage
    })}\n\n`);

    try {
      // 构建AI消息历史
      // 构建系统提示，支持自定义智能体名称
      const assistantDisplayName = (typeof agentName === 'string' && agentName.trim().length > 0)
        ? agentName.trim()
        : 'MirrorCore 智能助手';

      const systemPrompt = `你的名字是「${assistantDisplayName}」。你是一个本地化的 AI 助手应用。请友好、专业地回答用户的问题，并根据对话历史提供连贯的回复。请在对话中使用该名字进行自我介绍和自称，不要使用其他名称（例如“MirrorCore 智能助手”）。`;

      const aiMessages: AIMessage[] = [
        {
          role: 'system',
          content: systemPrompt
        }
      ];

      // 添加历史消息（限制最近的10条消息以控制上下文长度）
      const recentMessages = conversation.messages.concat(userMessage).slice(-10).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      aiMessages.push(...recentMessages);

      // 生成流式AI响应
      let fullContent = '';
      let fullReasoningContent = '';
      const aiMessageId = uuidv4();

      const options = {
        model,
        temperature: typeof temperature === 'number' ? temperature : undefined,
        maxTokens: typeof maxTokens === 'number' ? maxTokens : undefined,
        enableThinking
      };
      for await (const chunk of aiService.generateStreamResponse(aiMessages, imageData, options)) {
        if (chunk.content) {
          fullContent += chunk.content;
          res.write(`data: ${JSON.stringify({
            type: 'content',
            messageId: aiMessageId,
            content: chunk.content,
            contentType: 'answer'
          })}\n\n`);
        }

        if (chunk.reasoning_content) {
          fullReasoningContent += chunk.reasoning_content;
          res.write(`data: ${JSON.stringify({
            type: 'content',
            messageId: aiMessageId,
            content: chunk.reasoning_content,
            contentType: 'reasoning'
          })}\n\n`);
        }

        if (chunk.finished) {
          // 创建完整的AI回复消息
          const aiMessage: Message = {
            id: aiMessageId,
            role: 'assistant',
            content: fullContent,
            timestamp: new Date()
          };

          // 保存AI回复到对话
          await conversationService.addMessage(currentConversationId, aiMessage);

          // 发送完成事件
          res.write(`data: ${JSON.stringify({
            type: 'end',
            messageId: aiMessageId,
            message: aiMessage,
            reasoningContent: fullReasoningContent || undefined,
            usage: chunk.usage
          })}\n\n`);
          break;
        }
      }
    } catch (streamError) {
      console.error('流式响应错误:', streamError);
      
      // 发送错误事件
      res.write(`data: ${JSON.stringify({
        type: 'error',
        error: '生成响应时发生错误',
        details: streamError instanceof Error ? streamError.message : '未知错误'
      })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error('Stream chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '处理流式消息时发生错误' });
    }
  }
});

// 发送聊天消息
router.post('/message', async (req, res) => {
  try {
    const { conversationId, message, imageData, model, temperature, maxTokens, agentName }: SendMessageRequest & { model?: string; temperature?: number; maxTokens?: number; agentName?: string } = req.body as any;
    
    if (!message && !imageData) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    let currentConversationId = conversationId;
    let conversation;

    // 如果没有提供对话ID，创建新对话
    if (!currentConversationId) {
      conversation = await conversationService.createConversation(undefined, message);
      currentConversationId = conversation.id;
    } else {
      conversation = await conversationService.getConversation(currentConversationId);
      if (!conversation) {
        return res.status(404).json({ error: '对话不存在' });
      }
    }

    // 创建用户消息
    const userMessage: Message = {
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

    // 生成AI回复
    const aiResponseContent = await generateAIResponse(
      conversation.messages.concat(userMessage), 
      imageData,
      {
        model,
        temperature: typeof temperature === 'number' ? temperature : undefined,
        maxTokens: typeof maxTokens === 'number' ? maxTokens : undefined
      },
      agentName
    );
    
    // 创建AI回复消息
    const aiMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponseContent,
      timestamp: new Date()
    };

    // 添加AI回复到对话
    await conversationService.addMessage(currentConversationId, aiMessage);

    const response: SendMessageResponse = {
      conversationId: currentConversationId,
      message: userMessage,
      response: aiMessage
    };
    
    res.json(response);
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: '处理消息时发生错误' });
  }
});

// 获取对话历史列表
router.get('/conversations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const result = await conversationService.getConversationsList(limit, offset);
    
    const response: ConversationHistoryResponse = {
      conversations: result.conversations,
      total: result.total
    };
    
    res.json(response);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: '获取对话历史失败' });
  }
});

// 获取特定对话的详细信息
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = await conversationService.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ error: '对话不存在' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: '获取对话详情失败' });
  }
});

// 删除对话
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const success = await conversationService.deleteConversation(conversationId);
    
    if (!success) {
      return res.status(404).json({ error: '对话不存在或删除失败' });
    }
    
    res.json({ success: true, message: '对话已删除' });
  } catch (error) {
    console.error('Delete conversation error:', error);
    res.status(500).json({ error: '删除对话失败' });
  }
});

// 更新对话（重命名、固定等）
router.patch('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const updates = req.body;
    
    const conversation = await conversationService.updateConversation(conversationId, updates);
    
    if (!conversation) {
      return res.status(404).json({ error: '对话不存在或更新失败' });
    }
    
    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Update conversation error:', error);
    res.status(500).json({ error: '更新对话失败' });
  }
});

// 重命名对话
router.patch('/conversations/:conversationId/rename', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { title } = req.body;
    
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: '标题不能为空' });
    }
    
    const success = await conversationService.renameConversation(conversationId, title);
    
    if (!success) {
      return res.status(404).json({ error: '对话不存在或重命名失败' });
    }
    
    res.json({ success: true, message: '对话已重命名' });
  } catch (error) {
    console.error('Rename conversation error:', error);
    res.status(500).json({ error: '重命名对话失败' });
  }
});

// 固定/取消固定对话
router.patch('/conversations/:conversationId/pin', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isPinned } = req.body;
    
    if (typeof isPinned !== 'boolean') {
      return res.status(400).json({ error: '固定状态必须为布尔值' });
    }
    
    const success = await conversationService.pinConversation(conversationId, isPinned);
    
    if (!success) {
      return res.status(404).json({ error: '对话不存在或操作失败' });
    }
    
    const message = isPinned ? '对话已固定' : '对话已取消固定';
    res.json({ success: true, message });
  } catch (error) {
    console.error('Pin conversation error:', error);
    res.status(500).json({ error: '固定操作失败' });
  }
});

// 获取聊天历史（保持向后兼容）
router.get('/history', async (req, res) => {
  try {
    const result = await conversationService.getConversationsList(10, 0);
    res.json({ 
      conversations: result.conversations,
      total: result.total
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.json({ 
      conversations: [],
      total: 0,
      message: '获取聊天历史失败'
    });
  }
});

// 获取 AI 服务状态
router.get('/ai-status', async (req, res) => {
  try {
    const health = await aiService.checkHealth();
    const config = aiService.getConfig();
    
    res.json({
      status: health.available ? 'available' : 'unavailable',
      provider: health.provider,
      model: config.model,
      hasApiKey: !!config.apiKey,
      error: health.error
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: '无法检查 AI 服务状态'
    });
  }
});

// 获取扩展列表 - 返回空列表，因为扩展功能未实现
router.get('/extensions', async (req, res) => {
  res.json({ extensions: [] });
});

// 切换扩展状态 - 暂不支持
router.post('/extensions/:extensionName', async (req, res) => {
  res.status(501).json({ 
    message: '扩展功能暂未实现'
  });
});

// 生成AI回复
async function generateAIResponse(
  messages: Message[], 
  imageData?: string,
  options?: { model?: string; temperature?: number; maxTokens?: number },
  agentName?: string
): Promise<string> {
  try {
    // 构建消息历史，包含系统提示
    const assistantDisplayName = (typeof agentName === 'string' && agentName.trim().length > 0)
      ? agentName.trim()
      : 'MirrorCore 智能助手';

    const systemPrompt = `你的名字是「${assistantDisplayName}」。你是一个本地化的 AI 助手应用。请友好、专业地回答用户的问题，并根据对话历史提供连贯的回复。请在对话中使用该名字进行自我介绍和自称，不要使用其他名称（例如“MirrorCore 智能助手”）。`;

    const aiMessages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // 添加历史消息（限制最近的10条消息以控制上下文长度）
    const recentMessages = messages.slice(-10).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));

    aiMessages.push(...recentMessages);

    // 使用 AI 服务生成响应
    const aiResponse = await aiService.generateResponse(aiMessages, imageData, options);
    return aiResponse.content;
  } catch (error) {
    console.error('AI 服务错误:', error);
    
    // 如果 AI 服务失败，返回友好的错误信息
    return '抱歉，AI 服务暂时不可用。请检查您的 AI 服务配置，或稍后再试。如需帮助，请查看文档了解如何配置 AI 服务。';
  }
}

export default router;