/**
 * 网站流量分析系统 - 前端埋点SDK
 * 用于收集用户访问网站的行为数据，并将数据发送到后端API
 */

(function() {
  // 配置信息
  const config = {
    apiEndpoint: window.location.origin + '/api/track',
    reportInterval: 10000, // 数据上报间隔，默认10秒
  };

  // 访问数据
  let analyticsData = {
    url: window.location.href,
    referrer: document.referrer || 'direct',
    userAgent: navigator.userAgent,
    startTime: Date.now(),
    duration: 0,
    timestamp: new Date().toISOString()
  };

  // 计算停留时间
  function updateDuration() {
    analyticsData.duration = Date.now() - analyticsData.startTime;
  }

  // 发送数据到后端API
  function sendData() {
    updateDuration();
    
    fetch(config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsData),
      // 使用keepalive确保页面关闭时数据仍能发送
      keepalive: true
    }).catch(error => {
      console.error('Analytics data sending failed:', error);
    });
  }

  // 页面加载完成时发送初始数据
  window.addEventListener('load', function() {
    sendData();
  });

  // 页面关闭前发送最终数据
  window.addEventListener('beforeunload', function() {
    sendData();
  });

  // 定期发送数据，防止数据丢失
  setInterval(sendData, config.reportInterval);

  // 暴露全局API，允许手动触发数据发送
  window.webAnalytics = {
    sendData: sendData
  };

  console.log('Web Analytics tracking initialized');
})();