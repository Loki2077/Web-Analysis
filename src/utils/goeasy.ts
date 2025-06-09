// src/utils/goeasy.ts
import GoEasy from 'goeasy';

// 定义一个变量来存储 GoEasy 实例
let goEasyInstance: GoEasy | null = null;

/**
 * @method getGoEasyInstance
 * @description 获取 GoEasy 客户端实例。该实例只在客户端环境下初始化和可用，并建立连接。
 * @returns {GoEasy} GoEasy 客户端实例。
 * @throws {Error} 如果 GoEasy 相关的环境变量未设置，或者在服务端环境下调用此函数。
 */
export function getGoEasyInstance(): GoEasy {
  // 检查是否在客户端环境
  if (typeof window !== 'undefined') {
    // 如果实例不存在，则创建新的实例
    if (!goEasyInstance) {
      // 从环境变量中读取 appkey 和 host
      const appkey = process.env.NEXT_PUBLIC_GOEASY_APPKEY as string;
      const host = process.env.NEXT_PUBLIC_GOEASY_HOST as string;

      // 检查环境变量是否设置
      if (!appkey || !host) {
        throw new Error('GoEasy environment variables (NEXT_PUBLIC_GOEASY_APPKEY, NEXT_PUBLIC_GOEASY_HOST) are not set.');
      }

      goEasyInstance = GoEasy.getInstance({
        host: host,
        appkey: appkey,
        modules: ['pubsub']
      });

      // 建立连接
      // goEasyInstance.getInstance.connect({
      goEasyInstance.connect({
        onSuccess: function () {
          console.log("GoEasy connect successfully.")
        },
        onFailed: function (error) {
          console.error("Failed to connect GoEasy, code:" + error.code + ",error:" + error.content);
        }
      });
    }
    return goEasyInstance;
  } else {
    throw new Error('GoEasy instance is only available in the client environment.');
  }
}