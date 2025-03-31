/**
 * 存储适配器
 * 提供统一的接口来访问存储，根据环境自动选择使用Vercel KV或本地内存存储
 */

import { kv as vercelKV } from '@vercel/kv';

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

// 检查Vercel KV环境变量是否存在
const hasKVCredentials = (): boolean => {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;
};

// 创建适当的存储实例
const createStorage = () => {
  if (hasKVCredentials()) {
    console.log('Using Vercel KV storage');
    return vercelKV;
  } else {
    console.log('Using local memory storage');
    return new MemoryStorage();
  }
};

// 导出存储实例
export const storage = createStorage();