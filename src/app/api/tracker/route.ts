/**
 * 外部跟踪API
 * 用于接收来自其他网站的跟踪数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { storePageView } from '@/utils/blobStorage';
import { PageView } from '@/types';

// 允许的来源域名列表（可以根据需要配置）
// 在生产环境中，应该限制为特定的域名
const ALLOWED_ORIGINS = ['*']; // '*' 表示允许所有域名，仅用于测试

/**
 * POST /api/tracker - 接收来自外部网站的跟踪数据
 */
export async function POST(request: NextRequest) {
  try {
    // 处理CORS
    const origin = request.headers.get('origin') || '';
    
    // 检查来源是否被允许
    // 注意：在生产环境中，应该进行更严格的检查
    const isAllowedOrigin = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
    
    // 如果来源不被允许，返回403错误
    if (!isAllowedOrigin) {
      return NextResponse.json(
        { success: false, error: '禁止访问' },
        { 
          status: 403,
          headers: {
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }
    
    // 解析请求体
    const body = await request.json();
    
    // 验证必要字段
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段: url' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }
    
    // 构建页面访问数据
    const pageView: PageView = {
      id: crypto.randomUUID(), // 生成唯一ID
      url: body.url,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent') || '',
      referrer: body.referrer,
      duration: body.duration,
      // 使用客户端提供的IP地址
      ipAddress: body.ipAddress || '未知IP'
    };
    
    // 存储页面访问数据
    const result = await storePageView(pageView);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': origin
          }
        }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: { id: pageView.id }
      },
      { 
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      }
    );
  } catch (error) {
    console.error('处理外部跟踪数据失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': request.headers.get('origin') || '*'
        }
      }
    );
  }
}

/**
 * OPTIONS /api/tracker - 处理预检请求
 */
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  
  // 检查来源是否被允许
  const isAllowedOrigin = ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin);
  
  if (!isAllowedOrigin) {
    return NextResponse.json(
      { success: false },
      { status: 403 }
    );
  }
  
  // 返回CORS头
  return NextResponse.json(
    { success: true },
    {
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400' // 24小时
      }
    }
  );
}