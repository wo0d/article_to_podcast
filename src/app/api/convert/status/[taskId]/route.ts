import { NextRequest, NextResponse } from 'next/server';
import { taskStorage } from '@/lib/task-storage';

// 配置为Edge Function
export const runtime = 'edge';

interface TaskStatusResponse {
  taskId: string;
  status: string;
  createdAt: number;
  result?: {
    success: boolean;
    audio: string;
    cover_url: string;
    debug_url: string;
    token: number;
  };
  error?: string;
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少任务ID' },
        { status: 400 }
      );
    }

    const task = await taskStorage.get(taskId);

    if (!task) {
      return NextResponse.json(
        { error: '任务不存在或已过期' },
        { status: 404 }
      );
    }

    // 检查任务是否过期（24小时）
    const isExpired = Date.now() - task.createdAt > 24 * 60 * 60 * 1000;
    if (isExpired) {
      await taskStorage.delete(taskId);
      return NextResponse.json(
        { error: '任务已过期' },
        { status: 410 }
      );
    }

    // 返回任务状态
    const response: TaskStatusResponse = {
      taskId,
      status: task.status,
      createdAt: task.createdAt,
    };

    if (task.status === 'completed' && task.result) {
      response.result = task.result;
      // 任务完成后可以选择删除存储的数据
      // await taskStorage.delete(taskId);
    } else if (task.status === 'failed' && task.error) {
      response.error = task.error;
      // 失败的任务也可以删除
      // await taskStorage.delete(taskId);
    } else if (task.status === 'processing') {
      response.message = '任务正在处理中，请稍后再试...';
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('查询任务状态失败:', error);
    return NextResponse.json(
      { error: '查询失败，请稍后重试' },
      { status: 500 }
    );
  }
} 