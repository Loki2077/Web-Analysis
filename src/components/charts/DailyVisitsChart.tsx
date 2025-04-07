/**
 * 每日访问量图表组件
 * 使用Chart.js和react-chartjs-2展示每日页面访问量和独立访客数
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { DailyStats } from '@/types';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DailyVisitsChartProps {
  dailyStats: DailyStats[];
  title?: string;
}

export default function DailyVisitsChart({ dailyStats, title = '每日访问量趋势' }: DailyVisitsChartProps) {
  // 准备图表数据
  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [], labels: [] });
  
  useEffect(() => {
    if (dailyStats && dailyStats.length > 0) {
      setChartData({
        labels: dailyStats.map(stat => stat.date),
        datasets: [
          {
            label: '页面浏览量',
            data: dailyStats.map(stat => stat.pageViews),
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
            tension: 0.3,
          },
          {
            label: '独立访客数',
            data: dailyStats.map(stat => stat.uniqueVisitors),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            tension: 0.3,
          },
        ],
      });
    }
  }, [dailyStats]);

  // 图表配置
  const options: ChartOptions<'line'> = {
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
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0, // 只显示整数
        },
      },
    },
  };

  return (
    <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {dailyStats && dailyStats.length > 0 ? (
        <Line options={options} data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">暂无数据</p>
        </div>
      )}
    </div>
  );
}