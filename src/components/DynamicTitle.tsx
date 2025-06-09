'use client';

import { useEffect } from 'react';
import { useData } from '@/context/DataContext';

interface DynamicTitleProps {
  selectedDomain?: string | null;
  selectedFingerprint?: string | null;
  activeTab?: string;
}

/**
 * 动态标题组件
 * 根据当前页面状态动态更新浏览器标签标题
 * @param selectedDomain 当前选中的域名
 * @param selectedFingerprint 当前选中的用户指纹
 * @param activeTab 当前激活的标签页
 */
const DynamicTitle: React.FC<DynamicTitleProps> = ({ 
  selectedDomain, 
  selectedFingerprint, 
  activeTab 
}) => {
  const { eventList, userList, domainList } = useData();

  useEffect(() => {
    let title = '网站监测站';
    
    // 根据选中状态构建动态标题
    if (selectedDomain) {
      title = `${selectedDomain} - 网站监测站`;
    } else if (selectedFingerprint) {
      title = `用户 ${selectedFingerprint.slice(0, 8)}... - 网站监测站`;
    } else if (activeTab) {
      switch (activeTab) {
        case 'domains':
          title = `域名列表 (${domainList.length}) - 网站监测站`;
          break;
        case 'users':
          title = `用户列表 (${userList.length}) - 网站监测站`;
          break;
        case 'events':
          title = `事件时间线 (${eventList.length}) - 网站监测站`;
          break;
        default:
          title = '网站监测站';
      }
    }
    
    // 添加实时数据计数
    if (!selectedDomain && !selectedFingerprint) {
      const totalEvents = eventList.length;
      if (totalEvents > 0) {
        title = `网站监测站 (${totalEvents} 事件)`;
      }
    }
    
    // 更新浏览器标题
    document.title = title;
  }, [selectedDomain, selectedFingerprint, activeTab, eventList.length, userList.length, domainList.length]);

  return null; // 这个组件不渲染任何内容
};

export default DynamicTitle;