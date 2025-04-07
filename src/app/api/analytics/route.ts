/**
 * 流量分析API
 * 用于获取和处理流量分析数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllPageViews } from '@/utils/blobStorage';
import { getDailyStats, getUrlStats, getReferrerStats } from '@/utils/analytics';

/**
 * GET /api/analytics - 获取流量分析数据
 * 可选查询参数:
 * - days=7 - 获取最近几天的数据（默认7天）
 */
export async function GET(request: NextRequest) {
  try {
    // 从URL参数中获取配置
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);
    
    // 获取真实页面访问数据
    const result = await getAllPageViews();
    
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
    
    const pageViews = result.data;
    
    // 计算各种统计数据
    const dailyStats = getDailyStats(pageViews, days);
    const urlStats = getUrlStats(pageViews);
    const referrerStats = getReferrerStats(pageViews);
    
    // 计算总体统计数据
    const totalPageViews = pageViews.length;
    
    // 计算独立访客数
    const uniqueVisitors = new Set();
    pageViews.forEach(view => {
      const visitorId = view.ipAddress || view.userAgent;
      if (visitorId) {
        uniqueVisitors.add(visitorId);
      }
    });
    
    // 返回分析结果
    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPageViews,
          uniqueVisitors: uniqueVisitors.size,
          dataSource: 'real'
        },
        dailyStats,
        urlStats,
        referrerStats
      }
    });
  } catch (error) {
    console.error('获取流量分析数据失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器内部错误' },
      { status: 500 }
    );
  }
}