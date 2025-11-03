/**
 * 智能主题生成服务
 * 基于对话内容自动生成简洁明了的主题标题
 */

export interface ThemeGenerationResult {
  title: string;
  category: string;
  tags: string[];
  confidence: number;
}

export class ThemeGenerator {
  private static readonly CATEGORIES = {
    '编程开发': ['代码', '编程', '开发', '调试', '函数', '类', '变量', 'bug', 'error', '错误'],
    '项目管理': ['项目', '任务', '计划', '进度', '需求', '功能', '版本', '发布'],
    '学习教育': ['学习', '教程', '文档', '解释', '原理', '概念', '知识', '理解'],
    '问题解决': ['问题', '解决', '修复', '优化', '改进', '建议', '方案'],
    '技术讨论': ['技术', '架构', '设计', '选型', '比较', '分析', '评估'],
    '工具使用': ['工具', '软件', '配置', '安装', '设置', '使用', '操作'],
    '其他': []
  };

  private static readonly COMMON_WORDS = new Set([
    '的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这', '那', '什么', '可以', '如何', '怎么', '为什么'
  ]);

  /**
   * 基于对话内容生成主题
   */
  static generateTheme(content: string): ThemeGenerationResult {
    // 清理和预处理内容
    const cleanContent = this.cleanContent(content);
    
    // 提取关键词
    const keywords = this.extractKeywords(cleanContent);
    
    // 生成标题
    const title = this.generateTitle(keywords, cleanContent);
    
    // 确定分类
    const category = this.categorizeContent(keywords, cleanContent);
    
    // 生成标签
    const tags = this.generateTags(keywords, category);
    
    // 计算置信度
    const confidence = this.calculateConfidence(keywords, title, category);
    
    return {
      title,
      category,
      tags,
      confidence
    };
  }

  /**
   * 清理内容，移除无用字符
   */
  private static cleanContent(content: string): string {
    return content
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ') // 保留中英文、数字和空格
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim()
      .toLowerCase();
  }

  /**
   * 提取关键词
   */
  private static extractKeywords(content: string): string[] {
    const words = content.split(/\s+/);
    const keywords: Map<string, number> = new Map();

    // 统计词频
    words.forEach(word => {
      if (word.length > 1 && !this.COMMON_WORDS.has(word)) {
        keywords.set(word, (keywords.get(word) || 0) + 1);
      }
    });

    // 按频率排序，取前10个
    return Array.from(keywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word);
  }

  /**
   * 生成标题
   */
  private static generateTitle(keywords: string[], content: string): string {
    // 如果内容很短，直接使用前几个词
    if (content.length < 20) {
      return content.slice(0, 15) + (content.length > 15 ? '...' : '');
    }

    // 尝试找到问句
    const questionMatch = content.match(/([^。！？]*[？?][^。！？]*)/);
    if (questionMatch) {
      let question = questionMatch[1].trim();
      if (question.length > 20) {
        question = question.slice(0, 20) + '...';
      }
      return question;
    }

    // 使用关键词组合生成标题
    if (keywords.length >= 2) {
      const topKeywords = keywords.slice(0, 3);
      let title = topKeywords.join(' ');
      
      // 添加动作词
      if (content.includes('如何') || content.includes('怎么')) {
        title = '如何 ' + title;
      } else if (content.includes('问题') || content.includes('错误')) {
        title = title + ' 问题';
      } else if (content.includes('实现') || content.includes('开发')) {
        title = '实现 ' + title;
      }
      
      return title.length > 25 ? title.slice(0, 25) + '...' : title;
    }

    // 兜底：使用内容的前20个字符
    return content.slice(0, 20) + (content.length > 20 ? '...' : '');
  }

  /**
   * 内容分类
   */
  private static categorizeContent(keywords: string[], content: string): string {
    const scores: Map<string, number> = new Map();

    // 初始化分数
    Object.keys(this.CATEGORIES).forEach(category => {
      scores.set(category, 0);
    });

    // 基于关键词匹配计算分数
    Object.entries(this.CATEGORIES).forEach(([category, categoryKeywords]) => {
      let score = 0;
      categoryKeywords.forEach(keyword => {
        if (keywords.includes(keyword) || content.includes(keyword)) {
          score += 2;
        }
      });
      
      // 模糊匹配
      keywords.forEach(keyword => {
        categoryKeywords.forEach(categoryKeyword => {
          if (keyword.includes(categoryKeyword) || categoryKeyword.includes(keyword)) {
            score += 1;
          }
        });
      });
      
      scores.set(category, score);
    });

    // 找到最高分的分类
    const maxScore = Math.max(...scores.values());
    if (maxScore > 0) {
      for (const [category, score] of scores.entries()) {
        if (score === maxScore) {
          return category;
        }
      }
    }

    return '其他';
  }

  /**
   * 生成标签
   */
  private static generateTags(keywords: string[], category: string): string[] {
    const tags = new Set<string>();
    
    // 添加分类作为标签
    tags.add(category);
    
    // 添加前3个关键词作为标签
    keywords.slice(0, 3).forEach(keyword => {
      if (keyword.length > 1) {
        tags.add(keyword);
      }
    });

    return Array.from(tags).slice(0, 5);
  }

  /**
   * 计算置信度
   */
  private static calculateConfidence(keywords: string[], title: string, category: string): number {
    let confidence = 0.5; // 基础置信度

    // 关键词质量
    if (keywords.length >= 3) confidence += 0.2;
    if (keywords.length >= 5) confidence += 0.1;

    // 标题质量
    if (title.length >= 5 && title.length <= 25) confidence += 0.1;
    if (!title.includes('...')) confidence += 0.1;

    // 分类置信度
    if (category !== '其他') confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * 批量生成主题
   */
  static batchGenerateThemes(contents: string[]): ThemeGenerationResult[] {
    return contents.map(content => this.generateTheme(content));
  }
}