'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

export default function Analytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [websites, setWebsites] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [activeNow, setActiveNow] = useState(0);
  const [recentVisits, setRecentVisits] = useState([]);
  
  // 获取网站数据
  useEffect(() => {
    async function fetchData() {
      try {
        // 获取所有检测到的网站
        const response = await fetch('/api/detect');
        const data = await response.json();
        
        if (data.websites) {
          setWebsites(data.websites);
          
          // 计算总访问量和当前活跃用户
          const totalVisits = data.websites.reduce((sum, site) => sum + (site.totalVisits || 0), 0);
          const activeNow = data.websites.reduce((sum, site) => sum + (site.activeNow || 0), 0);
          
          setTotalVisits(totalVisits);
          setActiveNow(activeNow);
          
          // 获取最近的访问记录
          const recentVisitsResponse = await fetch('/api/recent-visits');
          const recentVisitsData = await recentVisitsResponse.json();
          
          if (recentVisitsData.visits) {
            setRecentVisits(recentVisitsData.visits);
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
    
    // 设置定时刷新（每60秒）
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // 准备设备类型数据
  const deviceData = {
    labels: ['桌面设备', '移动设备', '平板设备'],
    datasets: [
      {
        data: [65, 30, 5],
        backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981'],
      },
    ],
  };
  
  // 准备浏览器数据
  const browserData = {
    labels: ['Chrome', 'Safari', 'Firefox', 'Edge', '其他'],
    datasets: [
      {
        data: [60, 15, 10, 10, 5],
        backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981', '#6366f1', '#6b7280'],
      },
    ],
  };
  
  // 准备访问趋势数据
  const trendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: '访问量',
        data: [30, 15, 60, 75, 90, 65],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        fill: true,
      },
    ],
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 mb-4"></div>
          <p className="text-gray-600">加载分析数据中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">实时流量分析</h1>
            <p className="text-gray-600 mt-2">所有网站的综合流量和访问数据</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link href="/websites" className="btn-primary">
              网站列表
            </Link>
            <Link href="/dashboard" className="btn-primary">
              仪表盘
            </Link>
          </div>
        </header>
        
        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">监控网站数</h3>
            <p className="text-3xl font-bold text-primary-600">{websites.length}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">总访问量</h3>
            <p className="text-3xl font-bold text-primary-600">{totalVisits.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">当前在线</h3>
            <p className="text-3xl font-bold text-green-600">{activeNow}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">活跃网站</h3>
            <p className="text-3xl font-bold text-amber-600">
              {websites.filter(site => site.status === 'active').length}
            </p>
          </div>
        </div>
        
        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="card lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-700 mb-4">设备类型</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48">
                <Pie data={deviceData} />
              </div>
            </div>
          </div>
          <div className="card lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-700 mb-4">浏览器分布</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48">
                <Pie data={browserData} />
              </div>
            </div>
          </div>
          <div className="card lg:col-span-1">
            <h3 className="text-lg font-medium text-gray-700 mb-4">今日访问趋势</h3>
            <div className="h-64">
              <Line 
                data={trendData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        
        {/* 最近访问列表 */}
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">最近访问记录</h3>
            <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              查看全部
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">网站</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">来源</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentVisits.length > 0 ? (
                  recentVisits.map((visit, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-600">{visit.domain}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">{visit.url}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{visit.referrer || '直接访问'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{visit.device} / {visit.browser}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(visit.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      暂无访问记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* 活跃网站列表 */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-700">活跃网站</h3>
            <Link href="/websites" className="text-primary-600 hover:text-primary-800 text-sm font-medium">
              查看全部网站
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">网站域名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总访问量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前在线</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后活动</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {websites.length > 0 ? (
                  websites.slice(0, 5).map((site) => (
                    <tr key={site.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-600">{site.domain}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{site.totalVisits.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${site.activeNow > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {site.activeNow}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {site.lastActivity ? format(new Date(site.lastActivity), 'yyyy-MM-dd HH:mm:ss') : '未知'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/dashboard?website=${site.id}`} className="text-primary-600 hover:text-primary-900">
                          查看详情
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      暂无监控网站
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}