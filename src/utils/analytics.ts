/**
 * 流量分析工具函数
 * 用于处理和分析从Blob存储中获取的流量数据
 */

import dayjs from 'dayjs';
import { PageView, DailyStats, UrlStats, ReferrerStats } from '../types';

/**
 * 按日期聚合页面访问数据
 * @param pageViews 页面访问数据列表
 * @param days 要统计的天数（默认为7天）
 * @returns 按日期聚合的统计数据
 */
export function getDailyStats(pageViews: PageView[], days: number = 7): DailyStats[] {
  // 获取当前日期
  const today = dayjs();
  
  // 初始化结果数组
  const result: DailyStats[] = [];
  
  // 为过去的days天创建统计数据
  for (let i = days - 1; i >= 0; i--) {
    const date = today.subtract(i, 'day').format('YYYY-MM-DD');
    result.push({
      date,
      pageViews: 0,
      uniqueVisitors: 0
    });
  }
  
  // 按日期分组页面访问数据
  const groupedByDate: Record<string, PageView[]> = {};
  
  pageViews.forEach(view => {
    const date = dayjs(view.timestamp).format('YYYY-MM-DD');
    if (!groupedByDate[date]) {
      groupedByDate[date] = [];
    }
    groupedByDate[date].push(view);
  });
  
  // 计算每天的统计数据
  result.forEach(stat => {
    const views = groupedByDate[stat.date] || [];
    stat.pageViews = views.length;
    
    // 计算独立访客数（基于IP地址或用户代理的组合）
    const uniqueVisitors = new Set();
    views.forEach(view => {
      const visitorId = view.ipAddress || view.userAgent;
      if (visitorId) {
        uniqueVisitors.add(visitorId);
      }
    });
    stat.uniqueVisitors = uniqueVisitors.size;
    
    // 计算平均停留时间（如果有duration数据）
    const durationsWithData = views.filter(view => view.duration !== undefined);
    if (durationsWithData.length > 0) {
      const totalDuration = durationsWithData.reduce((sum, view) => sum + (view.duration || 0), 0);
      stat.averageDuration = Math.round(totalDuration / durationsWithData.length);
    }
  });
  
  return result;
}

/**
 * 按URL聚合页面访问数据
 * @param pageViews 页面访问数据列表
 * @returns 按URL聚合的统计数据
 */
export function getUrlStats(pageViews: PageView[]): UrlStats[] {
  // 按URL分组页面访问数据
  const groupedByUrl: Record<string, PageView[]> = {};
  
  pageViews.forEach(view => {
    if (!groupedByUrl[view.url]) {
      groupedByUrl[view.url] = [];
    }
    groupedByUrl[view.url].push(view);
  });
  
  // 计算每个URL的统计数据
  const result: UrlStats[] = Object.entries(groupedByUrl).map(([url, views]) => {
    // 计算独立访客数
    const uniqueVisitors = new Set();
    views.forEach(view => {
      const visitorId = view.ipAddress || view.userAgent;
      if (visitorId) {
        uniqueVisitors.add(visitorId);
      }
    });
    
    // 计算平均停留时间
    let averageDuration: number | undefined;
    const durationsWithData = views.filter(view => view.duration !== undefined);
    if (durationsWithData.length > 0) {
      const totalDuration = durationsWithData.reduce((sum, view) => sum + (view.duration || 0), 0);
      averageDuration = Math.round(totalDuration / durationsWithData.length);
    }
    
    return {
      url,
      pageViews: views.length,
      uniqueVisitors: uniqueVisitors.size,
      averageDuration
    };
  });
  
  // 按页面浏览量降序排序
  return result.sort((a, b) => b.pageViews - a.pageViews);
}

/**
 * 获取流量来源统计数据
 * @param pageViews 页面访问数据列表
 * @returns 流量来源统计数据
 */
export function getReferrerStats(pageViews: PageView[]): ReferrerStats[] {
  // 按来源分组页面访问数据
  const groupedByReferrer: Record<string, PageView[]> = {};
  
  pageViews.forEach(view => {
    const referrer = view.referrer || 'direct';
    if (!groupedByReferrer[referrer]) {
      groupedByReferrer[referrer] = [];
    }
    groupedByReferrer[referrer].push(view);
  });
  
  // 计算总访问量
  const totalViews = pageViews.length;
  
  // 计算每个来源的统计数据
  const result: ReferrerStats[] = Object.entries(groupedByReferrer).map(([referrer, views]) => {
    return {
      referrer,
      count: views.length,
      percentage: totalViews > 0 ? (views.length / totalViews) * 100 : 0
    };
  });
  
  // 按访问次数降序排序
  return result.sort((a, b) => b.count - a.count);
}

/**
 * 生成模拟的页面访问数据（用于开发和测试）
 * @param count 要生成的数据条数
 * @returns 模拟的页面访问数据列表
 */
export function generateMockPageViews(count: number = 100): PageView[] {
  const urls = [
    '/blog/how-to-use-nextjs',
    '/blog/react-best-practices',
    '/blog/typescript-tips',
    '/blog/css-tricks',
    '/about',
    '/contact',
    '/'
  ];
  
  const referrers = [
    'https://google.com',
    'https://twitter.com',
    'https://facebook.com',
    'https://github.com',
    'direct',
    'https://bing.com'
  ];
  
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
  ];
  
  const result: PageView[] = [];
  
  // 获取当前时间
  const now = Date.now();
  
  // 生成过去30天内的随机数据
  for (let i = 0; i < count; i++) {
    const randomTime = now - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
    const randomUrl = urls[Math.floor(Math.random() * urls.length)];
    const randomReferrer = referrers[Math.floor(Math.random() * referrers.length)];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const randomDuration = Math.floor(Math.random() * 300) + 10; // 10-310秒
    
    result.push({
      id: `mock-${i}-${randomTime}`,
      url: randomUrl,
      timestamp: randomTime,
      userAgent: randomUserAgent,
      referrer: randomReferrer === 'direct' ? undefined : randomReferrer,
      duration: randomDuration,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    });
  }
  
  return result;
}