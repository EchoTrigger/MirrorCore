/**
 * MirrorCore AI智能体系统 - 类型定义索引
 */

// 对话相关类型
export * from './conversation';

// 通用类型定义
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// 用户相关类型
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: Record<string, any>;
}

// 项目相关类型
export interface Project {
  id: string;
  name: string;
  description?: string;
  path: string;
  language: string;
  framework?: string;
  version?: string;
  createdAt: Date;
  updatedAt: Date;
  owner: string;
  collaborators?: string[];
  settings?: Record<string, any>;
}

// 文件相关类型
export interface FileInfo {
  path: string;
  name: string;
  extension: string;
  size: number;
  isDirectory: boolean;
  createdAt: Date;
  modifiedAt: Date;
  permissions?: string;
}

// 命令执行相关类型
export interface CommandResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  duration: number;
  command: string;
  workingDirectory: string;
  timestamp: Date;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  id?: string;
}

// 配置相关类型
export interface AppConfig {
  server: {
    port: number;
    host: string;
    cors: {
      origin: string[];
      credentials: boolean;
    };
  };
  database: {
    url: string;
    maxConnections: number;
    ssl: boolean;
  };
  ai: {
    provider: string;
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  storage: {
    provider: string;
    path: string;
    maxSize: number;
  };
  security: {
    jwtSecret: string;
    encryptionKey: string;
    sessionTimeout: number;
  };
}