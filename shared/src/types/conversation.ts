/**
 * 对话相关类型定义
 */

// 消息角色类型
export type MessageRole = 'system' | 'user' | 'assistant';

// 消息接口
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  imageData?: string; // base64编码的图片数据
  metadata?: {
    model?: string;
    provider?: string;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
}

// 对话接口
export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  summary?: string; // 对话摘要，用于显示预览
  isPinned?: boolean; // 是否固定
}

// 对话列表项（用于显示近期对话列表）
export interface ConversationListItem {
  id: string;
  title: string;
  summary: string;
  lastMessage: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPinned?: boolean; // 是否固定
}

// 创建对话请求
export interface CreateConversationRequest {
  title?: string;
  initialMessage?: string;
}

// 发送消息请求
export interface SendMessageRequest {
  conversationId?: string; // 如果为空，创建新对话
  message: string;
  imageData?: string;
}

// 发送消息响应
export interface SendMessageResponse {
  conversationId: string;
  message: Message;
  response: Message;
}

// 对话历史响应
export interface ConversationHistoryResponse {
  conversations: ConversationListItem[];
  total: number;
}

// 更新对话请求
export interface UpdateConversationRequest {
  title?: string;
  isPinned?: boolean;
}

// 重命名对话请求
export interface RenameConversationRequest {
  title: string;
}

// 固定对话请求
export interface PinConversationRequest {
  isPinned: boolean;
}