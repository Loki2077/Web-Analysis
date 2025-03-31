import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// 检测和识别引用了跟踪脚本的网站
export async function GET(request: NextRequest) {
  try {
    // 获取所有网站ID
    const websiteIds = await kv.smembers('websites') as string[];
    
    if (!websiteIds || websiteIds.length === 0) {
      return NextResponse.json({ websites: [] });
    }
    
    // 获取每个网站的详细信息和最近的活动
    const detectedWebsites = [];
    for (const id of websiteIds) {
      const websiteData = await kv.hgetall(`website:${id}`);
      
      if (websiteData) {
        // 获取最近的页面访问记录
        const recentPageviews = await kv.lrange(`pageviews:${id}`, 0, 5);
        const pageviews = recentPageviews.map(item => JSON.parse(item));
        
        // 获取当前活跃用户数
        const now = Date.now();
        const fifteenMinutesAgo = now - 15 * 60 * 1000;
        const activeNow = await kv.zcount(`active:${id}`, fifteenMinutesAgo, '+inf');
        
        // 计算最后活动时间
        let lastActivity = null;
        if (websiteData.lastVisit) {
          lastActivity = new Date(Number(websiteData.lastVisit)).toISOString();
        }
        
        // 添加到检测到的网站列表
        detectedWebsites.push({
          id: websiteData.id,
          domain: websiteData.domain,
          totalVisits: Number(websiteData.totalVisits) || 0,
          activeNow: activeNow,
          lastActivity: lastActivity,
          recentPages: pageviews.map(pv => pv.url).slice(0, 3), // 最近访问的3个页面
          firstSeen: websiteData.addedDate,
          status: activeNow > 0 ? 'active' : 'inactive'
        });
      }
    }
    
    // 按最后活动时间排序
    detectedWebsites.sort((a, b) => {
      if (!a.lastActivity) return 1;
      if (!b.lastActivity) return -1;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
    
    return NextResponse.json({ websites: detectedWebsites });
  } catch (error) {
    console.error('Error detecting websites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}