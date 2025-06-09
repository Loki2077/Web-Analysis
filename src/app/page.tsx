// src/app/page.tsx
"use client";

import { useData } from "@/context/DataContext"; // 导入 useData 钩子
import React, { useState, useCallback, useMemo } from "react";
// 导入需要使用的组件
import DomainList from "@/components/DomainList";
import UserList from "@/components/UserList";
// 移除未使用的 useIp 导入
import UserFingerprintPanel from "@/components/UserFingerprintPanel";
import EventTimeline from "@/components/EventTimeline";
import DynamicTitle from "@/components/DynamicTitle"; // 导入动态标题组件
import { useEffect } from "react"; // 导入 useEffect
// 导入所需的数据类型
import { UserItem } from "@/context/DataContext";
import { FaUsers, FaGlobe, FaFingerprint, FaHistory } from "react-icons/fa"; // Import a clock icon from react-icons/fa
// Removed the import of 'ip' prop as it will be fetched on the client
const HomePage: React.FC = () => {
    // 从 DataContext 获取数据
    // 从 Context 获取 IP 地址
    // 新增本地状态来存储要显示的 IP
    const [displayedIp, setDisplayedIp] = useState<string | null>(null);
    // 移除未使用的 contextIp 变量
    const { eventList, domainList, userList, detailList } = useData();

    // State 用于管理选中的域名
    const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
    // State 用于管理选中的用户指纹
    const [selectedFingerprint, setSelectedFingerprint] = useState<string | null>(
        null
    );
    // State 用于管理选中的用户对象
    const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
    
    // State 用于管理当前激活的标签页
    const [activeTab, setActiveTab] = useState<string>('domains');

    // State 用于存储每个域名的事件总数
    const [domainEventCounts, setDomainEventCounts] = useState<
        Map<string, number>
    >(new Map());
    // State 用于存储每个域名的在线用户数
    const [domainOnlineUserCounts, setDomainOnlineUserCounts] = useState<
        Map<string, number>
    >(new Map());

    // 使用第三方API获取用户的IP地址
    useEffect(() => {
        const fetchIp = async () => {
            try {
                // 尝试多个第三方IP获取服务
                const services = [
                    'https://api.ipify.org?format=json',
                    'https://ipapi.co/json/',
                    'https://api.ip.sb/jsonip'
                ];
                
                for (const service of services) {
                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 5000);
                        
                        const response = await fetch(service, { 
                            method: 'GET',
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (response.ok) {
                            const data = await response.json();
                            // 根据不同服务的响应格式提取IP
                            const ip = data.ip || data.query || data.IPv4 || data.address;
                            if (ip) {
                                setDisplayedIp(ip);
                                return;
                            }
                        }
                    } catch (serviceError) {
                        console.warn(`Service ${service} failed:`, serviceError);
                        continue; // 尝试下一个服务
                    }
                }
                
                // 如果所有服务都失败了
                setDisplayedIp("无法获取IP");
            } catch (error) {
                console.error("Error fetching IP address:", error);
                setDisplayedIp("获取IP失败");
            }
        };
        fetchIp();
    }, []); // 组件挂载时执行一次

    // Use effect to calculate domain event counts when eventList changes
    useEffect(() => {
        const counts = new Map<string, number>();
        if (eventList) {
            eventList.forEach((event) => {
                const domain = event.domain;
                counts.set(domain, (counts.get(domain) || 0) + 1);
            });
        }
        setDomainEventCounts(counts);

        if (process.env.NEXT_PUBLIC_PROJECT_MODE === "dev") {
            console.log("[Page] Calculated domain event counts:", counts);
        }
    }, [eventList]); // 依赖 eventList 的变化

    // Use effect to calculate domain event counts when eventList changes
    useEffect(() => {
        const counts = new Map<string, number>();
        if (eventList) {
            eventList.forEach((event) => {
                const domain = event.domain;
                counts.set(domain, (counts.get(domain) || 0) + 1);
            });
        }
        setDomainEventCounts(counts);

        if (process.env.NEXT_PUBLIC_PROJECT_MODE === "dev") {
            console.log("[Page] Calculated domain event counts:", counts);
        }
    }, [eventList]); // Dependency on eventList

    // 处理用户列表选中指纹的函数
    const handleSelectFingerprint = useCallback(
        (fingerprint: string | null) => {
            setSelectedFingerprint(fingerprint);
            // 根据指纹找到对应的用户对象并存储
            const user = fingerprint
                ? userList.find((u) => u.fingerprint === fingerprint) || null
                : null;
            setSelectedUser(user);
        },
        [userList]
    ); // 依赖 userList来查找用户对象

    // 处理域名在线用户计数变化的函数
    const handleOnlineUserCountChange = useCallback(
        (domain: string, count: number) => {
            setDomainOnlineUserCounts((prevCounts) => {
                const newCounts = new Map(prevCounts);
                newCounts.set(domain, count);
                return newCounts;
            });
        },
        []
    );


    // State 用于管理事件时间线的时间范围（暂未使用）
    // const [startDate, setStartDate] = useState<string | null>(null);
    // const [endDate, setEndDate] = useState<string | null>(null);

    // 根据选中的指纹筛选 detailList
    const filteredDetails = useMemo(() => {
        if (!selectedFingerprint || !detailList) {
            return []; // 如果没有选中指纹或 detailList 不存在，返回空数组
        }
        return detailList.filter(
            (detail) => detail.fingerprint === selectedFingerprint
        );
    }, [detailList, selectedFingerprint]); // 依赖 detailList 和 selectedFingerprint

    // 根据选中的指纹和时间范围筛选事件列表
    const filteredEventsForTimeline = useMemo(() => {
        let events = eventList;

        // 根据选中的指纹过滤
        if (selectedFingerprint) {
            events = events.filter(
                (event) => event.fingerprint === selectedFingerprint
            );
        }

        // TODO: 根据时间范围过滤逻辑待实现
        // if (startDate && endDate) {
        //     events = events.filter(event => {
        //         const timestamp = dayjs(event.timestamp);
        //         return timestamp.isAfter(dayjs(startDate).startOf('day')) && timestamp.isBefore(dayjs(endDate).endOf('day'));
        //     });
        // }

        return events;
    }, [eventList, selectedFingerprint]); // 依赖 eventList, selectedFingerprint

    return (
        // 页面整体容器，应用页面背景色和内边距样式
        <div className="page-container">
            {/* 动态标题组件 */}
            <DynamicTitle 
                selectedDomain={selectedDomain} 
                selectedFingerprint={selectedFingerprint} 
                activeTab={activeTab} 
            />
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px", // Vertical and horizontal padding
                    backgroundColor: "#ffffff", // Set background color to white
                    marginBottom: "20px", // Space below the header
                    border: "1px solid var(--border-color)", // Add a subtle border
                    borderRadius: "16px", // Rounded corners consistent with panels
                }}
            >
                {/* Title */}
                <span
                    style={{ fontSize: "1.5em", fontWeight: "bold", marginRight: "20px" }}
                >
                    <span style={{ color: "var(--text-color)" }}>Web Analysis</span> {/* Apply theme text color */}
                </span>
                {/* IP Address */}
                <span style={{ fontSize: "1em", color: "var(--text-color)" }}> {/* Apply theme text color */}
                    My IP: {displayedIp || "Fetching..."}
                </span>
                {/* 使用 displayedIp */}
            </div>

            {/* Main Layout using Flexbox */}
            <div className="main-layout">
                {/* 左侧列 */}
                <div className="left-column">
                    <div
                        className="left-panels-container"
                        style={{ display: "flex", flexDirection: "column", gap: "20px" }}
                    >
                        {/* MONITORED DOMAINS 面板 */}
                        <div className="panel panel-domain">
                            {/* 面板标题 */}
                            {/* <h3>MONITORED DOMAINS</h3> */}
                            <h3 
                                style={{ 
                                    display: "flex", 
                                    alignItems: "center", 
                                    cursor: "pointer",
                                    color: activeTab === 'domains' ? 'var(--primary-color)' : 'var(--text-color)'
                                }}
                                onClick={() => setActiveTab('domains')}
                            >
                                <FaGlobe style={{ marginRight: "8px" }} />
                                Domains
                            </h3>
                            {/* DomainList 组件 */}
                            <DomainList
                                selectedDomain={selectedDomain}
                                onSelectDomain={setSelectedDomain}
                                domainEventCounts={domainEventCounts}
                                domainOnlineUserCounts={domainOnlineUserCounts}
                                domainList={domainList}
                                userList={userList}
                                eventList={eventList}
                            />
                        </div>

                        {/* ONLINE USERS 面板 */}
                        <div className="panel">
                            {/* 面板标题 */}
                            {/* <h3>ONLINE USERS</h3> */}
                            <h3 
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    marginBottom: '15px', 
                                    fontSize: '1.2em', 
                                    borderBottom: '1px solid var(--panel-title-border-color)', 
                                    paddingBottom: '10px', 
                                    flexShrink: 0,
                                    cursor: 'pointer',
                                    color: activeTab === 'users' ? 'var(--primary-color)' : 'var(--text-color)'
                                }}
                                onClick={() => setActiveTab('users')}
                            >
                                <FaUsers style={{ marginRight: '10px' }} />
                                Users
                            </h3>
                            {/* UserList 组件 */}
                            <UserList
                                userList={userList}
                                selectedDomain={selectedDomain}
                                onSelectFingerprint={handleSelectFingerprint}
                                onOnlineUserCountChange={handleOnlineUserCountChange}
                            />
                        </div>
                    </div>
                </div>

                {/* 中间列 */}
                <div className="middle-column">
                    <div className="panel">
                        {/* 面板标题 */}
                        {/* <h3>USER FINGERPRINT</h3> */}
                        <h3 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                cursor: 'pointer',
                                color: activeTab === 'fingerprint' ? 'var(--primary-color)' : 'var(--text-color)'
                            }}
                            onClick={() => setActiveTab('fingerprint')}
                        >
                            <FaFingerprint style={{ marginRight: '8px' }} /> {/* Icon with right margin */}
                            User Fingerprint
                        </h3>
                        {/* 根据是否选中用户指纹来条件渲染 UserFingerprintPanel */}
                        {selectedFingerprint ? (
                            <UserFingerprintPanel
                                user={selectedUser}
                                details={filteredDetails}
                            />
                        ) : (
                            <p>请选择一个用户查看详情。</p> // 没有选中用户时的提示
                        )}
                    </div>
                </div>

                {/* 右侧列 */}
                <div className="right-column">
                    <div className="panel" style={{ maxWidth: "800px" }}>
                        {/* 面板标题 */}
                        {/* <h3>EVENT TIMELINE</h3> */}
                        <h3 
                            style={{ 
                                display: "flex", 
                                alignItems: "center",
                                cursor: 'pointer',
                                color: activeTab === 'events' ? 'var(--primary-color)' : 'var(--text-color)'
                            }}
                            onClick={() => setActiveTab('events')}
                        >
                            <FaHistory style={{ marginRight: "10px" }} />
                            Event Timeline
                        </h3>
                        {/* 根据是否选中用户指纹来条件渲染 EventTimeline */}
                        {selectedFingerprint ? (
                            <EventTimeline
                                events={filteredEventsForTimeline}
                            // startTime={startDate}
                            // endTime={endDate}
                            />
                        ) : (
                            <p>请选择一个用户查看事件时间线。</p> // 没有选中用户时的提示
                        )}
                    </div>
                </div>
            </div>
            <script src="/qiqi.js" async />
        </div>
    );
};

export default HomePage;
