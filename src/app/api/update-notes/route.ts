import { NextResponse } from 'next/server';
import { connectToMongoDB } from '@/utils/mongodb';
import { Db, Collection, ObjectId } from 'mongodb';

/**
 * 处理备注更新的POST请求
 * @description 更新用户详情记录中的备注字段
 * @param {Request} request - 包含detailId和notes的请求对象
 * @returns {Promise<NextResponse>} - 返回更新结果
 */
export async function POST(request: Request) {
  try {
    const { detailId, notes } = await request.json();
    
    // 验证必需参数
    if (!detailId) {
      return NextResponse.json({ 
        success: false, 
        message: 'detailId参数是必需的' 
      }, { status: 400 });
    }
    
    if (typeof notes !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'notes必须是字符串类型' 
      }, { status: 400 });
    }
    
    // 获取数据库名称
    const databaseName = process.env.MONGODB_DATABASENAME;
    if (!databaseName) {
      console.error('[Update Notes API] 数据库配置错误: MONGODB_DATABASENAME环境变量未设置');
      return NextResponse.json({ 
        success: false, 
        message: '数据库配置错误' 
      }, { status: 500 });
    }
    
    // 连接数据库
    const db: Db = await connectToMongoDB(databaseName);
    const collection: Collection = db.collection('details');
    
    // 转换字符串ID为ObjectId
    let objectId;
    try {
      objectId = new ObjectId(detailId);
    } catch (e) {
      console.error('[Update Notes API] 无效的detailId格式:', detailId);
      return NextResponse.json({ 
        success: false, 
        message: '无效的detailId格式' 
      }, { status: 400 });
    }
    
    // 执行更新操作
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { notes: notes } }
    );
    
    // 检查是否找到并更新了记录
    if (result.matchedCount === 0) {
      console.warn('[Update Notes API] 未找到指定的详情记录:', detailId);
      return NextResponse.json({ 
        success: false, 
        message: '未找到指定的详情记录' 
      }, { status: 404 });
    }
    
    console.log(`[Update Notes API] 成功更新备注 for detailId: ${detailId}`);
    return NextResponse.json({ 
      success: true, 
      message: '备注更新成功',
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });
    
  } catch (error) {
    console.error('[Update Notes API] 处理请求时发生错误:', error);
    return NextResponse.json({ 
      success: false, 
      message: '服务器内部错误' 
    }, { status: 500 });
  }
}

/**
 * 处理OPTIONS请求，用于CORS预检
 * @returns {NextResponse} - 返回CORS头信息
 */
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}