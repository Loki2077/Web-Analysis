/**
 * 本地存储服务
 * 用于在本地开发环境中替代Blob存储服务，解决CORS问题
 * 使用localStorage进行本地数据持久化
 */

// 本地存储键名
const DOMAINS_STORAGE_KEY = 'web-analysis-domains';
const USERS_STORAGE_KEY = 'web-analysis-users';

// 本地缓存，减少localStorage操作
let domainsCache = null;
let usersCache = null;

/**
 * 初始化本地存储服务
 * 加载已存储的域名和用户数据
 */
async function initLocalStorage() {
  try {
    console.log('LocalStorage: 初始化本地存储服务');
    // 加载域名数据
    await loadDomainsFromLocal();
    // 加载用户数据
    await loadUsersFromLocal();
    
    console.log('LocalStorage: 本地存储服务初始化完成');
    return true;
  } catch (error) {
    console.error('LocalStorage: 初始化本地存储服务失败', error);
    return false;
  }
}

/**
 * 从本地存储加载域名数据
 */
async function loadDomainsFromLocal() {
  try {
    console.log('LocalStorage: 开始从本地加载域名数据');
    
    const domainsData = localStorage.getItem(DOMAINS_STORAGE_KEY);
    
    if (domainsData) {
      domainsCache = JSON.parse(domainsData);
      console.log(`LocalStorage: 成功加载${domainsCache.length}个域名`);
      return domainsCache;
    } else {
      console.log('LocalStorage: 未找到域名数据，将创建新的存储');
      domainsCache = [];
      return [];
    }
  } catch (error) {
    console.error('LocalStorage: 加载域名数据失败', error);
    domainsCache = [];
    return [];
  }
}

/**
 * 从本地存储加载用户数据
 */
async function loadUsersFromLocal() {
  try {
    console.log('LocalStorage: 开始从本地加载用户数据');
    
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    
    if (usersData) {
      usersCache = JSON.parse(usersData);
      console.log(`LocalStorage: 成功加载用户数据`);
      return usersCache;
    } else {
      console.log('LocalStorage: 未找到用户数据，将创建新的存储');
      usersCache = {};
      return {};
    }
  } catch (error) {
    console.error('LocalStorage: 加载用户数据失败', error);
    usersCache = {};
    return {};
  }
}

/**
 * 保存域名数据到本地存储
 * @param {Array} domains - 域名数据数组
 */
async function saveDomainsToLocalStorage(domains) {
  try {
    if (!domains || !Array.isArray(domains)) {
      console.error('LocalStorage: 无效的域名数据', domains);
      return false;
    }
    
    console.log(`LocalStorage: 开始保存${domains.length}个域名到本地存储`);
    
    localStorage.setItem(DOMAINS_STORAGE_KEY, JSON.stringify(domains));
    console.log('LocalStorage: 域名数据保存成功');
    domainsCache = domains;
    return true;
  } catch (error) {
    console.error('LocalStorage: 保存域名数据错误', error);
    return false;
  }
}

/**
 * 保存用户数据到本地存储
 * @param {Object} users - 用户数据对象
 */
async function saveUsersToLocalStorage(users) {
  try {
    if (!users || typeof users !== 'object') {
      console.error('LocalStorage: 无效的用户数据', users);
      return false;
    }
    
    console.log('LocalStorage: 开始保存用户数据到本地存储');
    
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    console.log('LocalStorage: 用户数据保存成功');
    usersCache = users;
    return true;
  } catch (error) {
    console.error('LocalStorage: 保存用户数据错误', error);
    return false;
  }
}

/**
 * 添加新域名并保存到本地存储
 * @param {Object} domain - 域名对象
 */
async function addDomainToStorage(domain) {
  try {
    if (!domain || !domain.name) {
      console.error('LocalStorage: 无效的域名对象', domain);
      return false;
    }
    
    // 加载最新的域名数据
    const domains = domainsCache || await loadDomainsFromLocal();
    
    // 检查域名是否已存在
    if (domains.some(d => d.name === domain.name)) {
      console.log(`LocalStorage: 域名 ${domain.name} 已存在，不需要添加`);
      return true;
    }
    
    // 添加新域名
    domains.push(domain);
    
    // 保存更新后的域名列表
    return await saveDomainsToLocalStorage(domains);
  } catch (error) {
    console.error('LocalStorage: 添加域名错误', error);
    return false;
  }
}

/**
 * 获取所有存储的域名
 */
async function getAllDomains() {
  return domainsCache || await loadDomainsFromLocal();
}

/**
 * 获取所有存储的用户数据
 */
async function getAllUsers() {
  return usersCache || await loadUsersFromLocal();
}

// 导出服务
export default {
  initLocalStorage,
  loadDomainsFromLocal,
  loadUsersFromLocal,
  saveDomainsToLocalStorage,
  saveUsersToLocalStorage,
  addDomainToStorage,
  getAllDomains,
  getAllUsers
};