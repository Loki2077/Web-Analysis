import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 处理前端SDK发送的访问数据
 * POST /api/track
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体中的数据
    const data = await request.json();
    
    // 获取客户端IP地址
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              'unknown';
    
    // 添加IP地址到数据中
    const analyticsData = {
      ...data,
      ip,
      timestamp: new Date().toISOString()
    };
    
    // 创建文件名，格式：年-月-日/时-分-秒-毫秒.json
    const date = new Date();
    const dateFolder = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const timeString = `${String(date.getHours()).padStart(2, '0')}-${String(date.getMinutes()).padStart(2, '0')}-${String(date.getSeconds()).padStart(2, '0')}-${date.getMilliseconds()}`;
    const fileName = `analytics/${dateFolder}/${timeString}.json`;
    
    // 将数据存储到Vercel Blob Storage
    const blob = await put(fileName, JSON.stringify(analyticsData), {
      contentType: 'application/json',
    });
    
    return NextResponse.json({ success: true, url: blob.url }, { status: 200 });
  } catch (error) {
    console.error('Error storing analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics data' },
      { status: 500 }
    );
  }
}