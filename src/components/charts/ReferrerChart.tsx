/**
 * 流量来源图表组件
 * 使用Chart.js和react-chartjs-2展示流量来源分布
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ReferrerStats } from '@/types';

// 注册Chart.js组件
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface ReferrerChartProps {
  referrerStats: ReferrerStats[];
  title?: string;
}

// 颜色列表，用于饼图的不同部分
const COLORS = [
  'rgba(255, 99, 132, 0.8)',
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(75, 192, 192, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
  'rgba(199, 199, 199, 0.8)',
];

// 格式化来源显示名称
function formatReferrer(referrer: string): string {
  if (referrer === 'direct') return '直接访问';
  
  try {
    const url = new URL(referrer);
    return url.hostname.replace('www.', '');
  } catch {
    return referrer;
  }
}

export default function ReferrerChart({ 
  referrerStats, 
  title = '流量来源分布' 
}: ReferrerChartProps) {
  // 准备图表数据
  const [chartData, setChartData] = useState<ChartData<'pie'>>({ datasets: [], labels: [] });
  
  useEffect(() => {
    if (referrerStats && referrerStats.length > 0) {
      // 格式化标签
      const labels = referrerStats.map(stat => formatReferrer(stat.referrer));
      
      // 准备数据和背景色
      const data = referrerStats.map(stat => stat.count);
      const backgroundColor = referrerStats.map((_, index) => 
        COLORS[index % COLORS.length]
      );
      
      setChartData({
        labels,
        datasets: [
          {
            data,
            backgroundColor,
            borderWidth: 1,
          },
        ],
      });
    }
  }, [referrerStats]);

  // 图表配置
  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const percentage = referrerStats[context.dataIndex]?.percentage.toFixed(1) || 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      {referrerStats && referrerStats.length > 0 ? (
        <Pie options={options} data={chartData} />
      ) : (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">暂无数据</p>
        </div>
      )}
    </div>
  );
}