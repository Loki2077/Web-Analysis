// src/context/DataContext.tsx
'use client'; // 标记这是一个客户端文件

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

// import GoEasy from 'goeasy'; // 导入 GoEasy 类型定义
const GoEasy = require('goeasy'); // 使用 require 导入 GoEasy
import { getGoEasyInstance } from '@/utils/goeasy'; // 导入获取 GoEasy 客户端实例的函数

// 开发模式 获取（form .evn）
const model = process.env.NEXT_PUBLIC_PROJECT_MODE

// 定义数据类型或接口
// 请根据您的实际数据结构进行完善
export type DomainItem = {
    _id: string;
    domain: string;
    [key: string]: any
};
export type UserItem = {
    _id: string;
    fingerprint: string;
    domain: string;
    ip: string;
    createdAt: string;
    lastSeen: string;
    status: 'online' | 'offline';
    [key: string]: any
};
export type EventItem = {
    _id: string;
    fingerprint: string;
    domain: string;
    type: string;
    typeData: any;
    timestamp: string;
    [key: string]: any
};
export type DetailItem = {
    _id: string;
    fingerprint: string;
    ip: string;
    os: string;
    browser: { name: string; version: string };
    timezone: string;
    language: string;
    referrer: string;
    location: any;
    createdAt: string;
    lastSeen: string;
    notes: string;
    [key: string]: any
};

type DomainData = DomainItem[];
type UserData = UserItem[];
type EventData = EventItem[];
type DetailData = DetailItem[];

// 定义 Context 的 Value 类型
interface DataContextValue {
    domainList: DomainData;
    userList: UserData;
    eventList: EventData;
    detailList: DetailData;
}

// 创建 Context 对象
const DataContext = createContext<DataContextValue | undefined>(undefined);

interface DataProviderProps {
    children: ReactNode;
}

// 请替换为您实际的数据库名称
const DATABASE_NAME = process.env.MONGODB_DATABASENAME || 'web-analysis';

// 创建 DataProvider 组件
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
    const [domainList, setDomainList] = useState<DomainData>([]);
    const [userList, setUserList] = useState<UserData>([]);
    const [eventList, setEventList] = useState<EventData>([]);
    const [detailList, setDetailList] = useState<DetailData>([]);
    // websocket 订阅 通道
    const channelName = process.env.NEXT_PUBLIC_GOEASY_CHANNEL as string;

    useEffect(() => {
        let goEasy: any | undefined; // 声明 goEasy 变量，类型为 any 或 undefined
        // 获取初始数据 (domain, user, event, detail) 逻辑 ...
        // 在这些 fetch 请求的 .then 回调中，确保调用 setDomainList, setUserList, setEventList, setDetailList
        fetch(`/api/mongodb?action=fetchData&dbName=${DATABASE_NAME}&collectionName=domain`)
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    const processedDomainData: DomainItem[] = data.data.map((item: any) => ({
                        ...item,
                        onlineUsers: 0, // 初始化统计字段
                        eventCount: 0,
                    }));
                    setDomainList(processedDomainData);
                    if (model === 'dev') {
                        console.log('[DataProvider] 域名数据加载成功:', data.data.length, '条记录');
                    }
                } else {
                    console.error('[DataProvider] 加载域名数据失败或数据格式错误:', data);
                    setDomainList([]); // 失败时清空或保持为空
                }
            })
            .catch(error => {
                console.error('[DataProvider] 获取域名数据时出错:', error);
                setDomainList([]); // 错误时清空或保持为空
            });


        // 获取 User 数据
        fetch(`/api/mongodb?action=fetchData&dbName=${DATABASE_NAME}&collectionName=user`)
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setUserList(data.data);
                    if (model === 'dev') {
                        console.log('[DataProvider] 用户数据加载成功:', data.data.length, '条记录');
                    }
                } else {
                    console.error('[DataProvider] 加载用户数据失败或数据格式错误:', data);
                    setUserList([]);
                }
            })
            .catch(error => {
                console.error('[DataProvider] 获取用户数据时出错:', error);
                setUserList([]);
            });

        // 获取 Event 数据
        fetch(`/api/mongodb?action=fetchData&dbName=${DATABASE_NAME}&collectionName=event`)
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    // console.warn('工程测试' + JSON.stringify(data.data, null, 2)); // 使用 JSON.stringify 将对象转换为 JSON 字符串，null 和 2 用于格式化输出
                    // /api/mongodb?action=fetchData&dbName=web-analysis&collectionName=event
                    setEventList(data.data);
                    if (model === 'dev') {
                        console.log('[DataProvider] 事件数据加载成功:', data.data.length, '条记录');
                    }
                } else {
                    if (model === 'dev') {
                        console.error('[DataProvider] 加载事件数据失败或数据格式错误:', data);
                    }
                    setEventList([]);
                }
            })
            .catch(error => {
                console.error('[DataProvider] 获取事件数据时出错:', error);
                setEventList([]);
            });

        // 获取 Detail 数据
        fetch(`/api/mongodb?action=fetchData&dbName=${DATABASE_NAME}&collectionName=details`)
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.data)) {
                    setDetailList(data.data);
                    if (model === 'dev') {
                        console.log('[DataProvider] 详情数据加载成功:', data.data.length, '条记录');
                    }

                } else {
                    if (model === 'dev') {
                        console.error('[DataProvider] 加载详情数据失败或数据格式错误:', data);
                    }
                    setDetailList([]);
                }
            })
            .catch(error => {
                console.error('[DataProvider] 获取详情数据时出错:', error);
                setDetailList([]);
            });

        try {
            goEasy = getGoEasyInstance();
            if (model === 'dev') {
                console.log('[DataProvider] GoEasy 客户端实例获取成功');
            }

            // 订阅频道，使用 pubsub.subscribe
            goEasy.pubsub.subscribe({
                channel: channelName,
                onMessage: function (message: any) {
                    if (model === 'dev') {
                        console.log("[DataProvider] 接收到 GoEasy 消息 - Channel:", message.channel, "内容:", message.content);
                    }
                    try {
                        const receivedData = JSON.parse(message.content);

                        // 无论什么 type，event 数据都要更新（插入）
                        if (receivedData) {
                            // 使用不可变方式更新 eventList
                            setEventList(prevList => [...prevList, receivedData as EventItem]);
                            if (model === 'dev') {
                                console.log('[DataProvider] 事件数据更新：插入新事件');
                            }
                        }

                        // 如果 type 是 'view'，更新 user, detail, domain
                        if (receivedData && receivedData.type === 'view') {
                            const { domain, fingerprint, ip, ...otherData } = receivedData;

                            // 更新 domainList: 存在相同域名则不更新，不存在则插入
                            if (domain) {
                                setDomainList(prevList => {
                                    const domainExists = prevList.some(item => item.domain === domain);
                                    if (!domainExists) {
                                        if (model === 'dev') {
                                            console.log('[DataProvider] 域名数据更新：插入新域名', domain);
                                        }
                                        // 可以在后端生成并返回 _id，或者在这里生成临时ID
                                        const newDomain: DomainItem = {
                                            _id: Math.random().toString(36).substring(7), // 临时ID
                                            domain: domain,
                                            onlineUsers: 0, // 新插入的域名统计信息先设为0
                                            eventCount: 0,
                                            ...otherData // 如果消息中包含其他domain相关字段
                                        };
                                        return [...prevList, newDomain];
                                    }
                                    if (model === 'dev') {
                                        console.log('[DataProvider] 域名数据更新：域名已存在，不插入');
                                    }
                                    return prevList;
                                });
                            }

                            // 更新 userList: fingerprint, ip, domain 都相同则更新 lastSeen，否则插入
                            if (fingerprint && ip && domain) {
                                setUserList(prevList => {
                                    const existingUserIndex = prevList.findIndex(user =>
                                        user.fingerprint === fingerprint && user.ip === ip && user.domain === domain
                                    );

                                    if (existingUserIndex > -1) {
                                        // 更新 lastSeen
                                        if (model === 'dev') {
                                            console.log('[DataProvider] 用户数据更新：更新 existing user lastSeen', fingerprint);
                                        }
                                        const updatedUsers = [...prevList];
                                        updatedUsers[existingUserIndex] = {
                                            ...updatedUsers[existingUserIndex],
                                            lastSeen: receivedData.timestamp, // 使用消息中的时间戳更新 lastSeen
                                            status: 'online' // 收到 view 消息，标记为在线
                                        };
                                        return updatedUsers;
                                    } else {
                                        // 插入新用户，标记在线                                        
                                        if (model === 'dev') {
                                            console.log('[DataProvider] 用户数据更新：插入新用户', fingerprint);
                                        }
                                        const newUser: UserItem = {
                                            _id: Math.random().toString(36).substring(7), // 临时ID
                                            fingerprint: fingerprint,
                                            ip: ip,
                                            domain: domain,
                                            createdAt: receivedData.timestamp, // 使用消息中的时间戳作为 createdAt
                                            lastSeen: receivedData.timestamp, // 使用消息中的时间戳作为 lastSeen
                                            status: 'online', // 新用户，标记为在线
                                            ...otherData // 如果消息中包含其他user相关字段
                                        };
                                        return [...prevList, newUser];
                                    }
                                });
                            }

                            // detail 数据：有这个 fingerprint 就更新，没有就插入新的
                            if (fingerprint) {
                                setDetailList(prevList => {
                                    const existingDetailIndex = prevList.findIndex(detail => detail.fingerprint === fingerprint);

                                    if (existingDetailIndex > -1) {
                                        // 更新详情数据
                                        if (model === 'dev') {
                                            console.log('[DataProvider] 详情数据更新：更新 existing detail', fingerprint);
                                        }
                                        const updatedDetails = [...prevList];
                                        updatedDetails[existingDetailIndex] = {
                                            ...updatedDetails[existingDetailIndex],
                                            // Selectively update fields from receivedData,
                                            // excluding location to preserve initial value from DB
                                            ip: receivedData.ip !== undefined ? receivedData.ip : updatedDetails[existingDetailIndex].ip,
                                            os: receivedData.os !== undefined ? receivedData.os : updatedDetails[existingDetailIndex].os,
                                            browser: receivedData.browser !== undefined ? receivedData.browser : updatedDetails[existingDetailIndex].browser,
                                            timezone: receivedData.timezone !== undefined ? receivedData.timezone : updatedDetails[existingDetailIndex].timezone,
                                            language: receivedData.language !== undefined ? receivedData.language : updatedDetails[existingDetailIndex].language,
                                            referrer: receivedData.referrer !== undefined ? receivedData.referrer : updatedDetails[existingDetailIndex].referrer,
                                            // location is explicitly excluded
                                            lastSeen: receivedData.timestamp !== undefined ? receivedData.timestamp : updatedDetails[existingDetailIndex].lastSeen, // Update lastSeen
                                        };
                                        return updatedDetails;
                                    } else {
                                        // 插入新详情数据
                                        // console.log('[DataProvider] 详情数据更新：插入新详情', fingerprint);
                                        if (model === 'dev') {
                                            console.log('[DataProvider] 详情数据更新：插入新详情', fingerprint);
                                        }
                                        const newDetail: DetailItem = {
                                            _id: Math.random().toString(36).substring(7), // 临时ID
                                            ...receivedData // 使用整个消息作为新详情数据
                                        };
                                        return [...prevList, newDetail];
                                    }
                                });
                            }
                        }

                        // 处理 'heartbeat' 类型消息，更新用户状态
                        if (receivedData && receivedData.type === 'heartbeat') {
                            const { fingerprint } = receivedData;
                            if (fingerprint) {
                                setUserList(prevList => {
                                    const userIndex = prevList.findIndex(user => user.fingerprint === fingerprint);
                                    if (userIndex > -1) {
                                        if (model === 'dev') {
                                            console.log('[DataProvider] 用户心跳更新：更新用户状态和 lastSeen', fingerprint);
                                        }
                                        const updatedUsers = [...prevList];
                                        updatedUsers[userIndex] = {
                                            ...updatedUsers[userIndex],
                                            lastSeen: receivedData.timestamp, // 更新 lastSeen
                                            status: 'online', // 收到心跳，标记为在线
                                        };
                                        return updatedUsers;
                                    }
                                    if (model === 'dev') {
                                    }
                                    // 如果收到心跳但用户不存在，可能需要决定是否插入新用户或忽略 
                                    console.log('[DataProvider] 收到心跳，但用户不存在于列表中', fingerprint);
                                    return prevList; // 暂时忽略不存在的用户心跳
                                });
                            }
                        }

                        // 测试事件数量是否随着 GoEasy 消息的到来而增加。
                        // setEventList(prevList => {
                        //     const newList = [...prevList, receivedData as EventItem];
                        //     console.warn('[DataProvider] eventList 更新:', newList.length, '条记录');
                        //     return newList;
                        // });


                    } catch (e) {
                        console.error('[DataProvider] 解析 GoEasy 消息错误:', e);
                    }
                },
                onSuccess: function () {
                    if (model === 'dev') {
                        console.log('[DataProvider] GoEasy 频道订阅成功:', channelName);
                    }
                },
                onFailed: function (error: any) {
                    if (model === 'dev') {
                        console.error('[DataProvider] GoEasy 频道订阅失败:', error);
                    }
                }
            });

        } catch (error) {
            if (model === 'dev') {
                console.error('[DataProvider] 初始化 GoEasy 或订阅频道失败:', error);
            }

        }

        // 清理函数 (用于 GoEasy 取消订阅)
        return () => {
            // 确保 goEasy 实例存在且 pubsub 模块可用
            if (typeof window !== 'undefined' && goEasy && goEasy.pubsub) {
                // 取消订阅，使用 pubsub.unsubscribe
                goEasy.pubsub.unsubscribe({
                    channel: channelName,
                    onSuccess: function () {
                        if (model === 'dev') {
                            console.log('[DataProvider] GoEasy 频道取消订阅成功:', channelName);
                        }

                    },
                    onFailed: function (error: any) {
                        if (model === 'dev') {
                            console.error('[DataProvider] GoEasy 频道取消订阅失败:', error);
                        }


                    }
                });
                console.log('[DataProvider] GoEasy 连接清理完成');
            }
        };
    }, [channelName]); // 添加 channelName 到依赖数组，确保 channelName 改变时重新订阅

    return (
        <DataContext.Provider value={{
            domainList, // 提供 useMemo 的返回值
            userList,
            eventList,
            detailList,
        }}>
            {children}
        </DataContext.Provider>
    );

};


// 自定义 hook 方便消费 Context
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData 必须在 DataProvider 内部使用');
    }
    return context;
};

// 导出演示 Context 对象 (可选，通常通过 useData hook 访问)
export default DataContext;