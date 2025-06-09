import { NextResponse } from 'next/server';
import { connectToMongoDB, listDatabases, listCollections, fetchData } from '@/utils/mongodb';
import { Db, Collection, ObjectId } from 'mongodb'; // 引入 ObjectId

// 处理对 /api/mongodb 路由的 GET 请求。
// 根据查询参数中的 'action' 执行不同的 MongoDB 操作。
// 支持的操作包括:
// - listDatabases: 列出所有数据库。
// - listCollections: 列出指定数据库中的所有集合 (需要 dbName 查询参数)。
// - fetchData: 获取指定数据库和集合中的所有文档 (需要 dbName 和 collectionName 查询参数)。
//
// 参数:
// - request: Next.js 提供的 Request 对象，包含请求信息。
//
// 返回值:
// - 成功时返回 NextResponse，包含操作结果和状态码 200。
// - 失败时返回 NextResponse，包含错误信息和相应的状态码 (如 400 或 500)。
//
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'listDatabases';
    const dbName = searchParams.get('dbName');
    const collectionName = searchParams.get('collectionName');

    let result: any;

    switch (action) {
      case 'listDatabases':
        result = await listDatabases();
        break;
      case 'listCollections':
        if (!dbName) {
          return NextResponse.json({ success: false, message: 'dbName is required for listCollections action' }, { status: 400 });
        }
        result = await listCollections(dbName);
        break;
      case 'fetchData':
        if (!dbName || !collectionName) {
          return NextResponse.json({ success: false, message: 'dbName and collectionName are required for fetchData action' }, { status: 400 });
        }
        // Optionally get query from searchParams
        const queryParam = searchParams.get('query');
        const query = queryParam ? JSON.parse(queryParam) : {};
        result = await fetchData(dbName, collectionName, query);
        // console.log(`[MongoDB API] Fetched data for collection "${collectionName}" in database "${dbName}":`, result);
        break;
      default:
        return NextResponse.json({ success: false, message: 'Invalid GET action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('[MongoDB API] Error processing GET request:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

// 处理对 /api/mongodb 路由的 POST 请求。
// 根据请求体中的 'action' 执行不同的 MongoDB 写操作。
// 支持的操作包括:
// - insertOne: 插入单个文档 (需要 dbName, collectionName, document)。
// - updateOne: 更新单个文档 (需要 dbName, collectionName, filter, update)。
// - deleteOne: 删除单个文档 (需要 dbName, collectionName, filter)。
// - insertMany: 插入多个文档 (需要 dbName, collectionName, documents)。
// - updateMany: 更新多个文档 (需要 dbName, collectionName, filter, update)。
// - deleteMany: 删除多个文档 (需要 dbName, collectionName, filter)。
//
// 参数:
// - request: Next.js 提供的 Request 对象，包含请求信息。
//
// 请求体格式 (示例):
// {
//   "action": "insertOne",
//   "dbName": "yourDatabase",
//   "collectionName": "yourCollection",
//   "document": { ... }
// }
//
// 返回值:
// - 成功时返回 NextResponse，包含操作结果和状态码 200。
// - 失败时返回 NextResponse，包含错误信息和相应的状态码 (如 400 或 500)。
//
export async function POST(request: Request) {
  try {
    const requestBody = await request.json();
    const { action, dbName, collectionName, document, documents, filter, update } = requestBody;

    if (!action || !dbName || !collectionName) {
      return NextResponse.json({ success: false, message: 'action, dbName, and collectionName are required in request body' }, { status: 400 });
    }

    const db: Db = await connectToMongoDB(dbName);
    const collection: Collection = db.collection(collectionName);

    let result: any;

    switch (action) {
      case 'insertOne':
        if (!document) {
          return NextResponse.json({ success: false, message: 'document is required for insertOne action' }, { status: 400 });
        }
        result = await collection.insertOne(document);
        break;
      case 'insertMany':
         if (!documents || !Array.isArray(documents)) {
             return NextResponse.json({ success: false, message: 'documents (array) is required for insertMany action' }, { status: 400 });
         }
         result = await collection.insertMany(documents);
         break;
      case 'updateOne':
        if (!filter || !update) {
          return NextResponse.json({ success: false, message: 'filter and update are required for updateOne action' }, { status: 400 });
        }
         // 如果 filter 中包含 _id 字符串，尝试转换为 ObjectId
         if (filter._id && typeof filter._id === 'string') {
             try {
                 filter._id = new ObjectId(filter._id);
             } catch (e) {
                 console.warn('[MongoDB API] Invalid ObjectId string in filter:', filter._id);
                 return NextResponse.json({ success: false, message: 'Invalid ObjectId format in filter' }, { status: 400 });
             }
         }
        result = await collection.updateOne(filter, update);
        break;
      case 'updateMany':
          if (!filter || !update) {
              return NextResponse.json({ success: false, message: 'filter and update are required for updateMany action' }, { status: 400 });
          }
          // 如果 filter 中包含 _id 字符串，尝试转换为 ObjectId (对于 updateMany 可能不常见，但为了完整性)
          if (filter._id && typeof filter._id === 'string') {
              try {
                  filter._id = new ObjectId(filter._id);
              } catch (e) {
                   console.warn('[MongoDB API] Invalid ObjectId string in filter:', filter._id);
                  //return NextResponse.json({ success: false, message: 'Invalid ObjectId format in filter' }, { status: 400 });
              }
          }
          result = await collection.updateMany(filter, update);
          break;
      case 'deleteOne':
        if (!filter) {
          return NextResponse.json({ success: false, message: 'filter is required for deleteOne action' }, { status: 400 });
        }
         // 如果 filter 中包含 _id 字符串，尝试转换为 ObjectId
         if (filter._id && typeof filter._id === 'string') {
             try {
                 filter._id = new ObjectId(filter._id);
             } catch (e) {
                 console.warn('[MongoDB API] Invalid ObjectId string in filter:', filter._id);
                 return NextResponse.json({ success: false, message: 'Invalid ObjectId format in filter' }, { status: 400 });
             }
         }
        result = await collection.deleteOne(filter);
        break;
      case 'deleteMany':
           if (!filter) {
               return NextResponse.json({ success: false, message: 'filter is required for deleteMany action' }, { status: 400 });
           }
           // 如果 filter 中包含 _id 字符串，尝试转换为 ObjectId (对于 deleteMany 可能不常见)
           if (filter._id && typeof filter._id === 'string') {
               try {
                   filter._id = new ObjectId(filter._id);
               } catch (e) {
                   console.warn('[MongoDB API] Invalid ObjectId string in filter:', filter._id);
                   //return NextResponse.json({ success: false, message: 'Invalid ObjectId format in filter' }, { status: 400 });
               }
           }
           result = await collection.deleteMany(filter);
           break;
      default:
        return NextResponse.json({ success: false, message: 'Invalid POST action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error('[MongoDB API] Error processing POST request:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
