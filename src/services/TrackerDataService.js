/* eslint-disable */
/**
 * 追踪数据服务
 * 用于处理从tracker.js收集的实时数据并提供给各组件使用
 */

import { reactive } from 'vue';
// GoEasy将通过CDN动态加载，不需要在这里导入
import StorageAdapter from './StorageAdapter';

// 刷新间隔（毫秒）
const REFRESH_INTERVAL = 3000;

// 使用reactive创建响应式状态存储
const state = reactive({
  domains: [],         // 存储所有监控的域名信息
  onlineUsers: {},     // 按域名存储在线用户 {domainId: [users]}
  userActivities: {},  // 按用户存储活动记录 {userId: [activities]}
  isConnected: false,  // WebSocket连接状态
  lastRefresh: Date.now() // 最后刷新时间
});

// 刷新定时器
let refreshTimer = null;

/**
 * 启动定时刷新
 */
function startRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
  
  console.log(`监控系统: 启动定时刷新，间隔${REFRESH_INTERVAL}毫秒`);
  refreshTimer = setInterval(async () => {
    await refreshDomainData();
  }, REFRESH_INTERVAL);
}

/**
 * 停止定时刷新
 */
function stopRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
    console.log('监控系统: 停止定时刷新');
  }
}

/**
 * 刷新域名数据
 */
async function refreshDomainData() {
  try {
    // 检查存储服务的最后更新时间
    const storageLastUpdate = StorageAdapter.getLastUpdateTime();
    
    // 如果存储的数据比当前状态新，则刷新数据
    if (storageLastUpdate > state.lastRefresh) {
      console.log('监控系统: 检测到存储数据更新，刷新域名数据');
      
      // 从存储加载最新域名数据
      const domains = await StorageAdapter.getAllDomains(true); // 强制刷新
      
      if (domains && Array.isArray(domains)) {
        // 更新域名列表，保持现有的在线用户数据
        domains.forEach(domain => {
          const existingDomain = state.domains.find(d => d.id === domain.id);
          if (existingDomain) {
            // 保留现有的在线用户数量
            domain.onlineCount = existingDomain.onlineCount || 0;
          } else {
            // 初始化新域名的在线用户数组
            state.onlineUsers[domain.id] = [];
          }
        });
        
        // 更新状态
        state.domains = domains;
        state.lastRefresh = Date.now();
        console.log(`监控系统: 已刷新${domains.length}个域名数据`);
      }
    }
  } catch (error) {
    console.error('监控系统: 刷新域名数据错误', error);
  }
}

/**
 * 初始化追踪服务
 * @param {Object} goEasy - 从main.js传入的GoEasy实例
 */
async function initTrackerService(goEasy) {
  console.log('监控系统: 初始化追踪服务');
  
  // 如果没有传入GoEasy实例，尝试自动创建一个
  if (!goEasy) {
    console.log('监控系统: GoEasy实例未提供，尝试自动创建');
    try {
      // 检查全局是否已有GoEasy
      if (typeof GoEasy !== 'undefined') {
        goEasy = GoEasy.getInstance({
          host: 'hangzhou.goeasy.io',
          appkey: 'BC-3c9aebd68555496aa086c46caf78393d',
          modules: ['pubsub']
        });
        
        // 自动连接
        goEasy.connect({
          onSuccess: function() {
            console.log('监控系统: 自动创建的GoEasy连接成功');
            // 连接成功后继续初始化
            continueInitialization(goEasy);
          },
          onFailed: function(error) {
            console.error('监控系统: 自动创建的GoEasy连接失败', error.code, error.content);
          }
        });
        return; // 等待连接回调
      } else {
        console.error('监控系统: 无法自动创建GoEasy实例，GoEasy未定义');
      }
    } catch (error) {
      console.error('监控系统: 自动创建GoEasy实例失败', error);
    }
  } else {
    // 如果提供了GoEasy实例，直接继续初始化
    continueInitialization(goEasy);
  }
}

/**
 * 继续初始化过程（在GoEasy连接后）
 * @param {Object} goEasy - GoEasy实例
 */
async function continueInitialization(goEasy) {
  if (!goEasy) {
    console.error('监控系统: GoEasy实例未提供，无法继续初始化');
    return;
  }
  
  state.isConnected = goEasy.getConnectionStatus() === 'connected';
  
  // 初始化存储服务
  await StorageAdapter.initStorage();
  
  // 从存储加载域名数据
  const storedDomains = await StorageAdapter.getAllDomains();
  // 从存储加载用户数据
  const loadedUsers = await StorageAdapter.loadUsers(); // 加载持久化的用户数据
  const userTimeout = 5 * 60 * 1000; // 5分钟超时

  if (storedDomains && storedDomains.length > 0) {
    console.log(`监控系统: 从JSON文件存储加载了${storedDomains.length}个域名`);
    state.domains = storedDomains;
    
    // 初始化并恢复在线用户状态
    storedDomains.forEach(domain => {
      state.onlineUsers[domain.id] = []; // 先初始化为空数组
      const persistedUsers = loadedUsers[domain.id] || [];
      const now = Date.now();
      let onlineCount = 0;

      persistedUsers.forEach(user => {
        // 检查用户是否在超时时间内活跃
        if (user.lastActivityTimestamp && (now - user.lastActivityTimestamp < userTimeout)) {
          // 需要补充 OnlineUsers.vue 可能需要的字段，如果持久化数据中没有
          const restoredUser = {
            ...user, // 包含 id, sessionId, ip, deviceFingerprint, firstVisit, deviceType, os, browser, lastActivityTimestamp
            url: user.url || '未知URL (恢复)', // 尝试恢复，否则设为默认
            referrer: user.referrer || '未知来源 (恢复)',
            visitTime: user.visitTime || new Date(user.lastActivityTimestamp).toLocaleString(), // 使用最后活动时间近似
            onlineTime: calculateOnlineTime(new Date(user.lastActivityTimestamp).toLocaleString()), // 基于最后活动时间计算
            screenResolution: user.screenResolution || '未知',
            language: user.language || '未知',
            timezone: user.timezone || '未知',
            cookieEnabled: user.cookieEnabled !== undefined ? user.cookieEnabled : '未知',
            webglSupport: user.webglSupport !== undefined ? user.webglSupport : '未知',
            canvasFingerprint: user.canvasFingerprint || user.sessionId?.substring(0, 8) || '未知'
          };
          state.onlineUsers[domain.id].push(restoredUser);
          onlineCount++;
        }
      });

      // 更新域名的在线计数
      domain.onlineCount = onlineCount;
      console.log(`监控系统: 域名 ${domain.name} 恢复了 ${onlineCount} 个在线用户`);
    });
  } else {
    console.log('监控系统: 未找到域名数据，请确保已添加监控域名');
    // 添加一个默认的localhost域名用于测试
    const localhostDomain = {
      id: Date.now(),
      name: 'localhost',
      onlineCount: 0
    };
    state.domains.push(localhostDomain);
    state.onlineUsers[localhostDomain.id] = [];
    await StorageAdapter.addDomain(localhostDomain);
    console.log('监控系统: 已添加localhost作为默认测试域名');
  }
  
  // 订阅数据频道
  subscribeToDataChannel(goEasy);
  
  // 启动定时刷新
  startRefreshTimer();
}



/**
 * 订阅数据频道
 */
function subscribeToDataChannel(goEasy) {
  if (!goEasy) {
    console.error('监控系统: GoEasy实例不存在');
    return;
  }
  
  // 订阅页面访问数据频道
  goEasy.pubsub.subscribe({
    channel: 'web_analytics_channel', // 与tracker.js中使用的channel保持一致
    onMessage: function(message) {
      try {
        const data = JSON.parse(message.content);
        const messageData = data.data; // 解析嵌套的data字段
        
        // 根据数据类型处理
        if (data.type === 'page_view') {
          processPageViewData(messageData);
          console.log('监控系统: 处理页面访问数据', messageData);
        } else if (data.type === 'user_event') {
          processUserEventData(messageData);
          console.log('监控系统: 处理用户事件数据', messageData);
        } else if (data.type === 'visit_update') {
          // 处理访问更新数据
          updateUserData(new URL(messageData.url).hostname, messageData);
          console.log('监控系统: 处理访问更新数据', messageData);
        } else if (data.type === 'page_exit') {
          // 处理页面退出数据
          console.log('监控系统: 处理页面退出数据', messageData);
          processPageExitData(messageData);
        } else {
          console.log('监控系统: 收到未知类型数据', data.type, messageData);
        }
      } catch (error) {
        console.error('监控系统: 处理订阅消息错误', error);
      }
    },
    onSuccess: function() {
      console.log('监控系统: 数据频道订阅成功');
    },
    onFailed: function(error) {
      console.error('监控系统: 数据频道订阅失败', error.code, error.content);
    }
  });
}

/**
 * 处理页面访问数据
 */
function processPageViewData(data) {
  try {
    // 确保数据有效
    if (!data || !data.url) {
      console.error('监控系统: 无效的页面访问数据', data);
      return;
    }
    
    // 提取域名信息
    const url = new URL(data.url);
    const domainName = url.hostname;
    
    // 更新域名列表
    updateDomainData(domainName);
    
    // 更新用户列表
    updateUserData(domainName, data);
  } catch (error) {
    console.error('监控系统: 处理页面访问数据错误', error);
  }
}

/**
 * 处理用户事件数据
 */
function processUserEventData(data) {
  try {
    // 确保数据有效
    if (!data) {
      console.error('监控系统: 无效的用户事件数据', data);
      return;
    }
    
    // 添加用户活动记录
    if (data.sessionId) {
      if (!state.userActivities[data.sessionId]) {
        state.userActivities[data.sessionId] = [];
      }
      
      // 构建更有意义的操作描述
      let actionDescription = data.type || '未知操作';
      
      // 如果是点击事件且有目标内容，则添加内容描述
      if (data.type === 'click' && data.targetContent) {
        actionDescription = `点击「${data.targetContent}」`;
      } else if (data.type === 'click') {
        actionDescription = `点击${data.target || '元素'}`;
      }
      
      console.log('监控系统: 记录用户活动', {
        sessionId: data.sessionId,
        action: actionDescription,
        url: data.url
      });
      
      state.userActivities[data.sessionId].push({
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        ip: data.ip || '未知',
        url: decodeURIComponent(data.url) || '未知URL',
        action: actionDescription,
        deviceType: detectDeviceType(data.userAgent),
        status: '成功'
      });
    } else {
      console.warn('监控系统: 用户事件数据缺少sessionId', data);
    }
  } catch (error) {
    console.error('监控系统: 处理用户事件数据错误', error);
  }
}

/**
 * 更新域名数据
 */
async function updateDomainData(domainName) {
  try {
    if (!domainName) {
      console.error('监控系统: 无效的域名', domainName);
      return;
    }
    
    // 查找域名是否已存在
    let domain = state.domains.find(d => d.name === domainName);
    
    if (!domain) {
      // 添加新域名
      domain = {
        id: Date.now(),
        name: domainName,
        onlineCount: 0
      };
      state.domains.push(domain);
      state.onlineUsers[domain.id] = [];
      
      // 将新域名保存到存储
      const result = await StorageAdapter.addDomain(domain);
      if (result) {
        console.log(`监控系统: 新域名 ${domainName} 已添加并保存到${StorageAdapter.isLocalDevelopment ? '本地' : 'Blob'}存储`);
        // 立即保存所有域名数据，确保数据一致性
        await saveStateToStorage();
        // 更新最后刷新时间
        state.lastRefresh = Date.now();
      } else {
        console.error(`监控系统: 新域名 ${domainName} 保存失败`);
      }
    }
    
    // 更新在线用户数量 - 确保与实际用户列表同步
    if (domain && state.onlineUsers[domain.id]) {
      const oldCount = domain.onlineCount;
      domain.onlineCount = state.onlineUsers[domain.id].length || 0;
      
      // 如果在线用户数量发生变化，更新存储
      if (oldCount !== domain.onlineCount) {
        console.log(`监控系统: 域名 ${domainName} 在线用户数已更新为 ${domain.onlineCount}`);
        
        // 如果支持直接更新域名，则使用更新方法
        if (StorageAdapter.updateDomain) {
          await StorageAdapter.updateDomain(domain);
          state.lastRefresh = Date.now();
        }
      }
    }
  } catch (error) {
    console.error('监控系统: 更新域名数据错误', error);
  }
}

/**
 * 更新用户数据
 */
function updateUserData(domainName, data) {
  try {
    // 验证参数
    if (!domainName || !data) {
      console.error('监控系统: 更新用户数据参数无效', { domainName, data });
      return;
    }
    
    // 确保sessionId存在
    if (!data.sessionId) {
      console.warn('监控系统: 用户数据缺少sessionId', data);
      return;
    }
    
    // 查找域名
    const domain = state.domains.find(d => d.name === domainName);
    if (!domain) {
      console.warn(`监控系统: 找不到域名 ${domainName}`);
      return;
    }
    
    // 确保域名ID对应的用户数组已初始化
    if (!state.onlineUsers[domain.id]) {
      state.onlineUsers[domain.id] = [];
    }
    
    // 查找用户是否已存在 - 使用设备指纹作为主要标识符
    // 首先尝试使用完整的设备指纹匹配
    let userIndex = -1;
    
    // 如果有设备指纹，优先使用设备指纹匹配
    if (data.deviceFingerprint) {
      userIndex = state.onlineUsers[domain.id].findIndex(u => 
        u.deviceFingerprint === data.deviceFingerprint
      );
    }
    
    // 如果没有找到匹配的设备指纹，尝试使用Canvas指纹和IP组合匹配
    if (userIndex === -1 && data.canvasFingerprint) {
      userIndex = state.onlineUsers[domain.id].findIndex(u => 
        u.canvasFingerprint === data.canvasFingerprint && u.ip === data.ip
      );
    }
    
    // 最后尝试使用sessionId前缀和IP组合匹配（兼容旧数据）
    if (userIndex === -1) {
      userIndex = state.onlineUsers[domain.id].findIndex(u => 
        u.ip === data.ip && u.sessionId.substring(0, 8) === data.sessionId.substring(0, 8)
      );
    }

    const nowTimestamp = Date.now(); // 获取当前时间戳

    if (userIndex === -1) {
      // 添加新用户
      const generatedFingerprint = data.deviceFingerprint || 
        generateDeviceFingerprint(data.userAgent, data.screenResolution, data.language, data.ip, data.canvasFingerprint);
      
      const newUser = {
        id: Date.now(),
        sessionId: data.sessionId,
        ip: data.ip || '未知IP',
        url: data.url ? decodeURIComponent(data.url) : '未知URL',
        referrer: data.referrer || '直接访问',
        visitTime: new Date().toLocaleString(),
        onlineTime: '刚刚',
        deviceType: detectDeviceType(data.userAgent),
        os: detectOS(data.userAgent),
        browser: detectBrowser(data.userAgent),
        screenResolution: data.screenResolution || '未知',
        language: data.language || navigator.language,
        timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        firstVisit: new Date().toLocaleString(),
        cookieEnabled: navigator.cookieEnabled,
        webglSupport: detectWebGLSupport(),
        canvasFingerprint: data.canvasFingerprint || data.sessionId.substring(0, 8),
        deviceFingerprint: generatedFingerprint,
        lastActivityTimestamp: nowTimestamp // 添加最后活动时间戳
      };
      
      state.onlineUsers[domain.id].push(newUser);
      domain.onlineCount = state.onlineUsers[domain.id].length;
    } else {
      // 更新现有用户
      const user = state.onlineUsers[domain.id][userIndex];
      user.ip = data.ip || user.ip;
      user.url = data.url ? decodeURIComponent(data.url) : user.url;
      user.onlineTime = calculateOnlineTime(user.visitTime);
      user.lastActivityTimestamp = nowTimestamp; // 更新最后活动时间戳
      
      // 更新设备指纹（如果有新的）
      if (data.deviceFingerprint && data.deviceFingerprint !== '未生成') {
        user.deviceFingerprint = data.deviceFingerprint;
      }
      
      // 更新Canvas指纹（如果有新的）
      if (data.canvasFingerprint) {
        user.canvasFingerprint = data.canvasFingerprint;
      }
      
      // 更新会话ID（保持最新）
      user.sessionId = data.sessionId || user.sessionId;
    }
  } catch (error) {
    console.error('监控系统: 更新用户数据错误', error);
  }
}

/**
 * 检测设备类型
 */
function detectDeviceType(userAgent) {
  if (!userAgent) return '未知';
  
  if (/mobile/i.test(userAgent)) {
    return '移动端';
  } else if (/tablet|ipad/i.test(userAgent)) {
    return '平板';
  } else {
    return '桌面端';
  }
}

/**
 * 检测操作系统
 */
function detectOS(userAgent) {
  if (!userAgent) return '未知';
  
  if (/windows/i.test(userAgent)) {
    return 'Windows';
  } else if (/macintosh|mac os x/i.test(userAgent)) {
    return 'macOS';
  } else if (/linux/i.test(userAgent)) {
    return 'Linux';
  } else if (/android/i.test(userAgent)) {
    return 'Android';
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    return 'iOS';
  } else {
    return '未知';
  }
}

/**
 * 检测浏览器
 */
function detectBrowser(userAgent) {
  if (!userAgent) return '未知';
  
  // 注意：Edge浏览器的UA字符串包含Chrome和Edg
  if (/edg(?:e|a|ios)/i.test(userAgent)) {
    return 'Edge';
  } else if (/firefox/i.test(userAgent)) {
    return 'Firefox';
  } else if (/chrome/i.test(userAgent)) {
    return 'Chrome';
  } else if (/safari/i.test(userAgent)) {
    return 'Safari';
  } else if (/msie|trident/i.test(userAgent)) {
    return 'Internet Explorer';
  } else {
    return '未知';
  }
}

/**
 * 检测WebGL支持
 */
function detectWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * 生成设备指纹
 * 结合多种设备特征生成更可靠的指纹
 */
function generateDeviceFingerprint(userAgent, screenResolution, language, ip, canvasFingerprint) {
  try {
    // 组合多种稳定信息生成指纹，移除不稳定的特征
    const components = {
      // 核心稳定特征
      userAgent: userAgent || '',
      os: detectOS(userAgent) || '',
      browser: detectBrowser(userAgent) || '',
      screenResolution: screenResolution || '',
      language: language || '',
      ip: ip ? ip.split('.').slice(0, 3).join('.') : '', // 只使用IP前三段，增加稳定性
      
      // 使用canvasFingerprint作为辅助标识，但不作为主要特征
      canvasFingerprint: canvasFingerprint ? canvasFingerprint.substring(0, 8) : '',
      
      // 添加更多稳定特征
      platform: navigator.platform || '',
      cpuCores: navigator.hardwareConcurrency || '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    };
    
    // 将对象转换为字符串
    const fingerprintString = JSON.stringify(components);
    
    // 使用更稳定的哈希算法 (djb2)
    let hash = 5381;
    for (let i = 0; i < fingerprintString.length; i++) {
      hash = ((hash << 5) + hash) + fingerprintString.charCodeAt(i);
    }
    
    // 转换为正整数并生成16进制字符串
    hash = Math.abs(hash);
    return hash.toString(16).padStart(8, '0').substring(0, 8);
  } catch (error) {
    console.error('监控系统: 生成设备指纹错误', error);
    return '生成失败';
  }
}

/**
 * 计算在线时间
 */
function calculateOnlineTime(visitTime) {
  const visitDate = new Date(visitTime);
  const now = new Date();
  const diffInMinutes = Math.floor((now - visitDate) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return '刚刚';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟`;
  } else {
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = diffInMinutes % 60;
    return `${hours}小时${minutes > 0 ? ` ${minutes}分钟` : ''}`;
  }
}

/**
 * 获取指定域名的在线用户
 */
function getOnlineUsersByDomain(domainId) {
  return state.onlineUsers[domainId] || [];
}

/**
 * 获取指定用户的活动记录
 */
function getUserActivities(userId) {
  return state.userActivities[userId] || [];
}

/**
 * 获取所有活动记录
 */
function getAllActivities() {
  let allActivities = [];
  Object.values(state.userActivities).forEach(activities => {
    allActivities = [...allActivities, ...activities];
  });
  return allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}



/**
 * 处理页面退出数据
 * 当用户关闭页面时，将其标记为离线
 */
function processPageExitData(data) {
  try {
    // 确保数据有效
    if (!data || !data.url || !data.sessionId) {
      console.error('监控系统: 无效的页面退出数据', data);
      return;
    }
    
    // 提取域名信息
    const url = new URL(data.url);
    const domainName = url.hostname;
    
    // 查找域名
    const domain = state.domains.find(d => d.name === domainName);
    if (!domain) {
      console.warn(`监控系统: 找不到域名 ${domainName}`);
      return;
    }
    
    // 确保域名ID对应的用户数组已初始化
    if (!state.onlineUsers[domain.id]) {
      return;
    }
    
    // 查找用户
    let userIndex = -1;
    
    // 如果有设备指纹，优先使用设备指纹匹配
    if (data.deviceFingerprint) {
      userIndex = state.onlineUsers[domain.id].findIndex(u => 
        u.deviceFingerprint === data.deviceFingerprint
      );
    }
    
    // 如果没有找到匹配的设备指纹，尝试使用sessionId匹配
    if (userIndex === -1) {
      userIndex = state.onlineUsers[domain.id].findIndex(u => 
        u.sessionId === data.sessionId
      );
    }
    
    // 如果找到用户，将其从在线用户列表中移除
    if (userIndex !== -1) {
      console.log(`监控系统: 用户 ${data.sessionId} 已离线，停留时间: ${data.visitDuration}秒`);
      // 从在线用户列表中移除
      state.onlineUsers[domain.id].splice(userIndex, 1);
      // 更新域名的在线用户数量
      domain.onlineCount = state.onlineUsers[domain.id].length;
      console.log(`监控系统: 域名 ${domainName} 在线用户数已更新为 ${domain.onlineCount}`);
      
      // 保存更新后的状态到存储，确保数据一致性
      saveStateToStorage().then(() => {
        console.log(`监控系统: 用户离线后状态已保存到${StorageAdapter.isLocalDevelopment ? '本地' : 'Blob'}存储`);
      }).catch(error => {
        console.error('监控系统: 保存状态失败', error);
      });
    }
  } catch (error) {
    console.error('监控系统: 处理页面退出数据错误', error);
  }
}

/**
 * 保存当前状态到存储
 * 定期将域名和用户数据保存到存储（本地存储或Blob存储）
 */
async function saveStateToStorage() {
  try {
    console.log('监控系统: 开始保存状态到存储');
    
    // 同步一次在线计数，确保保存的是最新的
    syncDomainOnlineCount();

    // 保存域名数据
    await StorageAdapter.saveDomains(state.domains);
    
    // 保存用户数据（包含最后活动时间）
    const usersToSave = {};
    Object.keys(state.onlineUsers).forEach(domainId => {
      usersToSave[domainId] = state.onlineUsers[domainId].map(user => ({
        // 保存必要信息以供恢复
        id: user.id,
        sessionId: user.sessionId,
        ip: user.ip,
        deviceFingerprint: user.deviceFingerprint,
        firstVisit: user.firstVisit,
        deviceType: user.deviceType,
        os: user.os,
        browser: user.browser,
        lastActivityTimestamp: user.lastActivityTimestamp, // 保存最后活动时间戳
        // 可以选择性保存更多信息，如果恢复时需要
        url: user.url, 
        referrer: user.referrer,
        visitTime: user.visitTime,
        screenResolution: user.screenResolution,
        language: user.language,
        timezone: user.timezone,
        cookieEnabled: user.cookieEnabled,
        webglSupport: user.webglSupport,
        canvasFingerprint: user.canvasFingerprint
      }));
    });
    
    await StorageAdapter.saveUsers(usersToSave);
    // 使用 StorageAdapter 判断存储类型
    console.log(`监控系统: 状态保存到 ${StorageAdapter.isLocalDevelopment ? '本地' : 'Blob'} 存储完成`); 
    
    return true;
  } catch (error) {
    console.error('监控系统: 保存状态到存储失败', error);
    return false;
  }
}

/**
 * 同步所有域名的在线用户计数
 * 确保域名的onlineCount属性与实际在线用户数量一致
 */
function syncDomainOnlineCount() {
  try {
    state.domains.forEach(domain => {
      const actualCount = state.onlineUsers[domain.id]?.length || 0;
      if (domain.onlineCount !== actualCount) {
        console.log(`监控系统: 域名 ${domain.name} 在线用户计数不一致，从 ${domain.onlineCount} 更新为 ${actualCount}`);
        domain.onlineCount = actualCount;
      }
    });
    return true;
  } catch (error) {
    console.error('监控系统: 同步域名在线用户计数失败', error);
    return false;
  }
}

// 设置定期保存状态的定时器（每5分钟保存一次）
setInterval(() => {
  syncDomainOnlineCount();
  saveStateToStorage();
}, 5 * 60 * 1000);

// 设置更频繁的域名计数同步（每30秒同步一次）
setInterval(syncDomainOnlineCount, 30 * 1000);

// 导出服务和状态
export default {
  state,
  initTrackerService,
  getOnlineUsersByDomain,
  getUserActivities,
  getAllActivities,
  saveStateToStorage,
  refreshDomainData,
  startRefreshTimer,
  stopRefreshTimer
};