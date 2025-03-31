import type { NextApiRequest, NextApiResponse } from 'next';
import { storage } from '../../lib/storage';

type WebsiteData = {
  id: string;
  name?: string;
  url?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WebsiteData[]>
) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    // 获取所有已注册的网站ID
    const websiteIds = await storage.smembers('websites') as string[];
    
    // 构建网站数据列表
    const websites: WebsiteData[] = websiteIds.map(id => {
      // 从ID中提取URL（如果ID是URL格式）
      let name = id;
      let url = '';
      
      if (id.startsWith('http')) {
        try {
          const urlObj = new URL(id);
          name = urlObj.hostname;
          url = id;
        } catch (e) {
          // 如果解析失败，使用原始ID
        }
      }
      
      return {
        id,
        name,
        url
      };
    });

    return res.status(200).json(websites);
  } catch (error) {
    console.error('Error fetching websites:', error);
    return res.status(500).end();
  }
}