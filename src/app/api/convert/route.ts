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

    // 调用Coze API
    const response = await fetch('https://api.coze.cn/v1/workflow/run', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer pat_zaJrXiwCgskgJIx3E9J9CMeynb8IwAAaMu8HrCFOB2JwZkdqdCsrYruhbrclyYdS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parameters: {
          article_url: articleUrl,
        },
        workflow_id: '7510132534971285530',
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