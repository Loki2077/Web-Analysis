// Web-Analysis Tracker Script
// 轻量级网站分析跟踪脚本

(function() {
  // 配置
  const script = document.currentScript;
  const websiteId = script.getAttribute('data-website-id') || 'default';
  const trackerEndpoint = (function() {
    // 如果websiteId是一个URL，则使用该URL作为基础
    if (websiteId.startsWith('http')) {
      try {
        const websiteUrl = new URL(websiteId);
        // 从URL中提取主机部分作为基础URL
        return `${websiteUrl.protocol}//${websiteUrl.host}/api/collect`;
      } catch (e) {
        console.error('Invalid website ID URL:', e);
        return '/api/collect';
      }
    }
    // 否则使用默认端点
    return '/api/collect';
  })();
  const storageKey = 'wa_visitor_id';
  
  // 获取或创建访客ID
  function getVisitorId() {
    // 尝试从localStorage获取访客ID
    let visitorId = localStorage.getItem(storageKey);
    
    if (!visitorId) {
      // 如果没有访客ID，从服务器获取一个新的
      visitorId = generateUUID();
      localStorage.setItem(storageKey, visitorId);
    }
    
    return visitorId;
  }
  
  // 生成UUID
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // 发送数据到服务器
  function sendData(data) {
    const visitorId = getVisitorId();
    
    // 添加网站ID和访客ID
    data.websiteId = websiteId;
    
    // 发送数据
    if (navigator.sendBeacon) {
      // 使用Beacon API（如果可用）
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(trackerEndpoint, blob);
    } else {
      // 回退到fetch API
      fetch(trackerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Visitor-ID': visitorId
        },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(err => console.error('Analytics error:', err));
    }
  }
  
  // 跟踪页面浏览
  function trackPageview() {
    sendData({
      type: 'pageview',
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      language: navigator.language,
      title: document.title
    });
  }
  
  // 跟踪事件
  function trackEvent(eventName, eventValue) {
    sendData({
      type: 'event',
      url: window.location.href,
      eventName: eventName,
      eventValue: eventValue
    });
  }
  
  // 监听历史状态变化（SPA路由变化）
  function listenForRouteChanges() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    // 重写pushState
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      trackPageview();
    };
    
    // 重写replaceState
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      trackPageview();
    };
    
    // 监听popstate事件
    window.addEventListener('popstate', trackPageview);
  }
  
  // 初始化跟踪器
  function init() {
    // 跟踪初始页面浏览
    trackPageview();
    
    // 监听路由变化（对SPA有用）
    listenForRouteChanges();
    
    // 暴露全局API
    window.webAnalytics = {
      trackEvent: trackEvent
    };
  }
  
  // 当DOM加载完成后初始化
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }
})();