import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// 提供跟踪脚本的API端点
export async function GET(request: NextRequest) {
  try {
    // 获取tracker.js文件的路径
    const trackerPath = path.join(process.cwd(), 'public', 'tracker.js');
    
    // 读取tracker.js文件内容
    const trackerContent = fs.readFileSync(trackerPath, 'utf-8');
    
    // 设置响应头
    const headers = {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600', // 缓存1小时
    };
    
    // 返回脚本内容
    return new NextResponse(trackerContent, { headers });
  } catch (error) {
    console.error('Error serving tracker script:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}