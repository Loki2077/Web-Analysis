/**
 * 存储服务适配器
 * 使用JSON文件存储服务进行数据持久化
 */

import JsonFileStorageService from './JsonFileStorageService';

// 初始化存储服务
async function initStorage() {
  console.log('StorageAdapter: 使用JSON文件存储服务');
  return await JsonFileStorageService.initJsonFileStorage();
}

// 获取适配的方法
const adaptedMethods = {
  // 域名相关方法
  loadDomains: JsonFileStorageService.loadDomainsFromFile,
  saveDomains: JsonFileStorageService.saveDomainsToFile,
  addDomain: JsonFileStorageService.addDomainToStorage,
  updateDomain: JsonFileStorageService.updateDomainInStorage,
  getAllDomains: JsonFileStorageService.getAllDomains,
  
  // 用户相关方法
  loadUsers: JsonFileStorageService.loadUsersFromFile,
  saveUsers: JsonFileStorageService.saveUsersToFile,
  getAllUsers: JsonFileStorageService.getAllUsers,
  
  // 获取最后更新时间
  getLastUpdateTime: JsonFileStorageService.getLastUpdateTime
};

// 导出适配的方法
export default {
  // 初始化存储
  initStorage,
  
  // 域名相关方法
  loadDomains: adaptedMethods.loadDomains,
  saveDomains: adaptedMethods.saveDomains,
  addDomain: adaptedMethods.addDomain,
  updateDomain: adaptedMethods.updateDomain,
  getAllDomains: adaptedMethods.getAllDomains,
  
  // 用户相关方法
  loadUsers: adaptedMethods.loadUsers,
  saveUsers: adaptedMethods.saveUsers,
  getAllUsers: adaptedMethods.getAllUsers,
  
  // 获取最后更新时间
  getLastUpdateTime: adaptedMethods.getLastUpdateTime
};