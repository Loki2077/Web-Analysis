/**
 * Blob存储服务
 * 用于处理域名数据和用户数据的持久化存储
 * 使用Vercel Blob Storage API
 */

import axios from 'axios';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config({ path: '.env.local' });

// 获取Blob存储Token
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || '';

// Blob存储配置
const BLOB_STORE_URL = 'https://api.vercel.com/v9/blobs';
const DOMAINS_BLOB_KEY = 'web-analysis-domains';
const USERS_BLOB_KEY = 'web-analysis-users';

// 本地缓存，减少API调用
let domainsCache = null;
let usersCache = null;

/**
 * 初始化Blob存储服务
 * 加载已存储的域名和用户数据
 */
async function initBlobStorage() {
  try {
    console.log('BlobStorage: 初始化Blob存储服务');
    // 加载域名数据
    await loadDomainsFromBlob();
    // 加载用户数据
    await loadUsersFromBlob();
    
    console.log('BlobStorage: Blob存储服务初始化完成');
    return true;
  } catch (error) {
    console.error('BlobStorage: 初始化Blob存储服务失败', error);
    return false;
  }
}

/**
 * 从Blob存储加载域名数据
 */
async function loadDomainsFromBlob() {
  try {
    console.log('BlobStorage: 开始从Blob加载域名数据');
    
    console.log('BlobStorage: 使用Token:', BLOB_TOKEN.substring(0, 10) + '...');
    const response = await axios.get(`${BLOB_STORE_URL}/${DOMAINS_BLOB_KEY}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLOB_TOKEN}`
      }
    });
    
    if (response.status === 200 && response.data) {
      domainsCache = response.data;
      console.log(`BlobStorage: 成功加载${domainsCache.length}个域名`);
      return domainsCache;
    } else {
      console.log('BlobStorage: 未找到域名数据，将创建新的存储');
      domainsCache = [];
      return [];
    }
  } catch (error) {
    // 如果是404错误，说明Blob不存在，这是正常的首次使用情况
    if (error.response && error.response.status === 404) {
      console.log('BlobStorage: 域名Blob不存在，将创建新的存储');
      domainsCache = [];
      return [];
    }
    
    console.error('BlobStorage: 加载域名数据失败', error);
    domainsCache = [];
    return [];
  }
}

/**
 * 从Blob存储加载用户数据
 */
async function loadUsersFromBlob() {
  try {
    console.log('BlobStorage: 开始从Blob加载用户数据');
    
    const response = await axios.get(`${BLOB_STORE_URL}/${USERS_BLOB_KEY}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLOB_TOKEN}`
      }
    });
    
    if (response.status === 200 && response.data) {
      usersCache = response.data;
      console.log(`BlobStorage: 成功加载用户数据`);
      return usersCache;
    } else {
      console.log('BlobStorage: 未找到用户数据，将创建新的存储');
      usersCache = {};
      return {};
    }
  } catch (error) {
    // 如果是404错误，说明Blob不存在，这是正常的首次使用情况
    if (error.response && error.response.status === 404) {
      console.log('BlobStorage: 用户Blob不存在，将创建新的存储');
      usersCache = {};
      return {};
    }
    
    console.error('BlobStorage: 加载用户数据失败', error);
    usersCache = {};
    return {};
  }
}

/**
 * 保存域名数据到Blob存储
 * @param {Array} domains - 域名数据数组
 */
async function saveDomainsToBlobStorage(domains) {
  try {
    if (!domains || !Array.isArray(domains)) {
      console.error('BlobStorage: 无效的域名数据', domains);
      return false;
    }
    
    console.log(`BlobStorage: 开始保存${domains.length}个域名到Blob存储`);
    
    const response = await axios.put(`${BLOB_STORE_URL}/${DOMAINS_BLOB_KEY}`, domains, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLOB_TOKEN}`
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('BlobStorage: 域名数据保存成功');
      domainsCache = domains;
      return true;
    } else {
      console.error('BlobStorage: 域名数据保存失败', response.status);
      return false;
    }
  } catch (error) {
    console.error('BlobStorage: 保存域名数据错误', error);
    return false;
  }
}

/**
 * 保存用户数据到Blob存储
 * @param {Object} users - 用户数据对象
 */
async function saveUsersToBlobStorage(users) {
  try {
    if (!users || typeof users !== 'object') {
      console.error('BlobStorage: 无效的用户数据', users);
      return false;
    }
    
    console.log('BlobStorage: 开始保存用户数据到Blob存储');
    
    const response = await axios.put(`${BLOB_STORE_URL}/${USERS_BLOB_KEY}`, users, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLOB_TOKEN}`
      }
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('BlobStorage: 用户数据保存成功');
      usersCache = users;
      return true;
    } else {
      console.error('BlobStorage: 用户数据保存失败', response.status);
      return false;
    }
  } catch (error) {
    console.error('BlobStorage: 保存用户数据错误', error);
    return false;
  }
}

/**
 * 添加新域名并保存到Blob存储
 * @param {Object} domain - 域名对象
 */
async function addDomainToStorage(domain) {
  try {
    if (!domain || !domain.name) {
      console.error('BlobStorage: 无效的域名对象', domain);
      return false;
    }
    
    // 加载最新的域名数据
    const domains = domainsCache || await loadDomainsFromBlob();
    
    // 检查域名是否已存在
    if (domains.some(d => d.name === domain.name)) {
      console.log(`BlobStorage: 域名 ${domain.name} 已存在，不需要添加`);
      return true;
    }
    
    // 添加新域名
    domains.push(domain);
    
    // 保存更新后的域名列表
    return await saveDomainsToBlobStorage(domains);
  } catch (error) {
    console.error('BlobStorage: 添加域名错误', error);
    return false;
  }
}

/**
 * 获取所有存储的域名
 */
async function getAllDomains() {
  return domainsCache || await loadDomainsFromBlob();
}

/**
 * 获取所有存储的用户数据
 */
async function getAllUsers() {
  return usersCache || await loadUsersFromBlob();
}

// 导出服务
export default {
  initBlobStorage,
  loadDomainsFromBlob,
  loadUsersFromBlob,
  saveDomainsToBlobStorage,
  saveUsersToBlobStorage,
  addDomainToStorage,
  getAllDomains,
  getAllUsers
};