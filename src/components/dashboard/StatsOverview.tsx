/**
 * 统计概览组件
 * 展示总体流量数据，如总访问量和独立访客数
 */

'use client';

// import { useEffect, useState } from 'react';

interface StatsOverviewProps {
  totalPageViews: number;
  uniqueVisitors: number;
}

export default function StatsOverview({ 
  totalPageViews, 
  uniqueVisitors
}: StatsOverviewProps) {
  // 格式化大数字，添加千位分隔符
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">总页面浏览量</h3>
        <p className="text-3xl font-bold mt-2">{formatNumber(totalPageViews)}</p>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">独立访客数</h3>
        <p className="text-3xl font-bold mt-2">{formatNumber(uniqueVisitors)}</p>
      </div>
    </div>
  );
}