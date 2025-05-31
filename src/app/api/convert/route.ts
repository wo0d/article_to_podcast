import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { articleUrl } = await request.json();

    if (!articleUrl) {
      return NextResponse.json(
        { error: '请提供文章URL' },
        { status: 400 }
      );
    }

    // 从环境变量读取API配置
    const apiToken = process.env.COZE_API_TOKEN;
    const workflowId = process.env.COZE_WORKFLOW_ID;

    if (!apiToken || !workflowId) {
      console.error('缺少必要的环境变量: COZE_API_TOKEN 或 COZE_WORKFLOW_ID');
      return NextResponse.json(
        { error: '服务配置错误，请联系管理员' },
        { status: 500 }
      );
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

    return NextResponse.json({
      success: true,
      audio: resultData.audio,
      cover_url: resultData.cover_url,
      debug_url: data.debug_url,
      token: data.token,
    });

  } catch (error) {
    console.error('转换失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '转换失败，请稍后重试' },
      { status: 500 }
    );
  }
} 