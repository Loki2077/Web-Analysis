/**
 * 页面访问记录API
 * 用于记录和获取页面访问数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { storePageView, getAllPageViews, deletePageView } from '@/utils/blobStorage';
import { PageView } from '@/types';

/**
 * POST /api/pageview - 记录新的页面访问
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    
    // 验证必要字段
    if (!body.url) {
      return NextResponse.json(
        { success: false, error: '缺少必要字段: url' },
        { status: 400 }
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
      // 注意：在实际生产环境中，应该从请求头中获取IP地址
      // 这里为了简单，如果提供了IP则使用，否则使用一个占位符
      ipAddress: body.ipAddress || '127.0.0.1'
    };
    
    // 存储页面访问数据
    const result = await storePageView(pageView);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: pageView
    });
  } catch (error) {
    console.error('记录页面访问失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pageview - 获取所有页面访问数据
 */
export async function GET() {
  try {
    const result = await getAllPageViews();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('获取页面访问数据失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pageview?id=xxx - 删除指定的页面访问数据
 */
export async function DELETE(request: NextRequest) {
  try {
    // 从URL参数中获取ID
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数: id' },
        { status: 400 }
      );
    }
    
    const result = await deletePageView(id);
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('删除页面访问数据失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}