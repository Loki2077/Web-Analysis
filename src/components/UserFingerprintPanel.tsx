// src/components/UserFingerprintPanel.tsx

'use client'; // Added 'use client' directive

import React from 'react';
import dayjs from 'dayjs'; // 导入 dayjs 用于处理时间
import { useState } from 'react'; // Import useState
import { DetailItem, UserItem } from '@/context/DataContext'; // 导入所需的数据类型
import { useToast } from '@/components/CuteToast'; // 导入可爱Toast组件

// 定义组件接收的 props 接口
// import { Fragment } from 'react'; // Imported Fragment
// 导入所需的图标
// import { FaFingerprint, FaGlobe, FaDesktop, FaChrome, FaLanguage, FaClock, FaLink, FaUser, FaEdit } from 'react-icons/fa';
import { FaGlobe, FaDesktop, FaChrome, FaLanguage, FaClock, FaLink, FaUser, FaEdit } from 'react-icons/fa';

interface UserFingerprintPanelProps {
    // 选中的用户对象，可能为 null
    user: UserItem | null;
    // 与该用户相关的 detail 数据数组
    details: DetailItem[];
}

const UserFingerprintPanel: React.FC<UserFingerprintPanelProps> = ({ user, details }) => {
    // 初始化Toast管理器
    const { showToast, ToastContainer } = useToast();

    // State for editing notes
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [editedNotes, setEditedNotes] = useState('');

    // 从 user 对象中获取 IP 和完整指纹，如果 user 为 null 则显示 'N/A'
    const ip = user?.ip || 'N/A';
    const fingerprint = user?.fingerprint || 'N/A';

    // 从 details 数组中提取详细信息 - 假设 details 数组包含 DetailItem 对象，直接访问字段
    const latestDetail = details.length > 0 ? details[0] : null; // 使用数组的第一个元素（可以根据实际需求调整，例如查找最新的一个）

    // **修改：优化 location 提取逻辑**
    const locationData = latestDetail?.location;

    let locationDisplay = 'N/A';
    if (locationData) {
        if (typeof locationData === 'string') {
            // 如果 location 是字符串，直接显示
            locationDisplay = locationData;
        } else if (typeof locationData === 'object') {
            // 如果 location 是对象
            if (locationData.displayName) {
                // 优先显示 displayName
                locationDisplay = locationData.displayName;
            } else if (locationData.placeName) {
                // 如果没有 displayName，显示 placeName
                locationDisplay = locationData.placeName;
            } else if (locationData.latitude?.$numberDouble !== undefined && locationData.longitude?.$numberDouble !== undefined) {
                // 如果都没有，显示经纬度
                locationDisplay = `${locationData.latitude.$numberDouble}, ${locationData.longitude.$numberDouble}`;
            }
        }
    }
    // 修改：提取并格式化浏览器信息
    const browser = latestDetail?.browser;
    const browserDisplay = browser ? `${browser.name || 'Unknown'} ${browser.version || ''}`.trim() : 'N/A'; // 提取 name 和 version 并格式化
    const system = latestDetail?.os || 'N/A'; // 提取 os
    // const screenResolution = latestDetail?.screenResolution || 'N/A'; // 提取 screenResolution
    const language = latestDetail?.language || 'N/A'; // 提取 language
    const timezone = latestDetail?.timezone || 'N/A'; // 提取 timezone
    const referrer = latestDetail?.referrer || 'N/A'; // 提取 referrer
    // const currentPage = latestDetail?.pageTitle || 'N/A'; // 提取 pageTitle
    const notes = latestDetail?.notes || ''; //提取 notes

    // 获取首次访问和最后访问时间
    // 假设 UserItem 中包含了 firstSeen 和 lastSeen 属性
    const firstVisit = user?.createdAt ? dayjs(user.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A';
    const lastVisit = user?.lastSeen ? dayjs(user.lastSeen).format('YYYY-MM-DD HH:mm') : 'N/A';


    // <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5em', fontWeight: 'bold', color: 'var(--text-color)' }}>
    //     {/* User Info Heading */}
    //     <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5em', fontWeight: 'bold', color: 'var(--text-color)' }}>
    //         <strong>用户信息</strong> {/* Added "用户信息" text */}
    //         <FaUser style={{ marginLeft: '8px', fontSize: '1.2em' }} /> {/* Icon next to title */}
    //     </div>
    // </div>

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: '520px', maxWidth: '645px' }}> {/* Main container for fingerprint details with increased gap and max width */}
            {/* Conditionally render content based on whether a user is selected */}
            {user ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* User Info 备注 */}
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1em', fontWeight: 'bold', color: 'var(--text-color)' }}>
                        {/* Notes Section */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', fontSize: '1.5em', fontWeight: 'bold', color: 'var(--text-color)' }}>
                            <FaUser style={{ marginLeft: '8px', fontSize: '1em' }} /> {/* Icon next to title */}
                            <strong>备注:</strong> {/* Added "用户信息" text */}
                            {isEditingNotes ? (
                                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1, marginLeft: '10px' }}>
                                    <input
                                        type="text"
                                        value={editedNotes}
                                        onChange={(e) => setEditedNotes(e.target.value)}
                                        style={{
                                            flexGrow: 1,
                                            padding: '12px 16px',
                                            marginRight: '8px',
                                            borderRadius: '12px',
                                            border: '2px solid #ffcce0',
                                            fontSize: '14px',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            backgroundColor: '#fff',
                                            boxShadow: '0 2px 8px rgba(255, 204, 224, 0.1)'
                                        }}
                                        onFocus={(e) => {
                                             e.target.style.borderColor = '#ffb3d1';
                                             e.target.style.boxShadow = '0 4px 12px rgba(255, 179, 209, 0.2)';
                                         }}
                                         onBlur={(e) => {
                                             e.target.style.borderColor = '#ffcce0';
                                             e.target.style.boxShadow = '0 2px 8px rgba(255, 204, 224, 0.1)';
                                         }}
                                    />
                                    <button
                                        onClick={async () => {
                                            // Implement save logic using the new update-notes API
                                            if (!latestDetail?._id) {
                                                console.error("Cannot save notes: Detail _id is missing.");
                                                showToast("保存失败: 缺少用户详情ID 🥺", 'error');
                                                return;
                                            }
                                            try {
                                                const response = await fetch('/api/update-notes', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        detailId: latestDetail._id,
                                                        notes: editedNotes
                                                    })
                                                });
                                                const result = await response.json();
                                                if (result.success) {
                                                    console.log("Notes updated successfully:", result);
                                                    // Exit editing mode
                                                    setIsEditingNotes(false);
                                                    // Optionally trigger a data refresh here
                                                    showToast("备注保存成功！ ✨", 'success');
                                                } else {
                                                    console.error("Failed to update notes:", result.message);
                                                    showToast(`保存失败: ${result.message} 😢`, 'error');
                                                }
                                            } catch (error) {
                                                console.error("Error saving notes:", error);
                                                showToast("保存过程中发生错误 😵", 'error');
                                            }
                                        }}
                                        style={{
                                             padding: '8px 16px',
                                             borderRadius: '20px',
                                             backgroundColor: 'transparent',
                                             color: '#ffb3d1',
                                             border: '2px solid #ffcce0',
                                             cursor: 'pointer',
                                             fontSize: '14px',
                                             fontWeight: '500',
                                             boxShadow: '0 2px 8px rgba(255, 204, 224, 0.2)',
                                             transition: 'all 0.2s ease'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.target.style.backgroundColor = '#ffb3d1';
                                             e.target.style.color = 'white';
                                             e.target.style.transform = 'translateY(-1px)';
                                             e.target.style.boxShadow = '0 4px 12px rgba(255, 179, 209, 0.3)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.target.style.backgroundColor = 'transparent';
                                             e.target.style.color = '#ffb3d1';
                                             e.target.style.transform = 'translateY(0)';
                                             e.target.style.boxShadow = '0 2px 8px rgba(255, 204, 224, 0.2)';
                                         }}
                                    >
                                        💾 保存
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditingNotes(false);
                                            setEditedNotes(notes); // Reset to original notes
                                        }}
                                        style={{
                                             padding: '8px 16px',
                                             borderRadius: '20px',
                                             backgroundColor: 'transparent',
                                             color: '#b8b8b8',
                                             border: '2px solid #b8b8b8',
                                             cursor: 'pointer',
                                             marginLeft: '8px',
                                             fontSize: '14px',
                                             fontWeight: '500',
                                             boxShadow: '0 2px 8px rgba(184, 184, 184, 0.2)',
                                             transition: 'all 0.2s ease'
                                         }}
                                         onMouseEnter={(e) => {
                                             e.target.style.backgroundColor = '#b8b8b8';
                                             e.target.style.color = 'white';
                                             e.target.style.transform = 'translateY(-1px)';
                                             e.target.style.boxShadow = '0 4px 12px rgba(184, 184, 184, 0.3)';
                                         }}
                                         onMouseLeave={(e) => {
                                             e.target.style.backgroundColor = 'transparent';
                                             e.target.style.color = '#b8b8b8';
                                             e.target.style.transform = 'translateY(0)';
                                             e.target.style.boxShadow = '0 2px 8px rgba(184, 184, 184, 0.2)';
                                         }}
                                    >
                                        ❌ 取消
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ marginLeft: '10px' }}>{notes}</div>
                                    {/* Only show edit icon if notes can be edited (e.g., if details is available) */}
                                    {latestDetail && (
                                         <FaEdit
                                             style={{
                                                width: '18px', 
                                                  cursor: 'pointer', 
                                                  color: '#ffb3d1', 
                                                  marginLeft: '8px',
                                                  fontSize: '18px',
                                                  transition: 'all 0.2s ease',
                                                //   padding: '6px 8px',
                                                //   borderRadius: '50%'
                                              }}
                                              title="✏️ 编辑备注"
                                              onMouseEnter={(e) => {
                                                  e.target.style.backgroundColor = 'rgba(255, 179, 209, 0.1)';
                                                  e.target.style.transform = 'scale(1.1)';
                                              }}
                                              onMouseLeave={(e) => {
                                                  e.target.style.backgroundColor = 'transparent';
                                                  e.target.style.transform = 'scale(1)';
                                              }}
                                             onClick={() => {
                                                 setIsEditingNotes(true);
                                                 setEditedNotes(notes); // Initialize with current notes
                                             }}
                                         />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>               
                    

                    {/* IP and Fingerprint Smaller Cards - Placed after the heading */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                        {/* IP Card */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <strong style={{ color: 'var(--text-color)' }}>IP 地址:</strong>
                            <div>{ip}</div>
                        </div>

                        {/* Fingerprint Card */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <strong style={{ color: 'var(--text-color)' }}>用户指纹:</strong>
                            <div>{fingerprint}</div>
                        </div>
                    </div>

                    {/* Other Information Cards Container - Adjusted layout */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}> {/* Two columns grid */}
                        {/* Location Card */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff', gridColumn: 'span 2' }}> {/* Span full width */}
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                <FaGlobe style={{ marginRight: '8px', fontSize: '1.2em' }} />
                                <strong>位置</strong>
                            </div>
                            <div>{locationDisplay}</div>
                        </div>                        
                    </div> {/* End Other Information Cards Container */}

                    {/* Second row of cards (Timezone and potentially Access Time) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}> {/* New grid for the second row */}
                        {/* Browser Card */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                <FaChrome style={{ marginRight: '8px', fontSize: '1.2em' }} />
                                <strong>浏览器</strong>
                            </div>
                            <div>{browserDisplay}</div>
                        </div>

                        {/* System Card */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                <FaDesktop style={{ marginRight: '8px', fontSize: '1.2em' }} />
                                <strong>系统</strong>
                            </div>
                            <div>{system}</div>
                        </div>

                        {/* Language Card */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                <FaLanguage style={{ marginRight: '8px', fontSize: '1.2em' }} />
                                <strong>语言</strong>
                            </div>
                            <div>{language}</div>
                        </div>
                        
                        
                        
                        {/* 时区卡片 */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                <FaClock style={{ marginRight: '8px', fontSize: '1.2em' }} />
                                <strong>时区</strong>
                            </div>
                            <div>{timezone}</div>
                        </div>
                        {/* 访问时间卡片 */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                 <FaClock style={{ marginRight: '8px', fontSize: '1.2em' }} /> {/* Calendar icon */}
                                <strong>访问时间</strong>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                                <strong style={{ color: '#666' }}>首次:</strong> {firstVisit}
                            </div>
                            <div>
                                <strong style={{ color: '#666' }}>最后:</strong> {lastVisit}
                            </div>
                        </div>

                        {/* 时区卡片 */}
                        <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff' }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                                <FaClock style={{ marginRight: '8px', fontSize: '1.2em' }} /> {/* Clock icon */}
                                <strong>时区</strong>
                            </div>
                            <div>{timezone}</div>
                        </div> 
                    </div> {/* End Second row of cards */}


                    <div className="panel" style={{ padding: '15px', borderRadius: '8px', backgroundColor: '#fff', gridColumn: 'span 2'  }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', color: 'var(--cute-pink)' }}> {/* Use theme color */}
                            <FaLink style={{ marginRight: '8px', fontSize: '1.2em' }} />
                            <strong>来源网站</strong>
                        </div>
                        <div style={{ wordBreak: 'break-all' }}>{referrer}</div>{/* Added style for word breaking */}
                    </div>
                </div>
            ) : (
                <div>
                    <p style={{ padding: '15px' }}>请选择一个用户查看详情。</p> {/*  没有选中用户时的提示信息 */}
                </div>
            )}
            
            {/* Toast容器 */}
            <ToastContainer />
        </div>
    );
};

export default UserFingerprintPanel;