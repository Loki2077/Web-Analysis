import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

/**
 * 查询存储的访问数据
 * GET /api/get-analytics
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '7'); // 默认查询最近7天的数据
    
    // 计算开始日期
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // 列出指定日期范围内的所有文件
    const { blobs } = await list({
      prefix: 'analytics/',
    });
    
    // 过滤出指定日期范围内的文件
    const filteredBlobs = blobs.filter(blob => {
      // 从文件路径中提取日期
      const pathParts = blob.pathname.split('/');
      if (pathParts.length < 2) return false;
      
      const dateStr = pathParts[1]; // 格式：YYYY-MM-DD
      const blobDate = new Date(dateStr);
      
      return blobDate >= startDate;
    });
    
    // 读取所有文件内容
    const analyticsData = await Promise.all(
      filteredBlobs.map(async (blob) => {
        const response = await fetch(blob.url);
        return response.json();
      })
    );
    
    // 返回数据
    return NextResponse.json({ 
      success: true, 
      data: analyticsData,
      total: analyticsData.length,
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}