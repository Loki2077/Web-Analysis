'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement);

// 模拟数据 - 实际项目中应从API获取
const mockWebsites = [
  { id: 'site1', domain: 'example.com', totalVisits: 12543, activeNow: 26 },
  { id: 'site2', domain: 'myshop.net', totalVisits: 8721, activeNow: 14 },
  { id: 'site3', domain: 'blog.example.org', totalVisits: 4328, activeNow: 5 },
];

const mockVisits = [
  { id: 1, website: 'example.com', page: '/home', timestamp: new Date().getTime() - 120000, referrer: 'google.com', browser: 'Chrome', os: 'Windows', device: 'Desktop' },
  { id: 2, website: 'example.com', page: '/products', timestamp: new Date().getTime() - 300000, referrer: 'facebook.com', browser: 'Firefox', os: 'macOS', device: 'Desktop' },
  { id: 3, website: 'myshop.net', page: '/cart', timestamp: new Date().getTime() - 600000, referrer: 'instagram.com', browser: 'Safari', os: 'iOS', device: 'Mobile' },
  { id: 4, website: 'blog.example.org', page: '/article/123', timestamp: new Date().getTime() - 900000, referrer: 'twitter.com', browser: 'Chrome', os: 'Android', device: 'Mobile' },
  { id: 5, website: 'example.com', page: '/contact', timestamp: new Date().getTime() - 1200000, referrer: 'linkedin.com', browser: 'Edge', os: 'Windows', device: 'Desktop' },
];

const mockDailyVisits = [
  { date: '2023-10-01', visits: 1245 },
  { date: '2023-10-02', visits: 1322 },
  { date: '2023-10-03', visits: 1198 },
  { date: '2023-10-04', visits: 1429 },
  { date: '2023-10-05', visits: 1501 },
  { date: '2023-10-06', visits: 1387 },
  { date: '2023-10-07', visits: 1298 },
];

const mockBrowserData = {
  labels: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
  datasets: [
    {
      data: [65, 12, 18, 5, 2],
      backgroundColor: ['#0ea5e9', '#6366f1', '#f59e0b', '#10b981', '#6b7280'],
    },
  ],
};

const mockDeviceData = {
  labels: ['Desktop', 'Mobile', 'Tablet'],
  datasets: [
    {
      data: [58, 35, 7],
      backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981'],
    },
  ],
};

const mockReferrerData = {
  labels: ['Direct', 'Google', 'Facebook', 'Twitter', 'Other'],
  datasets: [
    {
      label: '访问来源',
      data: [35, 25, 15, 10, 15],
      backgroundColor: '#0ea5e9',
    },
  ],
};

export default function Dashboard() {
  const [selectedWebsite, setSelectedWebsite] = useState('all');
  const [totalVisits, setTotalVisits] = useState(0);
  const [activeNow, setActiveNow] = useState(0);
  
  // 计算总访问量和当前活跃用户
  useEffect(() => {
    if (selectedWebsite === 'all') {
      setTotalVisits(mockWebsites.reduce((sum, site) => sum + site.totalVisits, 0));
      setActiveNow(mockWebsites.reduce((sum, site) => sum + site.activeNow, 0));
    } else {
      const site = mockWebsites.find(s => s.id === selectedWebsite);
      if (site) {
        setTotalVisits(site.totalVisits);
        setActiveNow(site.activeNow);
      }
    }
  }, [selectedWebsite]);

  // 准备折线图数据
  const lineChartData = {
    labels: mockDailyVisits.map(item => format(new Date(item.date), 'MM/dd')),
    datasets: [
      {
        label: '每日访问量',
        data: mockDailyVisits.map(item => item.visits),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        fill: true,
      },
    ],
  };

  // 过滤访问记录
  const filteredVisits = selectedWebsite === 'all' 
    ? mockVisits 
    : mockVisits.filter(visit => {
        const site = mockWebsites.find(s => s.id === selectedWebsite);
        return site && visit.website === site.domain;
      });

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">网站流量分析仪表盘</h1>
          <p className="text-gray-600 mt-2">实时监控您的网站流量和用户行为</p>
        </header>

        {/* 网站选择器 */}
        <div className="mb-8">
          <label htmlFor="website-select" className="block text-sm font-medium text-gray-700 mb-2">选择网站：</label>
          <select
            id="website-select"
            className="input w-full md:w-64"
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
          >
            <option value="all">所有网站</option>
            {mockWebsites.map(site => (
              <option key={site.id} value={site.id}>{site.domain}</option>
            ))}
          </select>
        </div>

        {/* 概览卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">总访问量</h3>
            <p className="text-3xl font-bold text-primary-600">{totalVisits.toLocaleString()}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">当前在线</h3>
            <p className="text-3xl font-bold text-green-600">{activeNow}</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">平均停留时间</h3>
            <p className="text-3xl font-bold text-amber-600">3分42秒</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-2">跳出率</h3>
            <p className="text-3xl font-bold text-indigo-600">32.5%</p>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">访问趋势</h3>
            <div className="h-64">
              <Line 
                data={lineChartData} 
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
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">访问来源</h3>
            <div className="h-64">
              <Bar 
                data={mockReferrerData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  indexAxis: 'y',
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">浏览器分布</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48">
                <Pie data={mockBrowserData} />
              </div>
            </div>
          </div>
          <div className="card">
            <h3 className="text-lg font-medium text-gray-700 mb-4">设备类型</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="w-48">
                <Pie data={mockDeviceData} />
              </div>
            </div>
          </div>
        </div>

        {/* 最近访问列表 */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">最近访问</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">网站</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">来源</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">浏览器</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisits.map((visit) => (
                  <tr key={visit.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(visit.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.website}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{visit.page}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.referrer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.browser}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{visit.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}