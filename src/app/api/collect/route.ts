// src/app/api/collect/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
//解决时区问题
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * 设置CORS响应头
 * @param {NextResponse} response - NextResponse对象
 * @param {Request} request - 请求对象，用于获取Origin头
 * @returns {NextResponse} - 设置了CORS头的响应对象
 */
function setCorsHeaders(response: NextResponse, request?: Request): NextResponse {
  // 获取请求的Origin头，如果存在则使用该Origin，否则允许所有
  const origin = request?.headers.get('origin');
  
  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

/**
 * @method OPTIONS
 * @description 处理CORS预检请求
 * @param {Request} request - 请求对象
 * @returns {Promise<NextResponse>} - 返回CORS预检响应
 */
export async function OPTIONS(request: Request) {
  const response = new NextResponse(null, { status: 200 });
  return setCorsHeaders(response, request);
}

/**
 * @method POST
 * @description 接收来自监控脚本的数据。
 * @param {Request} request - 客户端发送的请求对象，包含脚本发送的数据。
 * @returns {Promise<NextResponse>} - 返回包含处理结果的 JSON 响应。
 */
export async function POST(request: Request) {
  try {
    const data = await request.json(); // 接收请求体中的 JSON 数据
    

    // TODO: 数据验证和处理
    const { 
        type, // 类型
        timestamp, // 时间戳
        url, // 访问网址
        domain, // 域名
        referrer, // 来源网址
        ip, // ip地址
        fingerprint, // 指纹
        browser, // 浏览器及版本
        os, //系统
        timezone, // 时区
        language, // 语言
        location, // 物理地址
        typeData //事件数据
    } = data;

    function formatTimestampBackend(timestamp: number | string, zone: string): string {
        return dayjs(timestamp).tz(zone).format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 按上海时区格式化
    const eventTimestamp = formatTimestampBackend(timestamp, 'Asia/Shanghai');
    // 在发送到 WebSocket 之前，更新 data 对象的 timestamp 字段
    data.timestamp = eventTimestamp; // <-- 将原始时间戳替换为格式化后的时间戳

    console.log('收集API打印数据:', data); // 打印接收到的数据，用于初步验证

    // 构建完整的 WebSocket API URL
    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : (request.headers.get('x-forwarded-proto') || 'https');
    const WEBSOCKET_API_URL = `${protocol}://${host}/api/websocket`; // WebSocket API 路由的路径

    // MongoDB API 路由的 URL
    const MONGODB_API_URL = `${protocol}://${host}/api/mongodb`; 
    // TODO: 修复此处重复定义的问题，应使用函数外部的定义或者只在此处构建一次完整的URL
    const databaseName = process.env.MONGODB_DATABASENAME;

    // TODO: 调用 WebSocket API 发送数据   
    // 调用 WebSocket API 发送数据
    fetch(WEBSOCKET_API_URL as string, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: JSON.stringify(data) // 将整个接收到的数据作为消息内容发送
        })
    }).then(response => {
        if (!response.ok) {
            console.error(`[Collect API] WebSocket API responded with status: ${response.status}`);
            return response.json().then(errorData => {
                console.error('[Collect API] WebSocket API error details:', errorData);
            });
        }
        return response.json();
    }).then(wsData => {
        if (wsData && wsData.success) {
            console.log('[Collect API] Data sent to WebSocket API successfully.');
        } else if (wsData && wsData.error) {
            console.error('[Collect API] Error sending data to WebSocket API:', wsData.error);
        }
    }).catch(error => console.error('[Collect API] Error fetching WebSocket API:', error))


    // TODO: 异步调用 MongoDB API 存储数据
    // 异步发送数据到 MongoDB API
    // 使用 Promise.allSettled 来并行处理多个数据库写入操作，不阻塞响应
    Promise.allSettled([
        // 1. 处理 domain 数据 (存储到 domain 集合)        
        (async () => {
            // 检查 domain 是否有效，无效则跳过 domain 处理
            if (!(domain && typeof domain === 'string' && domain.length > 0)) {
                return Promise.resolve({ status: 'fulfilled', value: { success: false, message: 'Invalid domain data, skipped processing.' } });
            }
            // 先查找是否已存在
            const findUrl = `${MONGODB_API_URL}?action=fetchData&dbName=${databaseName}&collectionName=domain&query=${encodeURIComponent(JSON.stringify({ domain: domain }))}`;
            const findResponse = await fetch(findUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            const findData = await findResponse.json();
            if (findData.success) {
                if (findData.data && findData.data.length > 0) {
                    // 域名已存在，跳过插入，并打印警告日志
                    console.log(`[Collect API] 域名 '${domain}' 已存在，跳过插入。`);
                }else{
                    // 域名不存在，执行插入操作                    
                    const insertResponse = await fetch(MONGODB_API_URL as string, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'insertOne',
                            dbName: databaseName,
                            collectionName: 'domain',
                            document: { domain: domain,createdAt: new Date() } // 可以添加创建时间
                        })                   
                    });
                    const insertData = await insertResponse.json();
                    if (!insertData.success) {
                        console.error('[Collect API] 插入域名时出错:', insertData.message);
                    } else {
                        console.log(`[Collect API] 域名 '${domain}' 插入成功。`);
                    }
                }
            } else {
                console.error('[Collect API] 查找域名时出错:', findData.message);
            }
            return { success: true, message: 'Domain processing completed.' }; // 标记操作完成
        })(),

        // 2. 处理 user 数据 (存储到 user 集合) - 先查找，存在则更新，不存在则插入
        (async () => {
            // 检查 fingerprint 是否有效，无效则跳过 user 处理
            if (!(fingerprint && typeof fingerprint === 'string' && fingerprint.length > 0)) {
                return Promise.resolve({ status: 'fulfilled', value: { success: false, message: 'Invalid fingerprint data, skipped processing user.' } });
            }
            // 先查找用户
            const findUserUrl = `${MONGODB_API_URL}?action=fetchData&dbName=${databaseName}&collectionName=user&query=${encodeURIComponent(JSON.stringify({ fingerprint: fingerprint }))}`;
            const findUserResponse = await fetch(findUserUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            const findUserData = await findUserResponse.json();
            if (findUserData.success) {
                if (findUserData.data && findUserData.data.length > 0) {
                    // 用户已存在，执行更新操作
                    const updateUserResponse = await fetch(MONGODB_API_URL as string, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'updateOne',
                            dbName: databaseName,
                            collectionName: 'user',
                            filter: { fingerprint: fingerprint }, // 根据 fingerprint 查找用户
                            update: { $set: { domain: domain, ip: ip, lastSeen: eventTimestamp } }, // 更新的字段
                        })
                    });
                    const updateUserData = await updateUserResponse.json();
                    if (!updateUserData.success) {
                        console.error(`[Collect API] 更新用户 '${fingerprint}' 数据时出错:`, updateUserData.message);
                    } else {
                        console.log(`[Collect API] 用户 '${fingerprint}' 数据更新成功。`);
                    }
                } else {
                    // 用户不存在，执行插入操作
                    const insertUserResponse = await fetch(MONGODB_API_URL as string, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'insertOne',
                            dbName: databaseName,
                            collectionName: 'user',
                            document: { fingerprint: fingerprint, domain: domain, ip: ip, createdAt: eventTimestamp, lastSeen: eventTimestamp } // 插入的字段
                        })
                    });
                    const insertUserData = await insertUserResponse.json();
                    if (!insertUserData.success) {
                         console.error(`[Collect API] 插入用户 '${fingerprint}' 数据时出错:`, insertUserData.message);
                    } else {
                         console.log(`[Collect API] 用户 '${fingerprint}' 数据插入成功。`);
                    }
                }
            } else {
                console.error('[Collect API] 查找用户时出错:', findUserData.message);
            }
            return { success: true, message: 'User processing completed.' }; // 标记操作完成
        })(),


        // 3. 处理 details 数据 (存储到 details 集合)
        // details 集合根据 fingerprint 唯一，使用 upsert 逻辑更合适
        (async () => {
            // 检查 fingerprint 和 ip 是否有效，无效则跳过 details 处理
            if (!(fingerprint && typeof fingerprint === 'string' && fingerprint.length > 0 && ip && typeof ip === 'string' && ip.length > 0)) {
                return Promise.resolve({ status: 'fulfilled', value: { success: false, message: 'Invalid fingerprint or IP data, skipped processing details.' } });
            }
            // 先根据 fingerprint 和 ip 查找 details
            const findDetailUrl = `${MONGODB_API_URL}?action=fetchData&dbName=${databaseName}&collectionName=details&query=${encodeURIComponent(JSON.stringify({ fingerprint: fingerprint, ip: ip }))}`;
            const findDetailResponse = await fetch(findDetailUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
            const findDetailData = await findDetailResponse.json();
            if (findDetailData.success) {
                if (findDetailData.data && findDetailData.data.length > 0) {
                    // Details 已存在，执行更新操作
                    // 构建更新对象，只更新合法且有效的字段
                    const updateFields: any = {
                        // 总是更新 lastSeen 字段
                        lastSeen: eventTimestamp
                    };

                    // 校验并更新 location 字段
                    // 如果新的 location 数据存在，且不是字符串 '获取失败'，则更新
                    // 这样可以避免用失败的状态覆盖之前成功的地理位置信息
                    if (location && (typeof location !== 'string' || (typeof location === 'string' && location !== '获取失败'))) {
                        updateFields.location = location;
                    }

                    // 校验并更新 browser 字段
                    // 如果新的 browser 数据存在，且是一个对象，并且包含 name 和 version 属性，则更新
                    if (browser && typeof browser === 'object' && browser.name && browser.version) {
                        updateFields.browser = browser;
                    }

                    // 校验并更新 os 字段
                    // 如果新的 os 数据存在，且不是字符串 'Unknown'，则更新
                    if (os && os !== 'Unknown') {
                        updateFields.os = os;
                    }

                    // 校验并更新 timezone 字段
                    // 如果新的 timezone 数据存在，且不是字符串 'Unknown'，则更新
                    if (timezone && timezone !== 'Unknown') {
                        updateFields.timezone = timezone;
                    }
                    const updateDetailResponse = await fetch(MONGODB_API_URL as string, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'updateOne', // 更新操作
                            dbName: databaseName, // 数据库名称
                            collectionName: 'details', // 集合名称
                            filter: { fingerprint: fingerprint, ip: ip }, // 根据 fingerprint 和 ip 查找要更新的文档
                            update: { $set: updateFields }, // 使用构建好的 updateFields 进行更新
                        })
                    });
                    const updateDetailData = await updateDetailResponse.json();
                    if (!updateDetailData.success) {
                        console.error(`[Collect API] 更新详细数据 for '${fingerprint}' with IP '${ip}' 时出错:`, updateDetailData.message);
                    } else {
                        console.log(`[Collect API] 详细数据 for '${fingerprint}' with IP '${ip}' 更新成功。`);
                    }
                } else {
                    // Details 不存在，执行插入操作
                    const insertDetailResponse = await fetch(MONGODB_API_URL as string, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            action: 'insertOne',
                            dbName: databaseName,
                            collectionName: 'details',
                            document: {
                                fingerprint: fingerprint,
                                ip: ip,
                                os: os,
                                browser: browser,
                                timezone: timezone,
                                language: language,
                                referrer: referrer,
                                location: location,
                                createdAt: eventTimestamp, // 添加 createdAt 字段
                                lastSeen: eventTimestamp, // 添加 lastSeen 字段
                                notes: "" // 初始化备注为空
                            } // 插入的字段
                        })
                    });
                    const insertDetailData = await insertDetailResponse.json();
                    if (!insertDetailData.success) {
                         console.error(`[Collect API] 插入详细数据 for '${fingerprint}' with IP '${ip}' 时出错:`, insertDetailData.message);
                    } else {
                         console.log(`[Collect API] 详细数据 for '${fingerprint}' with IP '${ip}' 插入成功。`);
                    }
                }
            } else {
                console.error('[Collect API] 查找详细数据时出错:', findDetailData.message);
            }
            return { success: true, message: 'Details processing completed.' }; // 标记操作完成
        })(),

        // 4. 处理 event 数据 (存储到 event 集合)
        // event 数据每次都是新发生的事件，直接插入新文档
        (async () => { // 使用 async/await 保持一致性
            // 检查 event type 和 fingerprint 是否有效，无效则跳过 event 处理
           if (!(type && typeof type === 'string' && type.length > 0 && fingerprint && typeof fingerprint === 'string' && fingerprint.length > 0)) {
                console.warn('[Collect API] Invalid event type or fingerprint data, skipped processing event.');
                return Promise.resolve({ success: false, message: 'Invalid event data, skipped processing event.' });
           }

           // **新增：判断是否是心跳事件，如果是则跳过数据库存储**
           if (type === 'heartbeat') {
               console.log(`[Collect API] Heartbeat event received for '${fingerprint}', skipping database insertion.`);
               return Promise.resolve({ success: true, message: 'Heartbeat event processed (no database insertion).' }); // 返回成功，表示处理完毕
           }
           const insertEventResponse = await fetch(MONGODB_API_URL as string, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                   action: 'insertOne',
                   dbName: databaseName,
                   collectionName: 'event',
                   document: {
                        domain:domain,
                        fingerprint: fingerprint,
                        type: type,
                        typeData: typeData,
                        timestamp: eventTimestamp
                   }
               })
           });
           const insertEventData = await insertEventResponse.json();
           if (!insertEventData.success) {
               console.error('[Collect API] 插入事件时出错:', insertEventData.message);
           } else {
               console.log(`[Collect API] 事件 '${type}' for '${fingerprint}' 插入成功。`);
           }
            return { success: true, message: 'Event processing completed.' }; // 标记操作完成
        })()

    ]).then(results => {
        // 所有异步操作完成后执行这里的代码
        console.log('[Collect API] All database operations settled.');
        // 你可以在这里根据 results 判断每个操作的状态
    });
  
    // 返回一个成功响应
    const successResponse = NextResponse.json({ message: 'Data received successfully.' }, { status: 200 });
    return setCorsHeaders(successResponse, request);

  } catch (error: any) {
    console.error('Error receiving data:', error);
    const errorResponse = NextResponse.json({ error: 'Failed to receive data.', details: error.message }, { status: 500 });
    return setCorsHeaders(errorResponse, request);
  }
}