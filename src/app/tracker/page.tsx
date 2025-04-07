/**
 * 跟踪脚本集成页面
 * 用于展示如何在其他网站中嵌入跟踪脚本，并显示收集到的数据
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TrackerPage() {
  const [pageViews, setPageViews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // 获取最近的页面访问数据
  const fetchPageViews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/pageview');
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '获取数据失败');
      }
      
      // 按时间戳降序排序，只显示最近的10条记录
      const sortedData = result.data.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
      setPageViews(sortedData);
    } catch (err) {
      console.error('获取页面访问数据失败:', err);
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 复制跟踪代码到剪贴板
  const copyTrackingCode = () => {
    const serverUrl = window.location.origin;
    const trackingCode = `<script async src="${serverUrl}/tracker.js"></script>`;
    
    navigator.clipboard.writeText(trackingCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };
  
  // 组件挂载时获取数据
  useEffect(() => {
    fetchPageViews();
    
    // 每30秒刷新一次数据
    const intervalId = setInterval(fetchPageViews, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // 格式化时间戳
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">跟踪脚本集成</h1>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              返回分析页面
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* 跟踪脚本说明 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">如何集成跟踪脚本</h2>
            <p className="mb-4">将以下代码添加到您网站的&lt;head&gt;标签中：</p>
            
            <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md mb-4 relative">
              <pre className="text-sm overflow-x-auto">
                <code>{`<script async src="${window.location.origin}/tracker.js"></script>`}</code>
              </pre>
              
              <button 
                onClick={copyTrackingCode}
                className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
              >
                {copied ? '已复制!' : '复制代码'}
              </button>
            </div>
            
            <div className="flex space-x-4">
              <a 
                href="/tracker-demo.html" 
                target="_blank"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors inline-block"
              >
                查看演示页面
              </a>
              
              <a 
                href="/tracker.js" 
                target="_blank"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors inline-block"
              >
                查看跟踪脚本源码
              </a>
            </div>
          </div>
          
          {/* 最近收集的数据 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">最近收集的数据</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                显示最近10条通过跟踪脚本收集的页面访问记录
              </p>
              <button 
                onClick={fetchPageViews}
                className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
              >
                刷新数据
              </button>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <p>加载中...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-red-500">
                <p>{error}</p>
              </div>
            ) : pageViews.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
                <p className="mt-2 text-sm">集成跟踪脚本并访问您的网站以收集数据</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">时间</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">来源</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">停留时间</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {pageViews.map((view) => (
                      <tr key={view.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatTimestamp(view.timestamp)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{view.url}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{view.referrer || '直接访问'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {view.duration ? `${view.duration}秒` : '未记录'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 shadow mt-8">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Web-Analysis - 基于Next.js和Vercel Blob存储
          </p>
        </div>
      </footer>
    </div>
  );
}