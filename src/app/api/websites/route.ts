import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// 获取所有监控网站列表
export async function GET(request: NextRequest) {
  try {
    // 获取所有网站ID
    const websiteIds = await kv.smembers('websites') as string[];
    
    if (!websiteIds || websiteIds.length === 0) {
      return NextResponse.json({ websites: [] });
    }
    
    // 获取每个网站的详细信息
    const websites = [];
    for (const id of websiteIds) {
      const websiteData = await kv.hgetall(`website:${id}`);
      if (websiteData) {
        // 格式化最后访问时间
        if (websiteData.lastVisit) {
          const lastVisitDate = new Date(Number(websiteData.lastVisit));
          websiteData.lastVisitFormatted = lastVisitDate.toISOString().replace('T', ' ').substring(0, 19);
        }
        
        websites.push(websiteData);
      }
    }
    
    return NextResponse.json({ websites });
  } catch (error) {
    console.error('Error fetching websites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 获取特定网站的详细信息
export async function POST(request: NextRequest) {
  try {
    const { websiteId } = await request.json();
    
    if (!websiteId) {
      return NextResponse.json({ error: 'Missing websiteId' }, { status: 400 });
    }
    
    // 获取网站基本信息
    const websiteData = await kv.hgetall(`website:${websiteId}`);
    
    if (!websiteData) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }
    
    // 获取最近的页面访问记录
    const recentPageviews = await kv.lrange(`pageviews:${websiteId}`, 0, 49);
    const pageviews = recentPageviews.map(item => JSON.parse(item));
    
    // 获取当前活跃用户数
    const now = Date.now();
    const fifteenMinutesAgo = now - 15 * 60 * 1000;
    const activeNow = await kv.zcount(`active:${websiteId}`, fifteenMinutesAgo, '+inf');
    
    // 获取每日访问统计
    const stats = await kv.hgetall(`stats:${websiteId}`);
    
    // 处理每日访问数据
    const dailyVisits = [];
    if (stats) {
      for (const [key, value] of Object.entries(stats)) {
        if (key.startsWith('pageviews:')) {
          const date = key.replace('pageviews:', '');
          dailyVisits.push({
            date,
            visits: Number(value)
          });
        }
      }
      
      // 按日期排序
      dailyVisits.sort((a, b) => a.date.localeCompare(b.date));
    }
    
    // 返回完整的网站统计信息
    return NextResponse.json({
      ...websiteData,
      activeNow,
      pageviews,
      dailyVisits
    });
  } catch (error) {
    console.error('Error fetching website details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}