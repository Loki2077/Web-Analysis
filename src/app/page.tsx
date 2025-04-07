/**
 * 博客流量分析主页面
 * 展示博客流量分析数据，包括访问量趋势、热门页面、流量来源等
 */

'use client';

import { useEffect, useState } from 'react';
import DailyVisitsChart from '@/components/charts/DailyVisitsChart';
import TopPagesChart from '@/components/charts/TopPagesChart';
import ReferrerChart from '@/components/charts/ReferrerChart';
import StatsOverview from '@/components/dashboard/StatsOverview';
import RecentPageViews from '@/components/dashboard/RecentPageViews';
import { DailyStats, UrlStats, ReferrerStats, PageView } from '@/types';

// 定义分析数据类型
interface AnalyticsData {
  overview: {
    totalPageViews: number;
    uniqueVisitors: number;
    dataSource: 'real' | 'mock';
  };
  dailyStats: DailyStats[];
  urlStats: UrlStats[];
  referrerStats: ReferrerStats[];
}

export default function Home() {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [pageViews, setPageViews] = useState<PageView[]>([]);

  // 获取分析数据
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 调用分析API，只使用真实数据
      const response = await fetch('/api/analytics');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取数据失败');
      }
      
      setAnalyticsData(result.data);
      
      // 获取页面访问记录
      const pageViewsResponse = await fetch('/api/pageview');
      const pageViewsResult = await pageViewsResponse.json();
      
      if (pageViewsResult.success) {
        setPageViews(pageViewsResult.data || []);
      }
    } catch (err) {
      console.error('获取分析数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">博客流量分析</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[90%] mx-auto py-6 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">加载中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 my-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        ) : analyticsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 左侧：访问信息统计 */}
            <div className="lg:col-span-5 space-y-6">
              {/* 统计概览 */}
              <StatsOverview 
                totalPageViews={analyticsData.overview.totalPageViews}
                uniqueVisitors={analyticsData.overview.uniqueVisitors}
              />
              
              {/* 每日访问量趋势 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <DailyVisitsChart dailyStats={analyticsData.dailyStats} />
              </div>
              
              {/* 热门页面排名 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <TopPagesChart urlStats={analyticsData.urlStats} />
              </div>
              
              {/* 流量来源分布 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <ReferrerChart referrerStats={analyticsData.referrerStats} />
              </div>
              
              {/* 数据说明 */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">数据说明</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• 页面浏览量：访问者查看页面的总次数</li>
                  <li>• 独立访客数：基于IP地址和用户代理计算的不同访问者数量</li>
                  <li>• 直接访问：没有来源信息的访问，通常是直接输入网址或使用书签</li>
                </ul>
              </div>
            </div>
            
            {/* 右侧：最近访问记录 */}
            <div className="lg:col-span-7">
              <RecentPageViews pageViews={pageViews} />
            </div>
          </div>
        ) : null}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} 博客流量分析 - 基于Next.js和Vercel Blob存储
          </p>
        </div>
      </footer>
      
      {/* 引入tracker.js */}
      <script src="/tracker.js"></script>
    </div>
  );
}
