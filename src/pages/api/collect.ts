import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../lib/storage';

type CollectData = {
  type: 'pageview' | 'event';
  url: string;
  referrer?: string;
  userAgent?: string;
  screenWidth?: number;
  screenHeight?: number;
  language?: string;
  eventName?: string;
  eventValue?: string;
  websiteId?: string;
};

type ResponseData = {
  success: boolean;
  message?: string;
};

// 从请求中提取域名
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    // 如果URL无效，尝试从字符串中提取
    const match = url.match(/^(?:https?:\/\/)?([^/]+)/);
    return match ? match[1] : 'unknown';
  }
}

// 获取或创建访客ID
function getVisitorId(req: NextApiRequest, res: NextApiResponse): string {
  // 尝试从请求头中获取访客ID
  const visitorId = req.headers['x-visitor-id'] as string;
  if (visitorId) {
    return visitorId;
  }
  
  // 创建新的访客ID
  const newVisitorId = uuidv4();
  
  // 在响应头中设置访客ID，以便前端脚本可以存储它
  res.setHeader('x-visitor-id', newVisitorId);
  
  return newVisitorId;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const data = req.body as CollectData;
    const timestamp = Date.now();
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD格式
    const visitorId = getVisitorId(req, res);
    const domain = extractDomain(data.url);
    
    // 获取网站ID
    const websiteId = data.websiteId || 'default';
    
    // 构建要存储的数据
    const eventData = {
      ...data,
      timestamp,
      date,
      visitorId,
      domain,
      websiteId,
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
    };

    // 存储原始事件数据（按网站ID分组）
    await storage.lpush(`events:${websiteId}:${date}`, JSON.stringify(eventData));
    
    // 更新每日统计数据（按网站ID分组）
    if (data.type === 'pageview') {
      // 增加页面浏览量
      await storage.hincrby(`stats:${websiteId}:${date}`, 'pageviews', 1);
      
      // 记录唯一访客
      await storage.sadd(`visitors:${websiteId}:${date}`, visitorId);
      
      // 更新页面统计
      await storage.hincrby(`pages:${websiteId}:${date}`, data.url, 1);
      
      // 更新引荐来源统计
      if (data.referrer) {
        await storage.hincrby(`referrers:${websiteId}:${date}`, data.referrer, 1);
      }
    } else if (data.type === 'event' && data.eventName) {
      // 记录自定义事件
      await storage.hincrby(`events:custom:${websiteId}:${date}`, `${data.eventName}:${data.eventValue || 'default'}`, 1);
    }
    
    // 记录网站ID到网站列表中，用于后台管理
    await storage.sadd('websites', websiteId);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error collecting analytics:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}