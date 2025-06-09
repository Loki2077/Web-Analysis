'use client';

import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

/**
 * 可爱风格的Toast通知组件接口
 */
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  duration?: number;
  onClose: () => void;
}

/**
 * 可爱风格的Toast通知组件
 * @param {ToastProps} props - Toast组件属性
 * @returns {JSX.Element} Toast组件
 */
const CuteToast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // 显示动画
    setIsAnimating(true);
    
    // 自动关闭定时器
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  /**
   * 处理Toast关闭动画和回调
   */
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // 等待动画完成
  };

  /**
   * 根据类型获取对应的图标
   */
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle style={{ color: '#4CAF50', fontSize: '1.2em' }} />;
      case 'error':
        return <FaExclamationCircle style={{ color: '#F44336', fontSize: '1.2em' }} />;
      case 'warning':
        return <FaExclamationCircle style={{ color: '#FF9800', fontSize: '1.2em' }} />;
      default:
        return <FaCheckCircle style={{ color: '#4CAF50', fontSize: '1.2em' }} />;
    }
  };

  /**
   * 根据类型获取对应的背景色
   */
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)';
      case 'error':
        return 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)';
      case 'warning':
        return 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)';
      default:
        return 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)';
    }
  };

  /**
   * 根据类型获取对应的边框色
   */
  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FF9800';
      default:
        return '#4CAF50';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        minWidth: '300px',
        maxWidth: '400px',
        padding: '16px 20px',
        background: getBackgroundColor(),
        border: `2px solid ${getBorderColor()}`,
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontFamily: 'Arial, sans-serif',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
        transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 图标 */}
      <div style={{ flexShrink: 0 }}>
        {getIcon()}
      </div>
      
      {/* 消息内容 */}
      <div style={{ flex: 1, lineHeight: '1.4' }}>
        {message}
      </div>
      
      {/* 关闭按钮 */}
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          color: '#666',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <FaTimes style={{ fontSize: '0.9em' }} />
      </button>
    </div>
  );
};

/**
 * Toast管理器Hook
 * @returns {object} Toast管理器对象
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    duration?: number;
  }>>([]);

  /**
   * 显示Toast通知
   * @param {string} message - 消息内容
   * @param {'success' | 'error' | 'warning'} type - 消息类型
   * @param {number} duration - 显示时长（毫秒）
   */
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success', duration = 3000) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  /**
   * 移除指定的Toast
   * @param {string} id - Toast ID
   */
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  /**
   * Toast容器组件
   */
  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <CuteToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return {
    showToast,
    ToastContainer,
  };
};

export default CuteToast;