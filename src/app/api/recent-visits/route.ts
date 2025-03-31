import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// 获取所有网站的最近访问记录
export async function GET(request: NextRequest) {
  try {
    // 获取所有网站ID
    const websiteIds = await kv.smembers('websites') as string[];
    
    if (!websiteIds || websiteIds.length === 0) {
      return NextResponse.json({ visits: [] });
    }
    
    // 获取每个网站的最近访问记录
    let allVisits = [];
    
    for (const id of websiteIds) {
      // 获取网站信息
      const websiteData = await kv.hgetall(`website:${id}`);
      
      // 获取最近的页面访问记录
      const recentPageviews = await kv.lrange(`pageviews:${id}`, 0, 9); // 每个网站获取最近10条记录
      
      if (recentPageviews && recentPageviews.length > 0) {
        const pageviews = recentPageviews.map(item => {
          const pv = JSON.parse(item);
          return {
            ...pv,
            domain: websiteData?.domain || pv.domain || '未知网站'
          };
        });
        
        allVisits = [...allVisits, ...pageviews];
      }
    }
    
    // 按时间戳排序（最新的在前）
    allVisits.sort((a, b) => b.timestamp - a.timestamp);
    
    // 只返回最近的50条记录
    const recentVisits = allVisits.slice(0, 50);
    
    return NextResponse.json({ visits: recentVisits });
  } catch (error) {
    console.error('Error fetching recent visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}