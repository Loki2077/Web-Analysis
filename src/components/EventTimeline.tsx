// src/components/EventTimeline.tsx

"use client"; // 标记这是一个客户端文件

import React from "react";
import dayjs from "dayjs"; // 导入 dayjs
import { FaEye, FaMousePointer, FaHeartbeat } from 'react-icons/fa'; // Import relevant icons
import { EventItem } from "@/context/DataContext"; // 导入 EventItem 类型

// 定义组件接收的 props 接口
interface EventTimelineProps {
  // 选中的用户的事件列表
  events: EventItem[];
  // TODO: 可选的时间范围 props
  // startTime?: string | null;
  // endTime?: string | null;
}

const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  // 在渲染前对 events 数组进行倒序排序
  const sortedEvents = React.useMemo(() => {
    // 创建一个副本以避免直接修改原始状态
    const eventsCopy = [...events];
    // 按照 timestamp 字段进行倒序排序
    eventsCopy.sort((a, b) => {
      const timestampA = new Date(a.timestamp).getTime();
      const timestampB = new Date(b.timestamp).getTime();
      return timestampB - timestampA; // 倒序排列 (最新的在前面)
    });
    return eventsCopy;
  }, [events]); // 当 events 状态改变时重新计算排序

  // Helper function to render event details based on typeData
  const renderEventDetails = (type: string, typeData: any): React.ReactElement => {
    if (!typeData) {
      return <div>N/A</div>;
    }

    switch (type) {
      case 'view':
        return (
          // View event details with clear labels and structure
          <div style={{ fontSize: '0.9em', color: '#333' }}>
            {typeData.pageTitle && <div style={{ marginBottom: '5px' }}><strong>Page Title:</strong> {typeData.pageTitle}</div>}
            {typeData.pageUrl && <div style={{ marginBottom: '5px' }}><strong>Page URL:</strong> <a href={typeData.pageUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>{typeData.pageUrl}</a></div>}
            {typeData.screenResolution && <div><strong>Screen Resolution:</strong> {typeData.screenResolution}</div>}
            {/* Add other 'view' specific details here with similar structure */}
          </div>
        );
      case 'click':
        return (
          // Click event details with emphasis on clicked elements
          <div style={{ fontSize: '0.9em', color: '#333' }}>
            {typeData.elementType && <div style={{ marginBottom: '5px' }}><strong>Element Type:</strong> {typeData.elementType}</div>}
            {typeData.clickedContent && <div style={{ marginBottom: '5px' }}><strong>Clicked Content:</strong> {typeData.clickedContent}</div>}
            {typeData.page && <div><strong>Page:</strong> {typeData.page}</div>}
            {/* Add other 'click' specific details here with similar structure */}
          </div>
        );
      case 'heartbeat':
        return (
          // Simple display for heartbeat event
          <div style={{ fontSize: '0.9em', color: '#555' }}>Heartbeat event.</div>
        );
      case 'console': // Example for console events
        return (
          <div style={{ fontSize: '0.9em', color: '#dc3545' }}>
            {typeData.message && <div><strong>Message:</strong> {typeData.message}</div>}
            {typeData.level && <div><strong>Level:</strong> {typeData.level}</div>}
            {/* Add other console specific details */}
          </div>
        );
      // Add more cases for other event types as needed
      default:
        // Fallback to JSON stringification for unknown types
        return <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(typeData, null, 2)}</pre>;
    }
  };

  // TODO: 根据 startTime 和 endTime 过滤 events 的逻辑可以在这里实现

  // Helper function to get icon based on event type
  // Added background and padding to make icons more prominent
  const getEventTypeIcon = (type: string): React.ReactElement | null => {
    switch (type.toLowerCase()) { // Use lower case for case-insensitive comparison
      case 'view':
        return <div style={{ backgroundColor: '#e9f5ff', borderRadius: '4px', padding: '3px', display: 'flex', alignItems: 'center' }}><FaEye size={14} style={{ color: '#007bff' }} /></div>; // Blue eye icon for view
      case 'click':
        return <div style={{ backgroundColor: '#eaf7ee', borderRadius: '4px', padding: '3px', display: 'flex', alignItems: 'center' }}><FaMousePointer size={14} style={{ color: '#28a745' }} /></div>; // Green mouse pointer for click
      case 'console': // Example icon for console events
      case 'heartbeat':
        return <FaHeartbeat size={14} style={{ marginRight: '5px', color: '#dc3545' }} />; // Red heartbeat for heartbeat
      default:
        return null; // No icon for unknown types
    }
  };

  return (
    <div
      className="panel"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {" "}
      {/* Apply the panel class and add flex column styles */}
      {/* Use div container to wrap the timeline and add flex-grow and overflow styles */}
      {/* <h3 style={{ display: "flex", alignItems: "center" }}>
        {" "}
        <FaHistory style={{ marginRight: "10px" }} /> 
        Event Timeline
      </h3> */}
      {/* 使用 div 容器来包裹时间线，并添加 flex-grow 和 overflow 样式 */}
      <div style={{ flexGrow: 1, overflow: "hidden" }}>
        {/* 检查是否有事件数据 */}
        {events.length === 0 ? (
          <p>没有找到相关的事件。</p> // 没有事件时的提示
        ) : (
          // 使用 ul 和 li 标签展示事件列表，并添加最大高度和滚动条样式，留出滚动条空间
          <ul
            style={{
              maxHeight: "100%",
              overflowY: "auto",
              paddingRight: "15px",
            }}
          >
            {sortedEvents.map((event) => (
              <li
                key={event._id} // 使用事件的 _id 作为 key
                style={{
                  marginBottom: "25px", // Increased vertical space between event items
                  padding: "10px", // 事件项内边距
                  borderLeft: "2px solid #ffb6c1", // 左侧蓝色时间线标记
                  backgroundColor: "#f8f8f8", // 事件项背景色
                  borderRadius: "4px", // 圆角
                  // maxWidth: '800px', // 新增：限制事件项的最大宽度
                  overflowX: "hidden", // 新增：隐藏横向滚动条
                  display: 'flex', // Use flexbox for layout
                  flexDirection: 'column', // Stack items vertically
                }}
              >
                {/* 事件时间 */}
                <div style={{ display: 'flex', alignItems: 'center', fontSize: "0.9em", color: "#555", marginBottom: "8px" }}> {/* Increased bottom margin */}
                  {getEventTypeIcon(event.type)} {/* Render icon based on event type */}
                  {getEventTypeIcon(event.type) && <span style={{ marginLeft: '8px' }}></span>} {/* Add space after icon if it exists */}
                  {event.timestamp ? dayjs(event.timestamp).format("YYYY-MM-DD HH:mm:ss") : "N/A"} {/* Display timestamp */}
                </div>
                {/* 事件详细信息 */}
                <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  {renderEventDetails(event.type, event.typeData)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default EventTimeline;
