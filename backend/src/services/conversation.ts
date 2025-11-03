import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { 
  Conversation, 
  Message, 
  ConversationListItem, 
  MessageRole 
} from '../../../shared/src/types/conversation';

class ConversationService {
  private conversationsDir: string;
  private conversationsIndex: Map<string, ConversationListItem> = new Map();

  constructor() {
    // 使用用户数据目录存储对话
    this.conversationsDir = path.join(process.cwd(), 'data', 'conversations');
    this.initializeStorage();
  }

  private async initializeStorage(): Promise<void> {
    try {
      await fs.mkdir(this.conversationsDir, { recursive: true });
      await this.loadConversationsIndex();
    } catch (error) {
      console.error('Failed to initialize conversation storage:', error);
    }
  }

  private async loadConversationsIndex(): Promise<void> {
    try {
      const indexPath = path.join(this.conversationsDir, 'index.json');
      const indexData = await fs.readFile(indexPath, 'utf-8');
      const conversations: ConversationListItem[] = JSON.parse(indexData);
      
      this.conversationsIndex.clear();
      conversations.forEach(conv => {
        this.conversationsIndex.set(conv.id, conv);
      });
    } catch (error) {
      // 如果索引文件不存在，创建空索引
      console.log('Creating new conversations index');
    }
  }

  private async saveConversationsIndex(): Promise<void> {
    try {
      const indexPath = path.join(this.conversationsDir, 'index.json');
      const conversations = Array.from(this.conversationsIndex.values());
      await fs.writeFile(indexPath, JSON.stringify(conversations, null, 2));
    } catch (error) {
      console.error('Failed to save conversations index:', error);
    }
  }

  private generateTitle(message: string): string {
    // 生成对话标题，取前30个字符
    const title = message.trim().substring(0, 30);
    return title.length < message.trim().length ? title + '...' : title;
  }

  private generateSummary(messages: Message[]): string {
    // 生成对话摘要，取最后一条用户消息
    const lastUserMessage = messages
      .filter(m => m.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      const summary = lastUserMessage.content.trim().substring(0, 50);
      return summary.length < lastUserMessage.content.trim().length ? summary + '...' : summary;
    }
    
    return '新对话';
  }

  async createConversation(title?: string, initialMessage?: string): Promise<Conversation> {
    const conversationId = uuidv4();
    const now = new Date();
    
    const conversation: Conversation = {
      id: conversationId,
      title: title || (initialMessage ? this.generateTitle(initialMessage) : '新对话'),
      messages: [],
      createdAt: now,
      updatedAt: now
    };

    // 如果有初始消息，添加到对话中
    if (initialMessage) {
      const message: Message = {
        id: uuidv4(),
        role: 'user',
        content: initialMessage,
        timestamp: now
      };
      conversation.messages.push(message);
    }

    // 保存对话文件
    await this.saveConversation(conversation);

    // 更新索引
    const listItem: ConversationListItem = {
      id: conversation.id,
      title: conversation.title,
      summary: this.generateSummary(conversation.messages),
      lastMessage: initialMessage || '',
      messageCount: conversation.messages.length,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt
    };

    this.conversationsIndex.set(conversationId, listItem);
    await this.saveConversationsIndex();

    return conversation;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      const conversationPath = path.join(this.conversationsDir, `${conversationId}.json`);
      const conversationData = await fs.readFile(conversationPath, 'utf-8');
      const conversation: Conversation = JSON.parse(conversationData);
      
      // 确保日期对象正确解析
      conversation.createdAt = new Date(conversation.createdAt);
      conversation.updatedAt = new Date(conversation.updatedAt);
      conversation.messages.forEach(msg => {
        msg.timestamp = new Date(msg.timestamp);
      });
      
      return conversation;
    } catch (error) {
      console.error(`Failed to load conversation ${conversationId}:`, error);
      return null;
    }
  }

  async addMessage(conversationId: string, message: Message): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    await this.saveConversation(conversation);

    // 更新索引
    const listItem = this.conversationsIndex.get(conversationId);
    if (listItem) {
      listItem.summary = this.generateSummary(conversation.messages);
      listItem.lastMessage = message.content;
      listItem.messageCount = conversation.messages.length;
      listItem.updatedAt = conversation.updatedAt;
      
      await this.saveConversationsIndex();
    }
  }

  async getConversationsList(limit: number = 20, offset: number = 0): Promise<{
    conversations: ConversationListItem[];
    total: number;
  }> {
    const allConversations = Array.from(this.conversationsIndex.values())
      .sort((a, b) => {
        // 固定的对话排在前面
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // 相同固定状态按更新时间排序
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

    const conversations = allConversations.slice(offset, offset + limit);
    
    return {
      conversations,
      total: allConversations.length
    };
  }

  async updateConversation(conversationId: string, updates: { title?: string; isPinned?: boolean }): Promise<Conversation | null> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) {
        return null;
      }

      // 更新对话
      if (updates.title !== undefined) {
        conversation.title = updates.title;
      }
      if (updates.isPinned !== undefined) {
        conversation.isPinned = updates.isPinned;
      }
      conversation.updatedAt = new Date();

      // 保存对话
      await this.saveConversation(conversation);

      // 更新索引
      const listItem = this.conversationsIndex.get(conversationId);
      if (listItem) {
        if (updates.title !== undefined) {
          listItem.title = updates.title;
        }
        if (updates.isPinned !== undefined) {
          listItem.isPinned = updates.isPinned;
        }
        listItem.updatedAt = conversation.updatedAt;
        
        await this.saveConversationsIndex();
      }

      return conversation;
    } catch (error) {
      console.error(`Failed to update conversation ${conversationId}:`, error);
      return null;
    }
  }

  async renameConversation(conversationId: string, title: string): Promise<boolean> {
    const result = await this.updateConversation(conversationId, { title });
    return result !== null;
  }

  async pinConversation(conversationId: string, isPinned: boolean): Promise<boolean> {
    const result = await this.updateConversation(conversationId, { isPinned });
    return result !== null;
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      // 删除对话文件
      const conversationPath = path.join(this.conversationsDir, `${conversationId}.json`);
      await fs.unlink(conversationPath);

      // 从索引中移除
      this.conversationsIndex.delete(conversationId);
      await this.saveConversationsIndex();

      return true;
    } catch (error) {
      console.error(`Failed to delete conversation ${conversationId}:`, error);
      return false;
    }
  }

  private async saveConversation(conversation: Conversation): Promise<void> {
    try {
      const conversationPath = path.join(this.conversationsDir, `${conversation.id}.json`);
      await fs.writeFile(conversationPath, JSON.stringify(conversation, null, 2));
    } catch (error) {
      console.error(`Failed to save conversation ${conversation.id}:`, error);
      throw error;
    }
  }
}

// 单例实例
export const conversationService = new ConversationService();
export default conversationService;