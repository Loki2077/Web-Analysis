// src/components/UserList.tsx

'use client';

import React, { useMemo, useEffect, useCallback, useState } from 'react';
// import { FaUsers } from 'react-icons/fa'; // Import user icon
import dayjs from 'dayjs'; // 导入 dayjs
import { UserItem } from '@/context/DataContext'; // 导入 UserItem 类型

// 定义组件接收的 props 接口
interface UserListProps {
    userList: UserItem[]; // 接收 userList 作为 props
    selectedDomain: string | null; // 接收选中的域名作为 prop，可以是 null 或 string
    // 新增 prop: 用于传递在线用户数的回调函数
    onOnlineUserCountChange?: (domain: string, count: number) => void;
    // 新增 prop: 用于传递选中指纹的回调函数
    onSelectFingerprint?: (fingerprint: string | null) => void;
}

// 离线超时时间 (与 DataContext 中保持一致)
const OFFLINE_TIMEOUT_MS = 5 * 60 * 1000;

const UserList: React.FC<UserListProps> = ({
    userList,
    selectedDomain,
    onOnlineUserCountChange,
    onSelectFingerprint
}) => {

    // 定义 state 来跟踪当前选中的用户指纹
    const [internalSelectedFingerprint, setInternalSelectedFingerprint] = useState<string | null>(null);


    // // 当 filteredUsers 变化时，默认选中第一个用户
    // useEffect(() => {
    //     if (filteredUsers.length > 0) {
    //         handleUserClick(filteredUsers[0].fingerprint);
    //     } else {
    //         handleUserClick(null); // 如果没有用户，则取消选中
    //     }
    // }, [filteredUsers, handleUserClick]); // 依赖 filteredUsers 和 handleUserClick

    // 使用 useMemo 对用户列表进行筛选
    const filteredUsers = useMemo(() => {
        let users = [...userList]; // 创建 userList 的副本

        // 根据选中的域名过滤
        if (selectedDomain) {
            users = users.filter(user => user.domain === selectedDomain);
        }

        return users;
    }, [userList, selectedDomain]); // 依赖 userList 和 selectedDomain

    // 计算在线用户数并调用回调函数
    useEffect(() => {
        // 仅在 filteredUsers 变化时重新计算和传递总数
        const onlineUserCounts = new Map<string, number>();
        const now = dayjs();

        filteredUsers.forEach(user => { // 使用筛选后的用户列表进行计算
            if (user.lastSeen && user.domain) {
                const lastSeenTime = dayjs(user.lastSeen);
                if (now.diff(lastSeenTime, 'millisecond') < OFFLINE_TIMEOUT_MS) {
                    const currentCount = onlineUserCounts.get(user.domain) || 0;
                    onlineUserCounts.set(user.domain, currentCount + 1);
                }
            }
        });

        // 如果提供了回调函数，遍历计算出的总数并传递给父组件
        if (onOnlineUserCountChange) {
            onlineUserCounts.forEach((count, domain) => {
                onOnlineUserCountChange(domain, count);
            });
        }
        if (process.env.NEXT_PUBLIC_PROJECT_MODEL === 'dev') {
            console.log('[UserList] 在线用户数计算完成并传递');
        }

    }, [filteredUsers, onOnlineUserCountChange]); // 依赖 filteredUsers 和 onOnlineUserCountChange

    // 处理用户列表项点击事件
    const handleUserClick = useCallback((fingerprint: string) => {
        // 如果点击的是当前已经选中的指纹，则取消选中
        const newSelectedFingerprint = internalSelectedFingerprint === fingerprint ? null : fingerprint;
        setInternalSelectedFingerprint(newSelectedFingerprint); // 更新内部选中状态

        // 如果提供了回调函数，将选中的指纹传递给父组件
        if (onSelectFingerprint) {
            onSelectFingerprint(newSelectedFingerprint);
        }
        if (process.env.NEXT_PUBLIC_PROJECT_MODEL === 'dev') {
            console.log('[UserList] 选中用户指纹:', newSelectedFingerprint);
        }

    }, [internalSelectedFingerprint, onSelectFingerprint]);


    return (
        <div style={{ flexGrow: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}> {/* 添加 flex-grow 和 overflow, 以及 flexbox 垂直布局 */}
            {/* Existing h3 title - add icon here */}
            {/* <h3 style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', fontSize: '1.2em', color: 'var(--panel-title-color)', borderBottom: '1px solid var(--panel-title-border-color)', paddingBottom: '10px', flexShrink: 0 }}>
                <FaUsers style={{ marginRight: '10px' }} /> 
                Users
            </h3> */}
            {filteredUsers.length === 0 ? (
                <p>没有找到相关的用户。</p>
            ) : (
                // 使用 ul 和 li 标签展示用户数据
                <ul style={{ flexGrow: 1, overflowY: 'auto' }}> {/* 让 ul 占据剩余空间并滚动 */}
                    {filteredUsers.map((user, index) => (
                        <li
                            key={user._id}
                            // 添加点击事件处理函数
                            onClick={() => handleUserClick(user.fingerprint)}
                            // 根据选中状态添加样式，例如加粗或改变背景色
                            style={{
                                cursor: 'pointer',
                                fontWeight: user.fingerprint === internalSelectedFingerprint ? 'bold' : 'normal',
                                backgroundColor: user.fingerprint === internalSelectedFingerprint ? 'rgba(255, 204, 224, 0.08)' : '#fff', // 选中背景色
                                padding: '12px 16px',
                                marginBottom: '10px',
                                marginTop: index === 0 ? '10px' : '0',
                                borderRadius: '16px',
                                display: 'flex', // 使用 flexbox 布局内容
                                justifyContent: 'space-between', // 内容两端对齐
                                alignItems: 'center', // 垂直居中
                                border: user.fingerprint === internalSelectedFingerprint ? '2px solid #ffcce0' : '2px solid #f8f8f8', // 列表项边框

                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                if (user.fingerprint !== internalSelectedFingerprint) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 204, 224, 0.04)';
                                    e.currentTarget.style.borderColor = '#ffcce0';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (user.fingerprint !== internalSelectedFingerprint) {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                    e.currentTarget.style.borderColor = '#f8f8f8';
                                }
                            }}
                        >
                            {/* 左侧：IP 和 最近活动时间 */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ 
                                        fontSize: '0.8em', 
                                        color: '#a8d8ea',
                                        backgroundColor: 'rgba(168, 216, 234, 0.08)',
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}>🌐</span>
                                    <strong style={{ color: '#333' }}>{user.ip || 'N/A'}</strong> {/* IP */}
                                </div>
                                {/* 最近活动时间 */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ 
                                        fontSize: '0.8em', 
                                        color: '#98d982',
                                        backgroundColor: 'rgba(152, 217, 130, 0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '8px',
                                        fontWeight: '500'
                                    }}>⏰</span>
                                    <span style={{ fontSize: '0.85em', color: '#666' }}>
                                        {user.lastSeen ? dayjs(user.lastSeen).format('MM-DD HH:mm') : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* 右侧：指纹（部分） */}
                            <div style={{
                                backgroundColor: '#ffb3d1', // 可爱的粉色背景
                                color: '#fff', // 白色文字
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '0.75em',
                                fontWeight: '600',
                                fontFamily: 'monospace',
                                boxShadow: '0 2px 6px rgba(255, 204, 224, 0.12)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <span>🔐</span>
                                {/* 获取指纹前八位 */}
                                {user.fingerprint ? user.fingerprint.substring(0, 8) : 'N/A'}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UserList;
