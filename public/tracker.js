/**
 * Web-Analysis 跟踪脚本
 * 用于收集网站访问数据并发送到分析服务器
 * 即插即用版本 - 无需额外配置
 */

(function() {
  // 配置项
  const config = {
    // 分析服务器地址，自动检测
    serverUrl: 'http://localhost:3000/',
    
    // 是否自动跟踪页面访问
    autoTrack: true,
    
    // 是否跟踪页面停留时间
    trackDuration: true
  };
  
  // 存储页面加载时间，用于计算停留时间
  const pageLoadTime = Date.now();
  
  // 自动检测服务器URL
  function detectServerUrl() {
    // 获取当前脚本的URL
    const scripts = document.getElementsByTagName('script');
    let scriptUrl = '';
    
    // 查找当前脚本
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src || '';
      if (src.includes('tracker.js')) {
        scriptUrl = src;
        break;
      }
    }
    
    // 如果找到脚本URL，提取服务器地址
    if (scriptUrl) {
      // 从脚本URL中提取服务器地址
      const urlObj = new URL(scriptUrl);
      return `${urlObj.protocol}//${urlObj.host}`;
    }
    
    // 如果无法检测，使用当前域名
    return window.location.origin;
  }
  
  // 初始化跟踪器
  function init(userConfig = {}) {
    // 合并用户配置
    Object.assign(config, userConfig);
    
    // 如果未设置服务器URL，自动检测
    if (!config.serverUrl) {
      config.serverUrl = detectServerUrl();
    }
    
    // 如果启用了自动跟踪，则在页面加载完成后跟踪页面访问
    if (config.autoTrack) {
      trackPageView();
    }
    
    // 如果启用了停留时间跟踪，则在页面卸载前发送停留时间
    if (config.trackDuration) {
      window.addEventListener('beforeunload', function() {
        const duration = Math.floor((Date.now() - pageLoadTime) / 1000); // 转换为秒
        sendPageViewData({ duration: duration });
      });
    }
  }
  
  // 获取客户端IP地址
  async function getClientIP() {
    try {
      // 使用公共API获取IP地址
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('获取IP地址失败:', error);
      return null;
    }
  }
  
  // 跟踪页面访问
  async function trackPageView(customData = {}) {
    // 收集更详细的设备和浏览器信息
    const deviceInfo = getDeviceInfo();
    
    // 获取IP地址
    const ipAddress = await getClientIP();
    
    const pageViewData = {
      url: window.location.href, // 完整URL，包含路径和参数
      path: window.location.pathname,
      hostname: window.location.hostname,
      referrer: document.referrer || undefined,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      deviceType: deviceInfo.deviceType,
      browserName: deviceInfo.browserName,
      browserVersion: deviceInfo.browserVersion,
      osName: deviceInfo.osName,
      osVersion: deviceInfo.osVersion,
      ipAddress: ipAddress, // 添加IP地址
      ...customData
    };
    
    sendPageViewData(pageViewData);
  }
  
  // 获取详细的设备和浏览器信息
  function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browserName = "未知浏览器";
    let browserVersion = "";
    let osName = "未知系统";
    let osVersion = "";
    let deviceType = "桌面设备";
    
    // 检测移动设备
    if (/Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(ua)) {
      deviceType = "移动设备";
    } else if (/Tablet|iPad/i.test(ua)) {
      deviceType = "平板设备";
    }
    
    // 检测操作系统
    if (/Windows/i.test(ua)) {
      osName = "Windows";
      const match = ua.match(/Windows NT (\d+\.\d+)/i);
      if (match) {
        const version = match[1];
        switch(version) {
          case "10.0": osVersion = "10"; break;
          case "6.3": osVersion = "8.1"; break;
          case "6.2": osVersion = "8"; break;
          case "6.1": osVersion = "7"; break;
          case "6.0": osVersion = "Vista"; break;
          case "5.2": osVersion = "XP 64-bit"; break;
          case "5.1": osVersion = "XP"; break;
          default: osVersion = version;
        }
      }
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
      osName = "MacOS";
      const match = ua.match(/Mac OS X ([\d_]+)/i);
      if (match) {
        osVersion = match[1].replace(/_/g, '.');
      }
    } else if (/Android/i.test(ua)) {
      osName = "Android";
      const match = ua.match(/Android (\d+(?:\.\d+)*)/i);
      if (match) {
        osVersion = match[1];
      }
    } else if (/iOS|iPhone|iPad|iPod/i.test(ua)) {
      osName = "iOS";
      const match = ua.match(/OS (\d+(?:_\d+)*) like Mac OS X/i);
      if (match) {
        osVersion = match[1].replace(/_/g, '.');
      }
    } else if (/Linux/i.test(ua)) {
      osName = "Linux";
    }
    
    // 检测浏览器
    if (/Edge|Edg/i.test(ua)) {
      browserName = "Edge";
      const match = ua.match(/Edge?\/(\d+(?:\.\d+)*)/i);
      if (match) {
        browserVersion = match[1];
      }
    } else if (/Chrome/i.test(ua)) {
      browserName = "Chrome";
      const match = ua.match(/Chrome\/(\d+(?:\.\d+)*)/i);
      if (match) {
        browserVersion = match[1];
      }
    } else if (/Firefox/i.test(ua)) {
      browserName = "Firefox";
      const match = ua.match(/Firefox\/(\d+(?:\.\d+)*)/i);
      if (match) {
        browserVersion = match[1];
      }
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
      browserName = "Safari";
      const match = ua.match(/Version\/(\d+(?:\.\d+)*)/i);
      if (match) {
        browserVersion = match[1];
      }
    } else if (/MSIE|Trident/i.test(ua)) {
      browserName = "Internet Explorer";
      const match = ua.match(/(?:MSIE |rv:)(\d+(?:\.\d+)*)/i);
      if (match) {
        browserVersion = match[1];
      }
    }
    
    return {
      deviceType,
      browserName,
      browserVersion,
      osName,
      osVersion
    };
  }
  
  // 发送页面访问数据到服务器
  function sendPageViewData(data) {
    // 确保serverUrl已设置
    if (!config.serverUrl) {
      console.error('Web-Analysis: serverUrl未设置');
      return;
    }
    
    // 打印收集到的跟踪数据到控制台
    console.log('Web-Analysis: 收集到的访问信息', {
      时间: new Date().toLocaleString(),
      页面: data.url || window.location.href,
      路径: data.path || window.location.pathname,
      来源: data.referrer || document.referrer || '直接访问',
      停留时间: data.duration ? `${data.duration}秒` : '正在访问',
      设备类型: data.deviceType || '未知设备',
      操作系统: `${data.osName || '未知'} ${data.osVersion || ''}`,
      浏览器: `${data.browserName || '未知'} ${data.browserVersion || ''}`,
      屏幕分辨率: data.screenWidth && data.screenHeight ? `${data.screenWidth}x${data.screenHeight}` : '未知',
      语言: data.language || navigator.language,
      IP地址: data.ipAddress || '未知IP',
      完整数据: data
    });
    
    // 构建API端点URL
    const apiUrl = `${config.serverUrl}/api/tracker`;
    
    // 发送数据
    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      // 使用keepalive确保在页面卸载时也能发送请求
      keepalive: true
    }).catch(error => {
      console.error('Web-Analysis: 发送数据失败', error);
    });
  }
  
  // 暴露公共API
  window.WebAnalysis = {
    init: init,
    trackPageView: trackPageView
  };
  
  // 处理已有的队列命令
  if (window._webAnalysisq && Array.isArray(window._webAnalysisq)) {
    window._webAnalysisq.forEach(args => {
      const method = args[0];
      const params = args.slice(1);
      if (window.WebAnalysis[method]) {
        window.WebAnalysis[method](...params);
      }
    });
  }
  
  // 重新定义_webAnalysisq，使其成为一个代理队列
  window._webAnalysisq = window._webAnalysisq || [];
  const originalPush = window._webAnalysisq.push;
  window._webAnalysisq.push = function(args) {
    const result = originalPush.apply(this, arguments);
    const method = args[0];
    const params = args.slice(1);
    if (window.WebAnalysis[method]) {
      window.WebAnalysis[method](...params);
    }
    return result;
  };
  
  // 确保在页面加载完成后执行自动初始化
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // 如果页面已经加载完成或处于交互状态，立即初始化
    init();
  } else {
    // 否则等待页面加载完成后初始化
    window.addEventListener('DOMContentLoaded', function() {
      init();
    });
  }
})();