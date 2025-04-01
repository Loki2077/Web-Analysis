'use client';

import { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title
);

// 定义分析数据类型
interface AnalyticsItem {
  url: string;
  referrer: string;
  userAgent: string;
  duration: number;
  ip: string;
  timestamp: string;
}

interface AnalyticsResponse {
  success: boolean;
  data: AnalyticsItem[];
  total: number;
  period: {
    start: string;
    end: string;
    days: number;
  };
}

export default function Dashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);

  // 获取分析数据
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-analytics?days=${days}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data: AnalyticsResponse = await response.json();
        if (data.success) {
          setAnalyticsData(data.data);
        } else {
          throw new Error('API returned error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [days]);

  // 处理访问趋势数据
  const visitTrendData = () => {
    // 按日期分组
    const dateGroups = analyticsData.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 排序日期
    const sortedDates = Object.keys(dateGroups).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: sortedDates,
      datasets: [
        {
          label: '访问量',
          data: sortedDates.map(date => dateGroups[date]),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  };

  // 处理来源分析数据
  const referrerData = () => {
    // 按来源分组
    const referrerGroups = analyticsData.reduce((acc, item) => {
      const referrer = item.referrer === '' ? 'direct' : 
                      new URL(item.referrer).hostname || 'direct';
      acc[referrer] = (acc[referrer] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(referrerGroups);
    const data = labels.map(label => referrerGroups[label]);

    return {
      labels,
      datasets: [
        {
          label: '访问来源',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // 处理设备分析数据
  const deviceData = () => {
    // 简单的设备检测
    const deviceGroups = analyticsData.reduce((acc, item) => {
      let device = 'Unknown';
      const ua = item.userAgent.toLowerCase();
      
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        device = 'Tablet';
      } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        device = 'Mobile';
      } else {
        device = 'Desktop';
      }
      
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(deviceGroups);
    const data = labels.map(label => deviceGroups[label]);

    return {
      labels,
      datasets: [
        {
          label: '设备类型',
          data,
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">网站流量分析仪表盘</h1>
      
      {/* 时间范围选择 */}
      <div className="mb-6 flex justify-center">
        <select 
          value={days} 
          onChange={(e) => setDays(Number(e.target.value))}
          className="p-2 border rounded"
        >
          <option value={1}>最近1天</option>
          <option value={7}>最近7天</option>
          <option value={30}>最近30天</option>
          <option value={90}>最近90天</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10">加载中...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : analyticsData.length === 0 ? (
        <div className="text-center py-10">暂无数据</div>
      ) : (
        <div>
          {/* 数据概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">总访问量</h3>
              <p className="text-3xl font-bold">{analyticsData.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">平均停留时间</h3>
              <p className="text-3xl font-bold">
                {Math.round(analyticsData.reduce((acc, item) => acc + item.duration, 0) / analyticsData.length / 1000)} 秒
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">独立访客数</h3>
              <p className="text-3xl font-bold">
                {new Set(analyticsData.map(item => item.ip)).size}
              </p>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* 访问趋势 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">访问趋势</h3>
              <div className="h-64">
                <Line 
                  data={visitTrendData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* 来源分析 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">来源分析</h3>
              <div className="h-64">
                <Pie 
                  data={referrerData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }} 
                />
              </div>
            </div>

            {/* 设备占比 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">设备占比</h3>
              <div className="h-64">
                <Bar 
                  data={deviceData()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    }
                  }} 
                />
              </div>
            </div>

            {/* 访问页面排行 */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">访问页面排行</h3>
              <div className="overflow-y-auto h-64">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="text-left py-2">页面</th>
                      <th className="text-right py-2">访问次数</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(analyticsData.reduce((acc, item) => {
                      try {
                        const url = new URL(item.url);
                        const path = url.pathname;
                        acc[path] = (acc[path] || 0) + 1;
                      } catch (e) {
                        // 忽略无效URL
                      }
                      return acc;
                    }, {} as Record<string, number>))
                      .sort((a, b) => b[1] - a[1])
                      .map(([path, count]) => (
                        <tr key={path} className="border-t">
                          <td className="py-2 truncate">{path}</td>
                          <td className="text-right py-2">{count}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 访问详情表格 */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h3 className="text-lg font-semibold mb-4">访问详情</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4">时间</th>
                    <th className="text-left py-3 px-4">页面</th>
                    <th className="text-left py-3 px-4">来源</th>
                    <th className="text-left py-3 px-4">设备</th>
                    <th className="text-right py-3 px-4">停留时间</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 20) // 只显示最近20条记录
                    .map((item, index) => {
                      let device = 'Unknown';
                      const ua = item.userAgent.toLowerCase();
                      
                      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
                        device = 'Tablet';
                      } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
                        device = 'Mobile';
                      } else {
                        device = 'Desktop';
                      }

                      return (
                        <tr key={index} className="border-t">
                          <td className="py-3 px-4">{new Date(item.timestamp).toLocaleString()}</td>
                          <td className="py-3 px-4 truncate max-w-xs">
                            {try {
                              new URL(item.url).pathname
                            } catch {
                              item.url
                            }}
                          </td>
                          <td className="py-3 px-4">
                            {item.referrer === 'direct' ? 'Direct' : 
                              try {
                                new URL(item.referrer).hostname
                              } catch {
                                item.referrer
                              }
                            }
                          </td>
                          <td className="py-3 px-4">{device}</td>
                          <td className="text-right py-3 px-4">{Math.round(item.duration / 1000)} 秒</td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}