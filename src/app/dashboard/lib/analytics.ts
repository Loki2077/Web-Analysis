// 导入 Vercel Blob 相关方法
import { list } from '@vercel/blob'

// 定义每日统计接口
export interface DailyStat {
  date: string // 日期
  '总访问量': number // 总访问量
  '独立访客': number // 独立访客数
}

// 定义 Blob 数据解析结果接口
interface BlobResult {
  date: string // 日期
  total: string | number // 总访问量
  unique: string | number // 独立访客数
}

/**
 * 获取每日统计数据
 * @param websiteId - 网站 ID，默认为 'default'
 * @returns 返回每日统计数组
 */
export async function getDailyStats(websiteId: string = 'default'): Promise<DailyStat[]> {
  try {
    // 检查环境变量是否存在
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Error: BLOB_READ_WRITE_TOKEN environment variable is not set');
      return [];
    }
    
    // 添加 token 参数以解决 No token found 错误
    const { blobs } = await list({ 
      prefix: `stats/${websiteId}/`,
      token // 使用环境变量中的token
    });

    // 使用 fetch 获取 Blob 内容
    const results = await Promise.all(
      blobs.map(async (blob: { url: string }) => {
        try {
          const response = await fetch(blob.url); 
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
          }
          const content = await response.text(); 
          return JSON.parse(content) as BlobResult;
        } catch (error) {
          console.error(`Error processing blob ${blob.url}:`, error);
          return { date: 'unknown', total: 0, unique: 0 } as BlobResult;
        }
      })
    );

    // 将结果转换为 DailyStat 数组并按日期排序
    return results.reduce((acc: DailyStat[], result: BlobResult) => {
      acc.push({
        date: result.date,
        '总访问量': Number(result.total) || 0, // 转换为数字，若无效则为 0
        '独立访客': Number(result.unique) || 0 // 转换为数字，若无效则为 0
      });
      return acc;
    }, []).sort((a: DailyStat, b: DailyStat) => a.date.localeCompare(b.date)); // 按日期排序
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return [];
  }
}

/**
 * 获取设备统计数据
 * @param websiteId - 网站 ID，默认为 'default'
 * @returns 返回设备统计对象
 */
export async function getDeviceStats(websiteId: string = 'default'): Promise<Record<string, number>> {
  try {
    // 检查环境变量是否存在
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Error: BLOB_READ_WRITE_TOKEN environment variable is not set');
      return {};
    }
    
    // 添加 token 参数以解决 No token found 错误
    const { blobs } = await list({ 
      prefix: `devices/${websiteId}/`,
      token // 使用环境变量中的token
    });

    // 使用 fetch 获取 Blob 内容
    const results = await Promise.all(
      blobs.map(async (blob: { url: string }) => {
        try {
          const response = await fetch(blob.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
          }
          const content = await response.text();
          return JSON.parse(content) as Record<string, number>;
        } catch (error) {
          console.error(`Error processing blob ${blob.url}:`, error);
          return {} as Record<string, number>;
        }
      })
    );

    // 合并所有设备统计数据
    return results.reduce((acc: Record<string, number>, curr: Record<string, number>) => {
      Object.entries(curr).forEach(([device, count]) => {
        acc[device] = (acc[device] || 0) + Number(count); // 累加设备数量
      });
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('Error getting device stats:', error);
    return {};
  }
}

/**
 * 获取来源统计数据
 * @param websiteId - 网站 ID，默认为 'default'
 * @returns 返回来源统计对象
 */
export async function getReferrerStats(websiteId: string = 'default'): Promise<Record<string, number>> {
  try {
    // 检查环境变量是否存在
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('Error: BLOB_READ_WRITE_TOKEN environment variable is not set');
      return {};
    }
    
    // 添加 token 参数以解决 No token found 错误
    const { blobs } = await list({ 
      prefix: `referrers/${websiteId}/`,
      token // 使用环境变量中的token
    });

    // 使用 fetch 获取 Blob 内容
    const results = await Promise.all(
      blobs.map(async (blob: { url: string }) => {
        try {
          const response = await fetch(blob.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
          }
          const content = await response.text();
          return JSON.parse(content) as Record<string, number>;
        } catch (error) {
          console.error(`Error processing blob ${blob.url}:`, error);
          return {} as Record<string, number>;
        }
      })
    );

    // 合并所有来源统计数据
    return results.reduce((acc: Record<string, number>, curr: Record<string, number>) => {
      Object.entries(curr).forEach(([referrer, count]) => {
        acc[referrer] = (acc[referrer] || 0) + Number(count); // 累加来源数量
      });
      return acc;
    }, {} as Record<string, number>);
  } catch (error) {
    console.error('Error getting referrer stats:', error);
    return {};
  }
}