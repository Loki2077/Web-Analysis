/**
 * JSON文件存储服务
 * 用于通过API与后端服务器通信，实现数据持久化到物理JSON文件
 * 替代原来的localStorage存储方式
 */

import { reactive } from 'vue';

// API基础URL
const API_BASE_URL = 'http://localhost:3000/api';

// 本地缓存，减少API请求次数
const state = reactive({
  domainsCache: null,
  usersCache: null,
  lastUpdate: Date.now() // 记录最后更新时间，用于刷新机制
});

/**
 * 发送API请求的通用方法
 * @param {string} url - API端点
 * @param {string} method - 请求方法 (GET, POST, PUT等)
 * @param {Object} data - 请求体数据
 * @returns {Promise<any>} 响应数据
 */
async function apiRequest(url, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, options);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

/**
 * 初始化JSON文件存储服务
 */
async function initJsonFileStorage() {
  try {
    console.log('JsonFileStorage: 初始化JSON文件存储服务');
    
    // 加载域名数据
    await loadDomainsFromFile();
    
    // 加载用户数据
    await loadUsersFromFile();
    
    console.log('JsonFileStorage: JSON文件存储服务初始化完成');
    return true;
  } catch (error) {
    console.error('JsonFileStorage: 初始化JSON文件存储服务失败', error);
    return false;
  }
}

/**
 * 从服务器加载域名数据
 */
async function loadDomainsFromFile() {
  try {
    console.log('JsonFileStorage: 开始从服务器加载域名数据');
    
    const response = await apiRequest('/domains');
    state.domainsCache = response;
    console.log(`JsonFileStorage: 成功加载${state.domainsCache.length}个域名`);
    state.lastUpdate = Date.now();
    return state.domainsCache;
  } catch (error) {
    console.error('JsonFileStorage: 加载域名数据失败', error);
    state.domainsCache = [];
    return [];
  }
}

/**
 * 从服务器加载用户数据
 */
async function loadUsersFromFile() {
  try {
    console.log('JsonFileStorage: 开始从服务器加载用户数据');
    
    const response = await apiRequest('/users');
    state.usersCache = response;
    console.log('JsonFileStorage: 成功加载用户数据');
    state.lastUpdate = Date.now();
    return state.usersCache;
  } catch (error) {
    console.error('JsonFileStorage: 加载用户数据失败', error);
    state.usersCache = {};
    return {};
  }
}

/**
 * 保存域名数据到服务器
 * @param {Array} domains - 域名数据数组
 */
async function saveDomainsToFile(domains) {
  try {
    if (!domains || !Array.isArray(domains)) {
      console.error('JsonFileStorage: 无效的域名数据', domains);
      return false;
    }
    
    console.log(`JsonFileStorage: 开始保存${domains.length}个域名到服务器`);
    
    const response = await apiRequest('/domains', 'POST', domains);
    
    if (response.success) {
      console.log('JsonFileStorage: 域名数据保存成功');
      state.domainsCache = domains;
      state.lastUpdate = Date.now();
      return true;
    } else {
      console.error('JsonFileStorage: 保存域名数据失败', response.error);
      return false;
    }
  } catch (error) {
    console.error('JsonFileStorage: 保存域名数据错误', error);
    return false;
  }
}

/**
 * 保存用户数据到服务器
 * @param {Object} users - 用户数据对象
 */
async function saveUsersToFile(users) {
  try {
    if (!users || typeof users !== 'object') {
      console.error('JsonFileStorage: 无效的用户数据', users);
      return false;
    }
    
    console.log('JsonFileStorage: 开始保存用户数据到服务器');
    
    const response = await apiRequest('/users', 'POST', users);
    
    if (response.success) {
      console.log('JsonFileStorage: 用户数据保存成功');
      state.usersCache = users;
      state.lastUpdate = Date.now();
      return true;
    } else {
      console.error('JsonFileStorage: 保存用户数据失败', response.error);
      return false;
    }
  } catch (error) {
    console.error('JsonFileStorage: 保存用户数据错误', error);
    return false;
  }
}

/**
 * 添加新域名并保存到服务器
 * @param {Object} domain - 域名对象
 */
async function addDomainToStorage(domain) {
  try {
    if (!domain || !domain.name) {
      console.error('JsonFileStorage: 无效的域名对象', domain);
      return false;
    }
    
    console.log(`JsonFileStorage: 添加新域名 ${domain.name}`);
    
    const response = await apiRequest('/domains/add', 'POST', domain);
    
    if (response.success) {
      console.log(`JsonFileStorage: 域名 ${domain.name} 添加成功`);
      // 刷新域名缓存
      await loadDomainsFromFile();
      return true;
    } else {
      console.error('JsonFileStorage: 添加域名失败', response.error);
      return false;
    }
  } catch (error) {
    console.error('JsonFileStorage: 添加域名错误', error);
    return false;
  }
}

/**
 * 更新域名信息
 * @param {string} domainName - 域名名称
 * @param {Object} updatedData - 更新的域名数据
 */
async function updateDomainInStorage(domainName, updatedData) {
  try {
    if (!domainName || !updatedData) {
      console.error('JsonFileStorage: 无效的域名更新参数', { domainName, updatedData });
      return false;
    }
    
    console.log(`JsonFileStorage: 更新域名 ${domainName}`);
    
    const response = await apiRequest(`/domains/${domainName}`, 'PUT', updatedData);
    
    if (response.success) {
      console.log(`JsonFileStorage: 域名 ${domainName} 更新成功`);
      // 刷新域名缓存
      await loadDomainsFromFile();
      return true;
    } else {
      console.error('JsonFileStorage: 更新域名失败', response.error);
      return false;
    }
  } catch (error) {
    console.error('JsonFileStorage: 更新域名错误', error);
    return false;
  }
}

/**
 * 获取所有域名
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 */
async function getAllDomains(forceRefresh = false) {
  if (!state.domainsCache || forceRefresh) {
    return await loadDomainsFromFile();
  }
  return state.domainsCache;
}

/**
 * 获取所有用户
 * @param {boolean} forceRefresh - 是否强制刷新缓存
 */
async function getAllUsers(forceRefresh = false) {
  if (!state.usersCache || forceRefresh) {
    return await loadUsersFromFile();
  }
  return state.usersCache;
}

/**
 * 获取最后更新时间
 */
function getLastUpdateTime() {
  return state.lastUpdate;
}

// 导出所有方法
export default {
  initJsonFileStorage,
  loadDomainsFromFile,
  loadUsersFromFile,
  saveDomainsToFile,
  saveUsersToFile,
  addDomainToStorage,
  updateDomainInStorage,
  getAllDomains,
  getAllUsers,
  getLastUpdateTime
};