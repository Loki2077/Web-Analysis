/**
 * 存储服务适配器
 * 根据运行环境自动选择使用本地存储或Blob存储
 * 在本地开发环境使用localStorage，在生产环境使用Vercel Blob Storage
 */

import BlobStorageService from './BlobStorageService';
import LocalStorageService from './LocalStorageService';

// 判断当前环境
const isLocalDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 根据环境选择存储服务
const storageService = isLocalDevelopment ? LocalStorageService : BlobStorageService;

// 初始化存储服务
async function initStorage() {
  console.log(`StorageAdapter: 使用${isLocalDevelopment ? '本地存储' : 'Blob存储'}服务`);
  
  if (isLocalDevelopment) {
    return await LocalStorageService.initLocalStorage();
  } else {
    return await BlobStorageService.initBlobStorage();
  }
}

// 导出适配的方法
export default {
  // 初始化存储
  initStorage,
  
  // 域名相关方法
  loadDomains: isLocalDevelopment ? LocalStorageService.loadDomainsFromLocal : BlobStorageService.loadDomainsFromBlob,
  saveDomains: isLocalDevelopment ? LocalStorageService.saveDomainsToLocalStorage : BlobStorageService.saveDomainsToBlobStorage,
  addDomain: storageService.addDomainToStorage,
  getAllDomains: storageService.getAllDomains,
  
  // 用户相关方法
  loadUsers: isLocalDevelopment ? LocalStorageService.loadUsersFromLocal : BlobStorageService.loadUsersFromBlob,
  saveUsers: isLocalDevelopment ? LocalStorageService.saveUsersToLocalStorage : BlobStorageService.saveUsersToBlobStorage,
  getAllUsers: storageService.getAllUsers,
  
  // 环境信息
  isLocalDevelopment
};