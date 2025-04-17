/**
 * Web-Analysis 追踪脚本
 * 用于收集用户访问信息并通过WebSocket实时传输到监控系统
 * 增强版：添加详细日志记录功能
 */
(function() {
  console.log('WebAnalysis: 追踪脚本初始化开始');
  // 加载GoEasy SDK
  function loadScript(url, callback) {
    console.log(`WebAnalysis: 开始加载脚本 ${url}`);
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.onload = function() {
      console.log(`WebAnalysis: 脚本 ${url} 加载成功`);
      callback();
    };
    script.onerror = function() {
      console.error(`WebAnalysis: 脚本 ${url} 加载失败`);
    };
    document.head.appendChild(script);
  }

  // 初始化追踪器
  function initTracker() {
    console.log('WebAnalysis: 开始初始化追踪器');
    // 使用本地GoEasy SDK而非CDN
    // 加载GoEasy SDK    
    // 新增：动态获取当前脚本域名并拼接SDK路径
    const currentScript = document.currentScript || (function() {
        var scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    const scriptUrl = currentScript.src;
    const baseOrigin = new URL(scriptUrl).origin;
    const sdkPath = '/goeasy-2.13.17/goeasy.min.js';
    const sdkUrl = baseOrigin + sdkPath;

    loadScript(sdkUrl, function() { // 修改：使用动态URL
      console.log('WebAnalysis: GoEasy SDK加载完成，开始初始化GoEasy实例');
      // 初始化GoEasy实例
      const goEasy = GoEasy.getInstance({
        host: 'hangzhou.goeasy.io', // 使用杭州节点
        appkey: 'BC-3c9aebd68555496aa086c46caf78393d', // 使用与TrackerDataService相同的appkey
        modules: ['pubsub']
      });

      // 建立连接
      console.log('WebAnalysis: 开始建立GoEasy连接');
      goEasy.connect({
        onSuccess: function() {
          console.log('WebAnalysis: GoEasy连接成功，appkey:', goEasy.appkey);
          // 连接成功后开始收集数据
          collectAndSendData(goEasy);
        },
        onFailed: function(error) {
          console.error('WebAnalysis: GoEasy连接失败', error.code, error.content);
        }
      });
    });
  }

  // 生成设备指纹
  function generateDeviceFingerprint() {
    console.log('WebAnalysis: 开始生成设备指纹');
    
    // 检查是否已有存储的指纹
    const storedFingerprint = getStoredFingerprint();
    if (storedFingerprint) {
      console.log('WebAnalysis: 使用已存储的设备指纹', storedFingerprint);
      return storedFingerprint;
    }
    
    // 收集稳定的设备特征（移除不稳定的Canvas和WebGL指纹）
    const components = {
      // 基本信息（稳定特征）
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      
      // 浏览器功能检测（稳定特征）
      cookieEnabled: navigator.cookieEnabled,
      localStorage: !!window.localStorage,
      indexedDB: !!window.indexedDB,
      // 移除 openDatabase（已弃用的Web SQL数据库）
      
      // 硬件信息（稳定特征）
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency, // 替代 cpuClass
      
      // 插件信息（相对稳定）
      pluginCount: (navigator.plugins || []).length,
      
      // 其他稳定特征
      touchPoints: navigator.maxTouchPoints,
      // 移除 oscpu（隐私相关字段）
      productSub: navigator.productSub,
      vendor: navigator.vendor,
      vendorSub: navigator.vendorSub,
      buildID: navigator.buildID, // 部分浏览器已移除此字段

      // 新增现代特征
      connectionDownlink: navigator.connection?.downlink || null, // 替代 connectionType
      batteryLevel: navigator.getBattery ? "available" : "unknown", // 新增电池信息检测

      // 移除重复字段
      // cookiesEnabled: navigator.cookieEnabled, // 已重复
      // 替换 javaEnabled（Java插件已过时）
      javaSupport: navigator.javaEnabled ? navigator.javaEnabled() : false,
      
      // 移除过时属性
      // pdfViewerEnabled: navigator.pdfViewerEnabled // 已弃用属性
    };
    
    // 生成指纹哈希
    const fingerprintString = JSON.stringify(components);
    const fingerprint = hashString(fingerprintString);
    
    // 存储指纹到localStorage以便后续使用
    storeFingerprint(fingerprint);
    
    // 同时存储原始组件数据，用于后续比较和更新
    try {
      localStorage.setItem('wa_fingerprint_components', JSON.stringify({
        // 只存储关键稳定特征用于比较
        userAgent: components.userAgent,
        language: components.language,
        platform: components.platform,
        screenResolution: components.screenResolution,
        hardwareConcurrency: components.hardwareConcurrency,
        deviceMemory: components.deviceMemory,
        timezone: components.timezone
      }));
    } catch (e) {
      console.error('WebAnalysis: 存储组件数据失败', e);
    }
    
    console.log('WebAnalysis: 设备指纹生成完成', fingerprint);
    return fingerprint;
  }
  
  // 注意：已移除不稳定的Canvas指纹、WebGL指纹和字体检测函数
  // 这些特征会导致每次刷新页面时生成不同的指纹
  
  // 从localStorage获取存储的指纹
  function getStoredFingerprint() {
    try {
      // 获取指纹和指纹版本
      const fingerprint = localStorage.getItem('wa_device_fingerprint');
      const version = localStorage.getItem('wa_fingerprint_version');
      const expiryDate = localStorage.getItem('wa_fingerprint_expiry');
      
      // 检查指纹是否过期
      if (expiryDate && new Date(expiryDate) < new Date()) {
        console.log('WebAnalysis: 设备指纹已过期，需要重新生成');
        return '';
      }
      
      // 如果版本不匹配或指纹不存在，返回空字符串
      if (version !== '1.1' || !fingerprint) {
        return '';
      }
      
      // 检查设备特征是否发生显著变化
      if (shouldUpdateFingerprint()) {
        console.log('WebAnalysis: 设备特征发生显著变化，更新指纹');
        return '';
      }
      
      return fingerprint;
    } catch (e) {
      console.error('WebAnalysis: 获取存储的指纹失败', e);
      return '';
    }
  }
  
  // 检查是否需要更新指纹（当设备特征发生显著变化时）
  function shouldUpdateFingerprint() {
    try {
      // 获取存储的组件数据
      const storedComponentsStr = localStorage.getItem('wa_fingerprint_components');
      if (!storedComponentsStr) return true;
      
      const storedComponents = JSON.parse(storedComponentsStr);
      
      // 获取当前组件数据
      const currentComponents = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };
      
      // 计算变化的特征数量
      let changedFeatures = 0;
      let totalFeatures = 0;
      
      for (const key in storedComponents) {
        totalFeatures++;
        if (storedComponents[key] !== currentComponents[key]) {
          changedFeatures++;
        }
      }
      
      // 如果超过30%的特征发生变化，则认为需要更新指纹
      const changeRatio = changedFeatures / totalFeatures;
      console.log(`WebAnalysis: 设备特征变化率: ${(changeRatio * 100).toFixed(2)}%`);
      
      return changeRatio > 0.3;
    } catch (e) {
      console.error('WebAnalysis: 检查指纹更新失败', e);
      return false;
    }
  }
  
  // 存储指纹到localStorage
  function storeFingerprint(fingerprint) {
    try {
      // 存储指纹和版本号
      localStorage.setItem('wa_device_fingerprint', fingerprint);
      localStorage.setItem('wa_fingerprint_version', '1.1'); // 版本控制，方便未来升级算法
      
      // 设置指纹过期时间（30天）
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      localStorage.setItem('wa_fingerprint_expiry', expiryDate.toISOString());
      
      console.log('WebAnalysis: 设备指纹已存储，有效期30天');
    } catch (e) {
      console.error('WebAnalysis: 存储指纹失败', e);
    }
  }
  
  // 改进的哈希字符串函数 - 使用更稳定的算法
  function hashString(str) {
    // 如果输入为空，返回固定值
    if (!str || str.length === 0) return '00000000';
    
    // 使用更稳定的哈希算法 (djb2)
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
    }
    
    // 转换为正整数
    hash = Math.abs(hash);
    
    // 转换为16进制字符串并确保长度一致
    const hashHex = hash.toString(16);
    return hashHex.padStart(8, '0').substring(0, 8); // 确保长度为8
  }
  
  // 收集用户指纹和行为数据
  function collectAndSendData(goEasy) {
    console.log('WebAnalysis: 开始收集用户数据');
    // 收集基本信息
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href, // URL会在服务端解码显示
      referrer: document.referrer,
      title: document.title,
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      sessionId: generateSessionId(),
      pageLoadTime: performance.now(),
      visitDuration: 0,
      events: [],
      computerName: navigator.userAgentData?.platform || navigator.platform || '未知',
      ip: '获取中...', // 初始值，将通过API获取
      deviceFingerprint: generateDeviceFingerprint() // 添加设备指纹
    };
    
    // 使用第三方API获取真实IP地址
    fetch('https://api.ipify.org?format=json')
      .then(response => response.json())
      .then(ipData => {
        console.log('WebAnalysis: IP地址获取成功', ipData.ip);
        data.ip = ipData.ip;
        // 只在页面加载时发送一次初始数据
        sendData(goEasy, 'page_view', data);
      })
      .catch(error => {
        console.error('WebAnalysis: IP地址获取失败', error);
        // 尝试备用API
        fetch('https://api.db-ip.com/v2/free/self')
          .then(response => response.json())
          .then(ipData => {
            console.log('WebAnalysis: 备用API IP地址获取成功', ipData.ipAddress);
            data.ip = ipData.ipAddress;
            // 只在页面加载时发送一次初始数据
            sendData(goEasy, 'page_view', data);
          })
          .catch(err => {
            console.error('WebAnalysis: 备用API IP地址获取失败', err);
            // 即使IP获取失败，也发送初始数据
            sendData(goEasy, 'page_view', data);
          });
      });

    console.log('WebAnalysis: 用户基本数据收集完成', {
      url: data.url,
      title: data.title,
      sessionId: data.sessionId,
      screenResolution: data.screenResolution
    });

    // 监听页面事件
    console.log('WebAnalysis: 开始监听用户行为');
    trackUserBehavior(goEasy, data);

    // 页面离开前更新停留时间并发送数据
    window.addEventListener('beforeunload', function() {
      data.visitDuration = Math.floor((performance.now() - data.pageLoadTime) / 1000);
      console.log(`WebAnalysis: 用户离开页面，总停留时间 ${data.visitDuration}秒`);
      sendData(goEasy, 'page_exit', data);
    });
  }

  // 监听用户行为
  function trackUserBehavior(goEasy, data) {
    console.log('WebAnalysis: 注册用户行为监听器');
    
    // 点击事件
    document.addEventListener('click', function(e) {
      const target = e.target;
      // 获取元素的文本内容或值，而不仅仅是标签名
      let targetContent = '';
      
      // 获取按钮、链接等元素的文本内容
      if (target.innerText && target.innerText.trim()) {
        targetContent = target.innerText.trim();
      } 
      // 获取输入框、选择框等元素的值
      else if (target.value) {
        targetContent = target.value;
      }
      // 获取图片的alt文本或src
      else if (target.alt) {
        targetContent = target.alt;
      } 
      else if (target.src) {
        targetContent = target.src.split('/').pop();
      }
      
      const eventData = {
        type: 'click',
        target: target.tagName,
        targetContent: targetContent, // 添加元素内容
        path: getElementPath(e.target),
        url: window.location.href,
        sessionId: data.sessionId, // 添加会话ID
        ip: data.ip, // 添加IP地址
        timestamp: new Date().toISOString()
      };
      data.events.push(eventData);
      console.log('WebAnalysis: 捕获点击事件', {
        target: eventData.target,
        path: eventData.path.substring(0, 100) // 限制长度以避免日志过长
      });
      
      // 发送点击事件数据
      sendData(goEasy, 'user_event', eventData);
      
      // 同时更新停留时间
      data.visitDuration = Math.floor((performance.now() - data.pageLoadTime) / 1000);
    });

    // 表单提交事件
    document.addEventListener('submit', function(e) {
      const form = e.target;
      const formId = form.id || form.name || '未命名表单';
      const formAction = form.action || window.location.href;
      
      // 收集表单字段名称（不收集值以保护隐私）
      const formFields = [];
      for (let i = 0; i < form.elements.length; i++) {
        const element = form.elements[i];
        if (element.name && element.type !== 'password' && element.type !== 'hidden') {
          formFields.push(element.name);
        }
      }
      
      const eventData = {
        type: 'form_submit',
        target: 'FORM',
        targetContent: formId,
        formAction: formAction,
        formFields: formFields.join(','),
        path: getElementPath(form),
        url: window.location.href,
        sessionId: data.sessionId,
        ip: data.ip,
        timestamp: new Date().toISOString()
      };
      
      data.events.push(eventData);
      console.log('WebAnalysis: 捕获表单提交事件', {
        formId: formId,
        formAction: formAction
      });
      
      // 发送表单提交事件数据
      sendData(goEasy, 'user_event', eventData);
      
      // 同时更新停留时间
      data.visitDuration = Math.floor((performance.now() - data.pageLoadTime) / 1000);
    });
  }

  // 获取元素路径
  function getElementPath(element) {
    if (!element || element === document.body) return '';
    let path = element.tagName.toLowerCase();
    if (element.id) path += `#${element.id}`;
    else if (element.className) path += `.${element.className.replace(/\s+/g, '.')}`;
    return getElementPath(element.parentElement) + ' > ' + path;
  }

  // 生成会话ID
  function generateSessionId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 发送数据到服务器
  function sendData(goEasy, eventType, data) {
    console.log(`WebAnalysis: 准备发送 ${eventType} 数据`);
    // 打印完整的监控数据到控制台
    console.log(`WebAnalysis: ${eventType}完整数据:`, JSON.stringify(data, null, 2));
    
    const message = JSON.stringify({
      type: eventType,
      data: data
    });
    
    // 打印发送的消息内容
    console.log(`WebAnalysis: 发送消息内容:`, message);
    
    goEasy.pubsub.publish({
      channel: 'web_analytics_channel',
      message: message,
      onSuccess: function() {
        console.log(`WebAnalysis: ${eventType}数据发送成功，数据大小: ${message.length}字节`);
      },
      onFailed: function(error) {
        console.error(`WebAnalysis: ${eventType}数据发送失败`, {
          errorCode: error.code,
          errorContent: error.content,
          eventType: eventType,
          dataSize: message.length
        });
      }
    });
  }

  // 初始化追踪器
  console.log('WebAnalysis: 开始执行追踪器初始化');
  initTracker();
  console.log('WebAnalysis: 追踪脚本初始化完成');
})();