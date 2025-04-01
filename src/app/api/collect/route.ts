import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// 定义请求数据的类型
interface RequestData {
  websiteId: string | number; // 假设 websiteId 是字符串或数字
  timestamp: number;          // 假设 timestamp 是时间戳（数字）
  [key: string]: unknown;     // 将 any 替换为 unknown
}

/**
 * 校验请求数据是否有效
 * @param data - 请求体中的数据
 * @returns 如果数据有效返回 true，否则返回 false
 */
const validateRequest = (data: RequestData): boolean => {
  // 检查是否包含 websiteId 和 timestamp 字段
  if (!data?.websiteId || !data?.timestamp) {
    return false
  }
  // 可扩展的校验规则
  return true
}

/**
 * 处理 POST 请求，接收并存储分析数据
 * @param request - HTTP 请求对象
 * @returns 返回 JSON 格式的响应
 */
export async function POST(request: Request) {
  try {
    // 解析请求体中的 JSON 数据
    const data: RequestData = await request.json()
    
    // 校验请求数据是否符合要求
    if (!validateRequest(data)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // 生成唯一的存储键，格式为 track:{websiteId}:{timestamp}
    const storageKey = `track:${data.websiteId}:${Date.now()}.json`
    
    // 将原始数据存储到 Vercel Blob 数据库中
    const blob = await put(storageKey, JSON.stringify({
      ...data, // 存储传入的所有数据
      ip: request.headers.get('x-real-ip'), // 获取客户端 IP 地址
      ua: request.headers.get('user-agent'), // 获取用户代理信息
      geo: request.headers.get('x-vercel-ip-country') // 获取地理位置信息
    }), {
      contentType: 'application/json', // 设置内容类型为 JSON
      access: 'public' // 添加访问权限属性，设置为公共访问
    })

    // 返回成功响应
    return NextResponse.json({ status: 'ok', blobUrl: blob.url })
  } catch (error) {
    // 捕获错误并记录日志
    console.error('Tracking error:', error)
    // 返回服务器内部错误响应
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 配置 Edge Runtime，优化性能
export const runtime = 'edge'