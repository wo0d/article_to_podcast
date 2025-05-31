import { NextRequest, NextResponse } from 'next/server';
import { taskStorage, generateTaskId } from '@/lib/task-storage';

// 配置为Edge Function
export const runtime = 'edge';

// 后台处理函数
async function processConversion(taskId: string, articleUrl: string) {
  try {
    // 从环境变量读取API配置
    const apiToken = process.env.COZE_API_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;

    if (!apiToken || !workflowId) {
      throw new Error('缺少必要的环境变量: COZE_API_TOKEN 或 COZE_WORKFLOW_ID');
    }

    // 调用Coze API
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters: {
          article_url: articleUrl,
        },
        workflow_id: workflowId,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 0) {
      throw new Error(data.msg || 'API返回错误');
    }

    // 解析返回的数据
    const resultData = JSON.parse(data.data);

    // 更新任务状态为完成
    await taskStorage.set(taskId, {
      status: 'completed',
      result: {
        success: true,
        audio: resultData.audio,
        cover_url: resultData.cover_url,
        debug_url: data.debug_url,
        token: data.token,
      },
      createdAt: Date.now(),
    });

  } catch (error) {
    console.error('转换失败:', error);
    // 更新任务状态为失败
    await taskStorage.set(taskId, {
      status: 'failed',
      error: error instanceof Error ? error.message : '转换失败，请稍后重试',
      createdAt: Date.now(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { articleUrl } = await request.json();

    if (!articleUrl) {
      return NextResponse.json(
        { error: '请提供文章URL' },
        { status: 400 }
      );
    }

    // 生成任务ID
    const taskId = generateTaskId();

    // 初始化任务状态
    await taskStorage.set(taskId, {
      status: 'processing',
      createdAt: Date.now(),
    });

    // 立即返回任务ID（在25秒内）
    const response = NextResponse.json({
      taskId,
      status: 'processing',
      message: '任务已接受，正在处理中...',
      // 提供查询状态的端点
      statusUrl: `/api/convert/status/${taskId}`,
    });

    // 在后台继续处理（使用Promise.resolve().then()来异步执行，避免阻塞响应）
    Promise.resolve().then(() => processConversion(taskId, articleUrl));

    return response;

  } catch (error) {
    console.error('请求处理失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '请求处理失败' },
      { status: 500 }
    );
  }
} 