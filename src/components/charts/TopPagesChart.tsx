/**
 * 热门页面图表组件
 * 使用Chart.js和react-chartjs-2展示访问量最高的页面
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { UrlStats } from '@/types';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopPagesChartProps {
  urlStats: UrlStats[];
  limit?: number;
  title?: string;
}

export default function TopPagesChart({ 
  urlStats, 
  limit = 5, 
  title = '热门页面排名' 
}: TopPagesChartProps) {
  // 准备图表数据
  const [chartData, setChartData] = useState<ChartData<'bar'>>({ datasets: [], labels: [] });
  
  useEffect(() => {
    if (urlStats && urlStats.length > 0) {
      // 获取前N个页面
      const topPages = urlStats.slice(0, limit);
      
      // 简化URL显示
      const labels = topPages.map(stat => {
        // 移除域名部分，只显示路径
        const path = stat.url.replace(/https?:\/\/[^\/]+/i, '');
        // 如果是首页，显示为'首页'
        return path === '/' ? '首页' : path;
      });
      
      setChartData({
        labels,
        datasets: [
          {
            label: '页面浏览量',
            data: topPages.map(stat => stat.pageViews),
            backgroundColor: 'rgba(53, 162, 235, 0.8)',
          },
        ],
      });
    }
  }, [urlStats, limit]);

  // 图表配置
  const options: ChartOptions<'bar'> = {
    indexAxis: 'y' as const, // 水平条形图
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0, // 只显示整数
        },
      },
    },
  };

  return (
    <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {urlStats && urlStats.length > 0 ? (
        <Bar options={options} data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">暂无数据</p>
        </div>
      )}
    </div>
  );
}