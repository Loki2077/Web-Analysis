import { NextResponse } from 'next/server';

const serverGoEasyAppkey = process.env.GOEASY_APPKEY as string;
const serverGoEasyChannel = process.env.GOEASY_CHANNEL as string;
// 从环境变量中读取 GoEasy REST API 的 URL
const serverGoEasyRestUrl = process.env.GOEASY_REST_URL as string; // 更改变量名以区分

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      // 如果消息体中没有 message 字段，返回 400 错误
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    /**
     * @method POST
     * @description 处理 POST 请求，代理发送消息到 GoEasy REST API。
     * 客户端只需提供消息内容，服务器负责添加 appkey 和 channel 并调用 GoEasy API。
     * @param {Request} request - 客户端发送的请求对象，包含消息内容。
     * @returns {Promise<NextResponse>} - 返回包含发送结果的 JSON 响应。
     */
    // 检查环境变量是否设置
    if (!serverGoEasyAppkey || !serverGoEasyChannel || !serverGoEasyRestUrl) {
        throw new Error('GoEasy environment variables (GOEASY_APPKEY, GOEASY_CHANNEL, GOEASY_REST_URL) are not set on the server.');
    }

    // 构建发送给 GoEasy REST API 的请求体
    const goEasyRequestBody = {
      appkey: serverGoEasyAppkey,
      channel: serverGoEasyChannel,
      content: message, // 使用客户端提供的 message 作为 content
    };

    // 调用 GoEasy REST API 发送消息
    // 使用从环境变量中读取的 REST API URL
    const goEasyApiUrl = `${serverGoEasyRestUrl}/v2/pubsub/publish`;

    const response = await fetch(goEasyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(goEasyRequestBody),
    });

    // 处理 GoEasy API 的响应
    if (response.ok) {
      const result = await response.json();
      // 消息成功发送后返回成功响应
      return NextResponse.json({ success: true, message: 'Message sent successfully.', goEasyResponse: result }, { status: response.status });
    } else {
      const errorResult = await response.json();
      // 如果 GoEasy API 返回错误，则返回相应的错误响应
      console.error('Error sending message via GoEasy REST API:', errorResult);
      return NextResponse.json({ error: 'Error sending message via GoEasy REST API', details: errorResult }, { status: response.status });
    }

  } catch (error: any) {
    // 捕获并处理发送消息过程中发生的错误
    console.error('Error sending message via WebSocket:', error);
    // 返回 500 错误响应，包含错误信息
    return NextResponse.json({ error: 'Error sending message via WebSocket', details: error.message }, { status: 500 });
  }
}

