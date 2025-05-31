import { createClient } from '@supabase/supabase-js';

// 任务状态类型
export type TaskStatus = 'processing' | 'completed' | 'failed';

// 任务数据接口
export interface TaskData {
  status: TaskStatus;
  createdAt: number;
  result?: {
    success: boolean;
    audio: string;
    cover_url: string;
    debug_url: string;
    token: number;
  };
  error?: string;
}

// 数据库表结构
interface TaskRecord {
  id: string;
  status: TaskStatus;
  created_at: string;
  result: TaskData['result'] | null;
  error: string | null;
}

// Supabase 存储实现
class SupabaseTaskStorage {
  private tableName = 'tasks';

  private getSupabaseClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('缺少 Supabase 环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
    }

    return createClient(supabaseUrl, supabaseKey);
  }

  async set(taskId: string, data: TaskData): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase
        .from(this.tableName)
        .upsert({
          id: taskId,
          status: data.status,
          created_at: new Date(data.createdAt).toISOString(),
          result: data.result || null,
          error: data.error || null,
        });

      if (error) {
        console.error('保存任务失败:', error);
        throw new Error(`保存任务失败: ${error.message}`);
      }
    } catch (err) {
      console.error('保存任务异常:', err);
      throw err;
    }
  }

  async get(taskId: string): Promise<TaskData | undefined> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 记录不存在
          return undefined;
        }
        console.error('查询任务失败:', error);
        throw new Error(`查询任务失败: ${error.message}`);
      }

      if (!data) {
        return undefined;
      }

      const record = data as TaskRecord;
      return {
        status: record.status,
        createdAt: new Date(record.created_at).getTime(),
        result: record.result || undefined,
        error: record.error || undefined,
      };
    } catch (err) {
      console.error('查询任务异常:', err);
      throw err;
    }
  }

  async delete(taskId: string): Promise<boolean> {
    try {
      const supabase = this.getSupabaseClient();
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('删除任务失败:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('删除任务异常:', err);
      return false;
    }
  }

  // 清理过期任务（24小时）
  async cleanup(): Promise<void> {
    try {
      const supabase = this.getSupabaseClient();
      const expireTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .lt('created_at', expireTime);

      if (error) {
        console.error('清理过期任务失败:', error);
      } else {
        console.log('清理过期任务完成');
      }
    } catch (err) {
      console.error('清理过期任务异常:', err);
    }
  }

  // 获取所有任务（调试用）
  async getAll(): Promise<Map<string, TaskData>> {
    try {
      const supabase = this.getSupabaseClient();
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取所有任务失败:', error);
        return new Map();
      }

      const taskMap = new Map<string, TaskData>();
      
      if (data) {
        data.forEach((record: TaskRecord) => {
          taskMap.set(record.id, {
            status: record.status,
            createdAt: new Date(record.created_at).getTime(),
            result: record.result || undefined,
            error: record.error || undefined,
          });
        });
      }

      return taskMap;
    } catch (err) {
      console.error('获取所有任务异常:', err);
      return new Map();
    }
  }

  // 获取任务数量
  async size(): Promise<number> {
    try {
      const supabase = this.getSupabaseClient();
      const { count, error } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('获取任务数量失败:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('获取任务数量异常:', err);
      return 0;
    }
  }
}

// 生成唯一任务ID
export function generateTaskId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `task_${timestamp}_${randomStr}`;
}

// 导出单例实例
export const taskStorage = new SupabaseTaskStorage();

// 定期清理过期任务（每小时执行一次）
// 注意：在 Edge Functions 中，这个定时器可能不会持续运行
// 建议使用 Supabase 的 pg_cron 扩展或外部定时任务来清理过期数据
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    taskStorage.cleanup().catch(console.error);
  }, 60 * 60 * 1000); // 1小时
} 