/**
 * 最近页面访问记录组件
 * 展示最近的页面访问记录，包括访问时间、URL和用户代理等信息
 */

'use client';

// import { useState } from 'react';
import dayjs from 'dayjs';
import { PageView } from '@/types';

interface RecentPageViewsProps {
  pageViews: PageView[];
  limit?: number;
}

export default function RecentPageViews({ 
  pageViews, 
  limit = 10 
}: RecentPageViewsProps) {
  // 按时间戳降序排序并限制数量
  const sortedPageViews = [...pageViews]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  };

  // 简化URL显示
  const formatUrl = (url: string): string => {
    // 移除域名部分，只显示路径
    const path = url.replace(/https?:\/\/[^\/]+/i, '');
    // 如果是首页，显示为'首页'
    return path === '/' ? '首页' : path;
  };

  // 简化用户代理显示
  const formatUserAgent = (userAgent: string): string => {
    // 提取浏览器和操作系统信息
    let browser = '未知浏览器';
    let os = '未知系统';
    
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browser = 'IE';
    
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'MacOS';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';
    
    return `${browser} / ${os}`;
  };

  // 获取操作系统和浏览器信息的函数
  const getOsAndBrowser = (userAgent: string): { os: string, browser: string } => {
    let browser = '未知浏览器';
    let os = '未知系统';
    
    if (userAgent.includes('Edge') || userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) browser = 'IE';
    
    if (userAgent.includes('Windows')) {
      os = 'Windows';
      if (userAgent.includes('Windows NT 10.0')) os += ' 10';
      else if (userAgent.includes('Windows NT 6.3')) os += ' 8.1';
      else if (userAgent.includes('Windows NT 6.2')) os += ' 8';
      else if (userAgent.includes('Windows NT 6.1')) os += ' 7';
    }
    else if (userAgent.includes('Mac')) os = 'MacOS';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';
    
    return { os, browser };
  };

  // 获取屏幕分辨率
  const getScreenResolution = (view: PageView): string => {
    return view.screenWidth && view.screenHeight 
      ? `${view.screenWidth}x${view.screenHeight}` 
      : '未知';
  };

  // 获取停留时间
  const getDuration = (view: PageView): string => {
    return view.duration ? `${view.duration}秒` : '正在访问';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium">最近访问记录</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                IP地址
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                页面
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                来源
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                操作系统
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                浏览器
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                停留时间
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                设备类型
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                屏幕分辨率
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                时间
              </th>
              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                语言
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedPageViews.length > 0 ? (
              sortedPageViews.map((view) => {
                const { os, browser } = getOsAndBrowser(view.userAgent);
                return (
                  <tr key={view.id}>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {view.ipAddress || '未知IP'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {formatUrl(view.url)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {view.referrer ? formatUrl(view.referrer) : '直接访问'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {os}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {browser}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getDuration(view)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {view.deviceType || '未知设备'}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {getScreenResolution(view)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatTimestamp(view.timestamp)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {view.language || '未知'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  暂无访问记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}