import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(request: NextRequest) {
  try {
    const { websiteId, period = '7d' } = await request.json();
    
    if (!websiteId) {
      return NextResponse.json({ error: 'Missing websiteId' }, { status: 400 });
    }
    
    // 获取指定时间段的数据
    const endDate = new Date();
    let startDate: Date;
    
    switch (period) {
      case '24h':
        startDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const startTimestamp = startDate.getTime();
    
    // 获取页面访问记录
    const allPageviews = await kv.lrange(`pageviews:${websiteId}`, 0, -1);
    const pageviews = allPageviews
      .map(item => JSON.parse(item))
      .filter((pv: any) => pv.timestamp >= startTimestamp);
    
    // 计算浏览器分布
    const browsers: Record<string, number> = {};
    const devices: Record<string, number> = {};
    const oses: Record<string, number> = {};
    const referrers: Record<string, number> = {};
    const pages: Record<string, number> = {};
    
    pageviews.forEach((pv: any) => {
      // 浏览器统计
      browsers[pv.browser] = (browsers[pv.browser] || 0) + 1;
      
      // 设备统计
      devices[pv.device] = (devices[pv.device] || 0) + 1;
      
      // 操作系统统计
      oses[pv.os] = (oses[pv.os] || 0) + 1;
      
      // 来源统计
      let referrer = 'Direct';
      if (pv.referrer) {
        try {
          const referrerUrl = new URL(pv.referrer);
          referrer = referrerUrl.hostname;
        } catch (e) {
          // 无效的URL，使用原始值
          referrer = pv.referrer;
        }
      }
      referrers[referrer] = (referrers[referrer] || 0) + 1;
      
      // 页面统计
      let pagePath = '/';
      try {
        const urlObj = new URL(pv.url);
        pagePath = urlObj.pathname;
      } catch (e) {
        // 无效的URL，使用原始值
        pagePath = pv.url;
      }
      pages[pagePath] = (pages[pagePath] || 0) + 1;
    });
    
    // 转换为图表数据格式
    const browserData = {
      labels: Object.keys(browsers),
      datasets: [{
        data: Object.values(browsers),
        backgroundColor: ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#6b7280', '#8b5cf6', '#ec4899'],
      }]
    };
    
    const deviceData = {
      labels: Object.keys(devices),
      datasets: [{
        data: Object.values(devices),
        backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981'],
      }]
    };
    
    const osData = {
      labels: Object.keys(oses),
      datasets: [{
        data: Object.values(oses),
        backgroundColor: ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#6b7280'],
      }]
    };
    
    // 排序来源数据
    const sortedReferrers = Object.entries(referrers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const referrerData = {
      labels: sortedReferrers.map(([name]) => name),
      datasets: [{
        label: '访问来源',
        data: sortedReferrers.map(([, count]) => count),
        backgroundColor: '#0ea5e9',
      }]
    };
    
    // 排序页面数据
    const sortedPages = Object.entries(pages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    const pageData = {
      labels: sortedPages.map(([name]) => name),
      datasets: [{
        label: '页面访问量',
        data: sortedPages.map(([, count]) => count),
        backgroundColor: '#6366f1',
      }]
    };
    
    // 计算平均停留时间（模拟数据）
    const avgDuration = Math.floor(Math.random() * 300) + 60; // 60-360秒之间的随机值
    
    // 计算跳出率（模拟数据）
    const bounceRate = Math.floor(Math.random() * 40) + 20; // 20%-60%之间的随机值
    
    return NextResponse.json({
      period,
      totalVisits: pageviews.length,
      avgDuration,
      bounceRate,
      browserData,
      deviceData,
      osData,
      referrerData,
      pageData
    });
  } catch (error) {
    console.error('Error fetching website stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}