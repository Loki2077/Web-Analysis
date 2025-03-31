import Head from 'next/head';
import { useState, useEffect } from 'react';
import { format, subDays } from 'date-fns';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// 注册Chart.js组件
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// 定义统计数据类型
type Stats = {
  pageviews: number;
  visitors: number;
  date: string;
};

// 定义网站数据类型
type Website = {
  id: string;
  name?: string;
  url?: string;
};

export default function Home() {
  const [stats, setStats] = useState<Stats[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState(7); // 默认显示7天数据

  // 获取网站列表
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await fetch('/api/websites');
        if (!response.ok) {
          throw new Error('获取网站列表失败');
        }
        const data = await response.json();
        setWebsites(data);
        
        // 如果有网站数据且未选择网站，则选择第一个
        if (data.length > 0 && selectedWebsite === 'default') {
          setSelectedWebsite(data[0].id);
        }
      } catch (err) {
        console.error('获取网站列表错误:', err);
      }
    };

    fetchWebsites();
  }, []);

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stats?days=${dateRange}&websiteId=${encodeURIComponent(selectedWebsite)}`);
        if (!response.ok) {
          throw new Error('获取数据失败');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedWebsite) {
      fetchStats();
    }
  }, [dateRange, selectedWebsite]);

  // 准备图表数据
  const chartData = {
    labels: stats.map(day => day.date),
    datasets: [
      {
        label: '页面浏览量',
        data: stats.map(day => day.pageviews),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: '访客数',
        data: stats.map(day => day.visitors),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // 图表配置
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '网站流量统计',
      },
    },
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Head>
        <title>Web Analysis - 网站流量分析</title>
        <meta name="description" content="基于Vercel的开源Web流量分析工具" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">网站流量分析仪表盘</h1>
        
        {/* 网站选择器 */}
        <div className="mb-6">
          <label htmlFor="website-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">选择网站：</label>
          <select
            id="website-select"
            value={selectedWebsite}
            onChange={(e) => setSelectedWebsite(e.target.value)}
            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
          >
            {websites.length === 0 && (
              <option value="default">默认网站</option>
            )}
            {websites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name || site.id}
              </option>
            ))}
          </select>
        </div>
        
        {/* 日期范围选择器 */}
        <div className="mb-6 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {[7, 14, 30].map(days => (
              <button
                key={days}
                type="button"
                onClick={() => setDateRange(days)}
                className={`px-4 py-2 text-sm font-medium ${dateRange === days
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700'
                } ${days === 7 ? 'rounded-l-lg' : ''} ${days === 30 ? 'rounded-r-lg' : ''}`}
              >
                {days}天
              </button>
            ))}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="今日页面浏览" 
            value={stats[stats.length - 1]?.pageviews || 0} 
            change={calculateChange(stats, 'pageviews')} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="今日访客" 
            value={stats[stats.length - 1]?.visitors || 0} 
            change={calculateChange(stats, 'visitors')} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="平均停留时间" 
            value="2分36秒" 
            change={5.2} 
            isLoading={isLoading} 
          />
          <StatCard 
            title="跳出率" 
            value="42%" 
            change={-2.1} 
            isLoading={isLoading} 
          />
        </div>

        {/* 图表 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="h-64 flex items-center justify-center text-red-500">
              {error}
            </div>
          ) : (
            <Line options={chartOptions} data={chartData} height={80} />
          )}
        </div>

        {/* 集成代码 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">如何集成到您的网站</h2>
          <p className="mb-4">将以下代码添加到您网站的<code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">&lt;head&gt;</code>标签中：</p>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm">
              <code>{typeof window !== 'undefined' ? 
                `<script async src="${window.location.origin}/tracker.js" data-website-id="${window.location.origin}"></script>` : 
                `<script async src="/tracker.js" data-website-id="YOUR_WEBSITE_URL"></script>`
              }</code>
            </pre>
          </div>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            您也可以使用完整的URL作为网站ID，例如：<code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">data-website-id="http://localhost:5000/"</code>
          </p>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto mt-8 text-center text-sm text-gray-500">
        <p>Web Analysis - 基于Vercel的开源Web流量分析工具</p>
        <p className="mt-2">
          <a href="https://github.com/yourusername/web-analysis" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
            GitHub
          </a> · 
          <a href="/docs" className="text-primary-600 hover:underline">
            文档
          </a> · 
          <a href="/privacy" className="text-primary-600 hover:underline">
            隐私政策
          </a>
        </p>
      </footer>
    </div>
  );
}

// 计算变化百分比
function calculateChange(stats: Stats[], key: 'pageviews' | 'visitors'): number {
  if (stats.length < 2) return 0;
  const today = stats[stats.length - 1][key];
  const yesterday = stats[stats.length - 2][key];
  if (yesterday === 0) return 100; // 避免除以零
  return Number((((today - yesterday) / yesterday) * 100).toFixed(1));
}

// 统计卡片组件
function StatCard({ title, value, change, isLoading }: { title: string; value: number | string; change: number; isLoading: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      {isLoading ? (
        <div className="h-8 mt-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      ) : (
        <>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            <span className="text-gray-500 dark:text-gray-400 ml-1">vs 昨天</span>
          </p>
        </>
      )}
    </div>
  );
}