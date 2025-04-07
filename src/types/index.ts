/**
 * 定义流量分析数据的类型
 */

// 页面访问记录类型
export interface PageView {
  id: string;          // 唯一标识符
  url: string;         // 访问的URL
  timestamp: number;   // 访问时间戳
  userAgent: string;   // 用户代理信息
  ipAddress?: string;  // IP地址（可选）
  referrer?: string;   // 来源页面（可选）
  duration?: number;   // 停留时间（可选，单位：秒）
  deviceType?: string; // 设备类型（可选）
  screenWidth?: number; // 屏幕宽度（可选）
  screenHeight?: number; // 屏幕高度（可选）
  language?: string;   // 语言（可选）
  osName?: string;     // 操作系统名称（可选）
  osVersion?: string;  // 操作系统版本（可选）
  browserName?: string; // 浏览器名称（可选）
  browserVersion?: string; // 浏览器版本（可选）
}

// 按日期聚合的访问数据
export interface DailyStats {
  date: string;        // 日期，格式：YYYY-MM-DD
  pageViews: number;   // 页面浏览量
  uniqueVisitors: number; // 独立访客数
  averageDuration?: number; // 平均停留时间（可选）
}

// 按URL聚合的访问数据
export interface UrlStats {
  url: string;         // 页面URL
  pageViews: number;   // 页面浏览量
  uniqueVisitors: number; // 独立访客数
  averageDuration?: number; // 平均停留时间（可选）
}

// 流量来源数据
export interface ReferrerStats {
  referrer: string;    // 来源URL或类别（如"direct", "google"等）
  count: number;       // 访问次数
  percentage: number;  // 占总流量的百分比
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean;    // 操作是否成功
  data?: T;           // 返回的数据
  error?: string;     // 错误信息（如果有）
}