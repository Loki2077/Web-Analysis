import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { v4 as uuidv4 } from 'uuid';

// 处理来自跟踪脚本的数据收集请求
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const data = await request.json();
    
    // 获取访客ID（从请求头或生成新的）
    const visitorId = request.headers.get('X-Visitor-ID') || uuidv4();
    
    // 添加时间戳和访客ID
    const eventData = {
      ...data,
      timestamp: Date.now(),
      visitorId,
    };
    
    // 确保websiteId存在
    if (!eventData.websiteId) {
      return NextResponse.json({ error: 'Missing websiteId' }, { status: 400 });
    }
    
    // 根据事件类型处理数据
    if (eventData.type === 'pageview') {
      // 存储页面访问数据
      await storePageview(eventData);
      
      // 更新网站统计信息
      await updateWebsiteStats(eventData.websiteId);
      
      // 如果是新网站，添加到网站列表
      await addWebsiteIfNew(eventData.websiteId, eventData.url);
    } else if (eventData.type === 'event') {
      // 存储自定义事件数据
      await storeEvent(eventData);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing analytics data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 存储页面访问数据
async function storePageview(data: any) {
  const { websiteId, url, timestamp, visitorId, referrer, userAgent, screenWidth, screenHeight, language, title } = data;
  
  // 创建唯一的事件ID
  const eventId = uuidv4();
  
  // 解析域名
  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    console.error('Invalid URL:', url);
  }
  
  // 解析设备和浏览器信息
  const deviceInfo = parseUserAgent(userAgent);
  
  // 构建页面访问记录
  const pageview = {
    id: eventId,
    websiteId,
    url,
    domain,
    timestamp,
    visitorId,
    referrer,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    device: deviceInfo.device,
    screenWidth,
    screenHeight,
    language,
    title
  };
  
  // 存储到KV数据库
  // 1. 添加到页面访问列表
  await kv.lpush(`pageviews:${websiteId}`, JSON.stringify(pageview));
  
  // 2. 设置过期时间（保留30天数据）
  await kv.expire(`pageviews:${websiteId}`, 60 * 60 * 24 * 30);
  
  // 3. 更新当前活跃用户集合
  await kv.zadd(`active:${websiteId}`, { score: timestamp, member: visitorId });
  
  // 4. 设置活跃用户过期时间（15分钟）
  await kv.expire(`active:${websiteId}`, 60 * 15);
  
  // 5. 增加当天的访问计数
  const today = new Date().toISOString().split('T')[0];
  await kv.hincrby(`stats:${websiteId}`, `pageviews:${today}`, 1);
}

// 存储自定义事件数据
async function storeEvent(data: any) {
  const { websiteId, eventName, eventValue, url, timestamp, visitorId } = data;
  
  // 创建唯一的事件ID
  const eventId = uuidv4();
  
  // 构建事件记录
  const event = {
    id: eventId,
    websiteId,
    eventName,
    eventValue,
    url,
    timestamp,
    visitorId
  };
  
  // 存储到KV数据库
  await kv.lpush(`events:${websiteId}`, JSON.stringify(event));
  await kv.expire(`events:${websiteId}`, 60 * 60 * 24 * 30); // 30天过期
  
  // 增加事件计数
  await kv.hincrby(`stats:${websiteId}`, `event:${eventName}`, 1);
}

// 更新网站统计信息
async function updateWebsiteStats(websiteId: string) {
  // 增加总访问量
  await kv.hincrby(`website:${websiteId}`, 'totalVisits', 1);
  
  // 更新最后访问时间
  await kv.hset(`website:${websiteId}`, 'lastVisit', Date.now());
  
  // 获取当前活跃用户数
  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1000;
  
  // 移除15分钟前的活跃用户
  await kv.zremrangebyscore(`active:${websiteId}`, 0, fifteenMinutesAgo);
  
  // 计算当前活跃用户数
  const activeCount = await kv.zcount(`active:${websiteId}`, fifteenMinutesAgo, '+inf');
  
  // 更新当前活跃用户数
  await kv.hset(`website:${websiteId}`, 'activeNow', activeCount);
}

// 如果是新网站，添加到网站列表
async function addWebsiteIfNew(websiteId: string, url: string) {
  // 检查网站是否已存在
  const exists = await kv.hexists(`website:${websiteId}`, 'domain');
  
  if (!exists) {
    // 解析域名
    let domain = '';
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      console.error('Invalid URL:', url);
      domain = websiteId; // 回退到使用websiteId作为域名
    }
    
    // 添加新网站
    await kv.hset(`website:${websiteId}`, {
      id: websiteId,
      domain,
      totalVisits: 1,
      activeNow: 1,
      addedDate: new Date().toISOString().split('T')[0],
      lastVisit: Date.now(),
      pages: 1
    });
    
    // 添加到网站列表
    await kv.sadd('websites', websiteId);
  }
}

// 解析User-Agent字符串
function parseUserAgent(userAgent: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Unknown';
  
  // 简单的浏览器检测
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    browser = 'Internet Explorer';
  }
  
  // 简单的操作系统检测
  if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS')) {
    os = 'macOS';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  }
  
  // 简单的设备类型检测
  if (userAgent.includes('Mobile')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }
  
  return { browser, os, device };
}