// src/components/DomainList.tsx
"use client";

// 移除未使用的 useData 导入
import React from "react"; // 导入 useMemo
// import { FaGlobe } from "react-icons/fa"; // Import globe icon from react-icons/fa
import { DomainItem, EventItem } from "@/context/DataContext"; // 导入必要的类型

import dayjs from "dayjs"; // 导入 dayjs
import utc from "dayjs/plugin/utc"; // 导入 UTC 插件
import timezone from "dayjs/plugin/timezone"; // 导入时区插件

dayjs.extend(utc);
dayjs.extend(timezone);

interface DomainListProps {
  selectedDomain: string | null;
  onSelectDomain: (domain: string) => void;
  // 新增 props: 从父组件接收的事件总数和在线用户数
  domainEventCounts: Map<string, number>;
  domainOnlineUserCounts: Map<string, number>;
  // 如果 DomainList 仍然需要原始 domainList 和 userList，保留这些 props
  domainList: DomainItem[];
  userList: any; // 添加 userList 类型定义
  eventList: EventItem[];
}

const DomainList: React.FC<DomainListProps> = ({
  selectedDomain,
  onSelectDomain,
  domainEventCounts, // 接收事件总数
  domainOnlineUserCounts, // 接收在线用户数
  domainList, // 保留原始 domainList
  userList, // 添加 userList 参数
  eventList, // 添加 eventList 参数
}) => {
  return (
    <div style={{ flexGrow: 1, overflow: "hidden" }}>
      {" "}
      {/* 添加 flex-grow 和 overflow */}
      {/* <h3 style={{ display: "flex", alignItems: "center" }}>
        <FaGlobe style={{ marginRight: "8px" }} />
        Domains
      </h3> */}
      {domainList.length === 0 ? (
        <p>暂无域名数据。</p>
      ) : (
        <ul
          style={{ maxHeight: "100%", overflowY: "auto", paddingRight: "15px" }}
        >
          {" "}
          {/* 添加最大高度和滚动条样式，留出滚动条空间 */}
          {domainList.map((domainItem) => {
            // 直接从 props 获取统计信息
            const eventCount = domainEventCounts.get(domainItem.domain) || 0;
            const onlineUsers =
              domainOnlineUserCounts.get(domainItem.domain) || 0;

            return (
              <li
                key={domainItem._id}
                style={{
                  cursor: "pointer",
                  fontWeight:
                    domainItem.domain === selectedDomain ? "bold" : "normal",
                  padding: "12px 16px",
                  marginBottom: "10px",
                  marginTop: domainItem === domainList[0] ? "10px" : "0",
                  border: domainItem.domain === selectedDomain ? "2px solid #ffcce0" : "2px solid #f8f8f8",
                  borderRadius: "16px",
                  width: "100%",
                  backgroundColor: domainItem.domain === selectedDomain ? "rgba(255, 204, 224, 0.08)" : "#fff",

                  transition: "all 0.2s ease",
                }}
                onClick={() => onSelectDomain(domainItem.domain)}
                onMouseEnter={(e) => {
                  if (domainItem.domain !== selectedDomain) {
                    e.currentTarget.style.backgroundColor = "rgba(255, 204, 224, 0.04)";
                    e.currentTarget.style.borderColor = "#ffcce0";
                  }
                }}
                onMouseLeave={(e) => {
                  if (domainItem.domain !== selectedDomain) {
                    e.currentTarget.style.backgroundColor = "#fff";
                    e.currentTarget.style.borderColor = "#f8f8f8";
                  }
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {" "}
                  {/* Use flexbox for single row */}
                  <span
                    style={{
                      flexGrow: 1,
                      flexShrink: 1,
                      flexBasis: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginRight: "10px",
                    }}
                  >
                    {" "}
                    {/* Domain with overflow ellipsis */}
                    <strong>{domainItem.domain}</strong>
                  </span>
                  <span
                    style={{
                      fontSize: "0.85em",
                      color: "#ffb3d1",
                      display: "flex",
                      alignItems: "center",
                      marginRight: "8px",
                      flexShrink: 0,
                      backgroundColor: "rgba(255, 179, 209, 0.08)",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {" "}
                    {/* Online Users Icon and Count */}
                    🌟 {onlineUsers}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85em",
                      color: "#a8d8ea",
                      display: "flex",
                      alignItems: "center",
                      flexShrink: 0,
                      backgroundColor: "rgba(168, 216, 234, 0.08)",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {" "}
                    {/* Event Count Icon and Count */}
                    ✨ {eventCount}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default DomainList;
