// 客户端工具类，用于处理异步转换请求

export interface ConvertResponse {
  taskId: string;
  status: 'processing';
  message: string;
  statusUrl: string;
}

export interface TaskStatusResponse {
  taskId: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: number;
  result?: {
    success: boolean;
    audio: string;
    cover_url: string;
    debug_url: string;
    token: string;
  };
  error?: string;
  message?: string;
}

export class ConvertClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // 提交转换任务
  async submitConversion(articleUrl: string): Promise<ConvertResponse> {
    const response = await fetch(`${this.baseUrl}/api/convert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ articleUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '提交任务失败');
    }

    return response.json();
  }

  // 查询任务状态
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    const response = await fetch(`${this.baseUrl}/api/convert/status/${taskId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '查询任务状态失败');
    }

    return response.json();
  }

  // 轮询等待任务完成
  async waitForCompletion(
    taskId: string,
    options: {
      pollInterval?: number; // 轮询间隔（毫秒）
      maxWaitTime?: number;  // 最大等待时间（毫秒）
      onProgress?: (status: TaskStatusResponse) => void; // 进度回调
    } = {}
  ): Promise<TaskStatusResponse> {
    const {
      pollInterval = 2000,  // 默认2秒轮询一次
      maxWaitTime = 300000, // 默认最大等待5分钟
      onProgress
    } = options;

    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const status = await this.getTaskStatus(taskId);
        
        // 调用进度回调
        if (onProgress) {
          onProgress(status);
        }

        // 如果任务完成或失败，返回结果
        if (status.status === 'completed' || status.status === 'failed') {
          return status;
        }

        // 等待下次轮询
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('轮询任务状态时出错:', error);
        // 继续轮询，除非是致命错误
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error('任务等待超时');
  }

  // 一键转换（提交任务并等待完成）
  async convertArticle(
    articleUrl: string,
    options?: {
      pollInterval?: number;
      maxWaitTime?: number;
      onProgress?: (status: TaskStatusResponse) => void;
    }
  ): Promise<TaskStatusResponse> {
    // 提交任务
    const submitResponse = await this.submitConversion(articleUrl);
    
    // 等待完成
    return this.waitForCompletion(submitResponse.taskId, options);
  }
}

// 导出默认实例
export const convertClient = new ConvertClient(); 