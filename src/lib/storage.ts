/**
 * 存储适配器
 * 提供统一的接口来访问存储，根据环境自动选择使用Vercel KV、Vercel Blob或本地内存存储
 */

import { kv as vercelKV } from '@vercel/kv';
import { put, get, del, list } from '@vercel/blob';

// 本地内存存储实现
class MemoryStorage {
  private data: Map<string, any> = new Map();
  private sets: Map<string, Set<string>> = new Map();
  private hashes: Map<string, Map<string, string>> = new Map();
  private lists: Map<string, any[]> = new Map();

  // 获取值
  async get(key: string): Promise<any> {
    return this.data.get(key) || null;
  }

  // 设置值
  async set(key: string, value: any): Promise<void> {
    this.data.set(key, value);
  }

  // 哈希表获取
  async hget(key: string, field: string): Promise<string | null> {
    const hash = this.hashes.get(key);
    if (!hash) return null;
    return hash.get(field) || null;
  }

  // 哈希表设置
  async hset(key: string, field: string, value: string): Promise<void> {
    if (!this.hashes.has(key)) {
      this.hashes.set(key, new Map());
    }
    this.hashes.get(key)!.set(field, value);
  }

  // 哈希表增加
  async hincrby(key: string, field: string, increment: number): Promise<number> {
    const currentValue = parseInt(await this.hget(key, field) || '0');
    const newValue = currentValue + increment;
    await this.hset(key, field, newValue.toString());
    return newValue;
  }

  // 集合添加
  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.sets.has(key)) {
      this.sets.set(key, new Set());
    }
    
    const set = this.sets.get(key)!;
    let added = 0;
    
    for (const member of members) {
      if (!set.has(member)) {
        set.add(member);
        added++;
      }
    }
    
    return added;
  }

  // 获取集合成员数量
  async scard(key: string): Promise<number> {
    return this.sets.get(key)?.size || 0;
  }

  // 获取集合所有成员
  async smembers(key: string): Promise<string[]> {
    return Array.from(this.sets.get(key) || new Set());
  }

  // 列表左侧推入
  async lpush(key: string, ...values: string[]): Promise<number> {
    if (!this.lists.has(key)) {
      this.lists.set(key, []);
    }
    
    const list = this.lists.get(key)!;
    for (const value of values) {
      list.unshift(value);
    }
    
    return list.length;
  }

  // 列表范围获取
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    const list = this.lists.get(key) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  }
}

// Blob存储实现
class BlobStorage {
  private prefix: string = 'web-analysis-';
  private metadataPrefix: string = 'metadata-';
  
  // 将数据序列化为JSON字符串
  private serialize(data: any): string {
    return JSON.stringify(data);
  }
  
  // 将JSON字符串反序列化为数据
  private deserialize(data: string | null): any {
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
  
  // 生成Blob键名
  private getBlobKey(key: string): string {
    return `${this.prefix}${key}`;
  }
  
  // 生成元数据键名
  private getMetadataKey(key: string): string {
    return `${this.metadataPrefix}${key}`;
  }
  
  // 获取值
  async get(key: string): Promise<any> {
    try {
      const blob = await get(this.getBlobKey(key));
      return blob ? this.deserialize(blob.text()) : null;
    } catch (error) {
      console.error(`Error getting blob for key ${key}:`, error);
      return null;
    }
  }
  
  // 设置值
  async set(key: string, value: any): Promise<void> {
    try {
      const serializedValue = this.serialize(value);
      await put(this.getBlobKey(key), serializedValue, { access: 'public' });
    } catch (error) {
      console.error(`Error setting blob for key ${key}:`, error);
    }
  }
  
  // 哈希表实现 - 使用元数据存储哈希表结构
  async hget(key: string, field: string): Promise<string | null> {
    try {
      const metadataKey = this.getMetadataKey(key);
      const hashData = await this.get(metadataKey) || {};
      return hashData[field] || null;
    } catch (error) {
      console.error(`Error in hget for ${key}.${field}:`, error);
      return null;
    }
  }
  
  // 哈希表设置
  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      const metadataKey = this.getMetadataKey(key);
      const hashData = await this.get(metadataKey) || {};
      hashData[field] = value;
      await this.set(metadataKey, hashData);
    } catch (error) {
      console.error(`Error in hset for ${key}.${field}:`, error);
    }
  }
  
  // 哈希表增加
  async hincrby(key: string, field: string, increment: number): Promise<number> {
    try {
      const currentValue = parseInt(await this.hget(key, field) || '0');
      const newValue = currentValue + increment;
      await this.hset(key, field, newValue.toString());
      return newValue;
    } catch (error) {
      console.error(`Error in hincrby for ${key}.${field}:`, error);
      return 0;
    }
  }
  
  // 集合添加 - 使用元数据存储集合结构
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      const metadataKey = this.getMetadataKey(key);
      const setData = new Set(await this.get(metadataKey) || []);
      let added = 0;
      
      for (const member of members) {
        if (!setData.has(member)) {
          setData.add(member);
          added++;
        }
      }
      
      await this.set(metadataKey, Array.from(setData));
      return added;
    } catch (error) {
      console.error(`Error in sadd for ${key}:`, error);
      return 0;
    }
  }
  
  // 获取集合成员数量
  async scard(key: string): Promise<number> {
    try {
      const metadataKey = this.getMetadataKey(key);
      const setData = await this.get(metadataKey) || [];
      return setData.length;
    } catch (error) {
      console.error(`Error in scard for ${key}:`, error);
      return 0;
    }
  }
  
  // 获取集合所有成员
  async smembers(key: string): Promise<string[]> {
    try {
      const metadataKey = this.getMetadataKey(key);
      return await this.get(metadataKey) || [];
    } catch (error) {
      console.error(`Error in smembers for ${key}:`, error);
      return [];
    }
  }
  
  // 列表左侧推入 - 使用元数据存储列表结构
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      const metadataKey = this.getMetadataKey(key);
      const listData = await this.get(metadataKey) || [];
      
      for (const value of values) {
        listData.unshift(value);
      }
      
      await this.set(metadataKey, listData);
      return listData.length;
    } catch (error) {
      console.error(`Error in lpush for ${key}:`, error);
      return 0;
    }
  }
  
  // 列表范围获取
  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      const metadataKey = this.getMetadataKey(key);
      const listData = await this.get(metadataKey) || [];
      return listData.slice(start, stop === -1 ? undefined : stop + 1);
    } catch (error) {
      console.error(`Error in lrange for ${key}:`, error);
      return [];
    }
  }
}

// 检查Vercel KV环境变量是否存在
const hasKVCredentials = (): boolean => {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
};

// 检查Vercel Blob环境变量是否存在
const hasBlobCredentials = (): boolean => {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
};

// 创建适当的存储实例
const createStorage = () => {
  if (hasBlobCredentials()) {
    console.log('Using Vercel Blob storage');
    return new BlobStorage();
  } else if (hasKVCredentials()) {
    console.log('Using Vercel KV storage');
    return vercelKV;
  } else {
    console.log('Using local memory storage');
    return new MemoryStorage();
  }
};

// 导出存储实例
export const storage = createStorage();