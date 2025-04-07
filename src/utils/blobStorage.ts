/**
 * Vercel Blob存储工具函数
 * 用于处理博客流量分析数据的存储和检索
 */

import { put, list, del, PutBlobResult } from '@vercel/blob';
import { PageView, ApiResponse } from '../types';

// 存储前缀，用于区分不同类型的数据
const PAGEVIEWS_PREFIX = 'pageviews/';

/**
 * 存储页面访问数据到Blob存储
 * @param pageView 页面访问数据
 * @returns 存储结果
 */
export async function storePageView(pageView: PageView): Promise<ApiResponse<PutBlobResult>> {
  try {
    // 生成唯一的文件名，使用时间戳和随机字符串
    const fileName = `${PAGEVIEWS_PREFIX}${pageView.timestamp}_${pageView.id}.json`;
    
    // 将数据转换为JSON字符串
    const content = JSON.stringify(pageView);
    
    // 存储到Vercel Blob
    const blob = await put(fileName, content, {
      contentType: 'application/json',
      access: 'public'
    });
    
    return {
      success: true,
      data: blob
    };
  } catch (error) {
    console.error('存储页面访问数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 获取所有页面访问数据
 * @returns 页面访问数据列表
 */
export async function getAllPageViews(): Promise<ApiResponse<PageView[]>> {
  try {
    // 列出所有以PAGEVIEWS_PREFIX开头的blob
    const { blobs } = await list({ prefix: PAGEVIEWS_PREFIX });
    
    // 获取每个blob的内容
    const pageViewsPromises = blobs.map(async (blob) => {
      const response = await fetch(blob.url);
      const data = await response.json();
      return data as PageView;
    });
    
    const pageViews = await Promise.all(pageViewsPromises);
    
    return {
      success: true,
      data: pageViews
    };
  } catch (error) {
    console.error('获取页面访问数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}

/**
 * 删除指定的页面访问数据
 * @param id 页面访问数据ID
 * @returns 删除结果
 */
export async function deletePageView(id: string): Promise<ApiResponse<void>> {
  try {
    // 列出所有以PAGEVIEWS_PREFIX开头的blob
    const { blobs } = await list({ prefix: PAGEVIEWS_PREFIX });
    
    // 查找包含指定ID的blob
    const targetBlob = blobs.find(blob => blob.pathname.includes(id));
    
    if (!targetBlob) {
      return {
        success: false,
        error: '未找到指定的页面访问数据'
      };
    }
    
    // 删除blob
    await del(targetBlob.url);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('删除页面访问数据失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
}