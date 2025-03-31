'use client';

import { useState } from 'react';
import Link from 'next/link';

// 模拟数据 - 实际项目中应从API获取
const mockWebsites = [
  { 
    id: 'site1', 
    domain: 'example.com', 
    totalVisits: 12543, 
    activeNow: 26,
    addedDate: '2023-09-15',
    lastVisit: '2023-10-07 14:23:45',
    pages: 42,
    avgDuration: '2m 35s'
  },
  { 
    id: 'site2', 
    domain: 'myshop.net', 
    totalVisits: 8721, 
    activeNow: 14,
    addedDate: '2023-09-20',
    lastVisit: '2023-10-07 13:45:12',
    pages: 28,
    avgDuration: '3m 12s'
  },
  { 
    id: 'site3', 
    domain: 'blog.example.org', 
    totalVisits: 4328, 
    activeNow: 5,
    addedDate: '2023-09-25',
    lastVisit: '2023-10-07 12:10:33',
    pages: 15,
    avgDuration: '4m 05s'
  },
];

export default function Websites() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 过滤网站列表
  const filteredWebsites = mockWebsites.filter(site => 
    site.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">监控网站列表</h1>
            <p className="text-gray-600 mt-2">查看所有使用您的跟踪脚本的网站</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/dashboard" className="btn-primary">
              返回仪表盘
            </Link>
          </div>
        </header>

        {/* 搜索和添加新网站 */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <input
              type="text"
              placeholder="搜索网站..."
              className="input w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <button className="btn-primary w-full md:w-auto">
              添加新网站
            </button>
          </div>
        </div>

        {/* 网站列表 */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">网站域名</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">总访问量</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前在线</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">添加日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后访问</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">页面数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均停留</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWebsites.map((site) => (
                  <tr key={site.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-primary-600">{site.domain}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{site.totalVisits.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {site.activeNow}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.addedDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.lastVisit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.pages}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{site.avgDuration}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/dashboard?website=${site.id}`} className="text-primary-600 hover:text-primary-900 mr-4">
                        查看
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredWebsites.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">没有找到匹配的网站</p>
            </div>
          )}
        </div>

        {/* 添加网站指南 */}
        <div className="mt-8 card">
          <h3 className="text-lg font-medium text-gray-700 mb-4">如何添加新网站</h3>
          <p className="mb-4">将以下跟踪代码添加到您想要监控的网站的 &lt;head&gt; 标签中：</p>
          <div className="bg-gray-100 p-4 rounded-md overflow-x-auto mb-4">
            <code className="text-sm">
              &lt;script src="https://your-domain.vercel.app/tracker.js" data-website-id="YOUR_WEBSITE_ID"&gt;&lt;/script&gt;
            </code>
          </div>
          <p className="text-sm text-gray-600">
            将 <span className="font-mono">YOUR_WEBSITE_ID</span> 替换为您的网站标识符。
            添加后，系统将自动检测并开始收集访问数据。
          </p>
        </div>
      </div>
    </main>
  );
}