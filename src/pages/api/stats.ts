import type { NextApiRequest, NextApiResponse } from 'next';
import { subDays, format } from 'date-fns';
import { storage } from '../../lib/storage';

type StatsData = {
  date: string;
  pageviews: number;
  visitors: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<StatsData[]>
) {
  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  try {
    // 获取请求的天数，默认为7天
    const days = parseInt(req.query.days as string) || 7;
    // 限制最大天数为90天
    const limitedDays = Math.min(days, 90);
    // 获取网站ID，默认为default
    const websiteId = req.query.websiteId as string || 'default';
    
    const today = new Date();
    const stats: StatsData[] = [];

    // 获取指定天数的统计数据
    for (let i = limitedDays - 1; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      
      // 获取当天的页面浏览量（按网站ID筛选）
      const pageviews = parseInt(await storage.hget(`stats:${websiteId}:${date}`, 'pageviews') as string) || 0;
      
      // 获取当天的唯一访客数（按网站ID筛选）
      const visitors = await storage.scard(`visitors:${websiteId}:${date}`) || 0;
      
      stats.push({
        date,
        pageviews,
        visitors,
      });
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).end();
  }
}