import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;

let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * 连接到 MongoDB 数据库。
 * 如果客户端未连接，则创建新的 MongoClient 并连接。
 * 如果指定了不同的数据库名称，则切换到该数据库。
 * @param databaseName 可选参数，要连接的数据库名称。
 */
async function connectToMongoDB(databaseName?: string): Promise<Db> {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    // Use the provided databaseName if available, otherwise use the default from environment variables
    db = client.db(databaseName || dbName);
  } else if (databaseName && db?.databaseName !== databaseName) {
    // If a databaseName is provided and it's different from the current connected database,
    // get a new Db instance for the specified database
    db = client.db(databaseName);
  }
  // Ensure db is not null before returning
  return db as Db;
}

/**
 * 断开与 MongoDB 的连接。
 * 如果客户端已连接，则关闭连接并重置客户端和数据库实例。
 */
async function disconnectFromMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

/**
 * 列出 MongoDB 服务器上的所有数据库名称。
 * 建立一个新的客户端连接来执行此操作，然后断开。
 * @returns 数据库名称字符串数组。
 */
async function listDatabases(): Promise<string[]> {
  const client = new MongoClient(uri);
  await client.connect();
  const databasesList = await client.db().admin().listDatabases();
  return databasesList.databases.map(db => db.name);
}

/**
 * 列出指定数据库中的所有集合名称。
 * 使用现有的或建立新的客户端连接来获取数据库实例。
 * @param dbName 要列出集合的数据库名称。
 * @returns 集合名称字符串数组。
 */
async function listCollections(dbName: string): Promise<string[]> {
  const client = await connectToMongoDB(); // Get the connected client
  const db = client.db(dbName);
  const collectionsList = await db.listCollections().toArray();
  return collectionsList.map(collection => collection.name);
}

/**
 * 从指定数据库和集合中获取数据。
 * 使用指定的数据库名称连接，并在指定的集合中执行查询。
 * @param dbName 要从中获取数据的数据库名称。
 * @param collectionName 要从中获取数据的集合名称。
 * @param query 可选参数，用于筛选文档的查询条件（默认为空对象，获取所有文档）。
 * @returns 匹配查询条件的文档数组。
 */
async function fetchData(dbName: string, collectionName: string, query: any = {}): Promise<any[]> {
  const client = new MongoClient(uri);
  const db = await connectToMongoDB(dbName); // Connect to the specified database
  const collection = db.collection(collectionName);
 return collection.find(query).toArray();
}

/**
 * 获取指定集合的 Collection 实例。
 * 使用现有的或建立新的客户端连接来获取默认数据库实例。
 * @param collectionName 要获取的集合名称。
 * @returns 指定集合的 Collection 实例。
 */
async function getCollection(collectionName: string): Promise<Collection> {
  const db = await connectToMongoDB();
  return db.collection(collectionName);
}

/**
 * 在指定集合中查找多个文档。
 * @param collectionName 要查找文档的集合名称。
 * @param query 可选参数，用于筛选文档的查询条件（默认为空对象，查找所有文档）。
 * @returns 匹配查询条件的文档数组。
 */
async function findDocuments(collectionName: string, query: any = {}): Promise<any[]> {
  const collection = await getCollection(collectionName);
  return collection.find(query).toArray();
}

async function findOneDocument(collectionName: string, query: any): Promise<any | null> {
  const collection = await getCollection(collectionName);
/**
 * 在指定集合中查找单个文档。
 * @param collectionName 要查找文档的集合名称。
 * @param query 用于筛选文档的查询条件。
 * @returns 匹配查询条件的单个文档，如果没有找到则返回 null。
 */
  return collection.findOne(query);
}

/**
 * 在指定集合中插入单个文档。
 * @param collectionName 要插入文档的集合名称。
 * @param document 要插入的文档对象。
 * @returns 插入文档的 ObjectId。
 */
async function insertOneDocument(collectionName: string, document: any): Promise<ObjectId> {
  const collection = await getCollection(collectionName);
  const result = await collection.insertOne(document);
  return result.insertedId;
}

/**
 * 在指定集合中插入多个文档。
 * @param collectionName 要插入文档的集合名称。
 * @param documents 要插入的文档对象数组。
 * @returns 插入文档的 ObjectId 数组。
 */
async function insertManyDocuments(collectionName: string, documents: any[]): Promise<ObjectId[]> {
  const collection = await getCollection(collectionName);
  const result = await collection.insertMany(documents);
  return Object.values(result.insertedIds);
}

/**
 * 在指定集合中更新单个文档。
 * @param collectionName 要更新文档的集合名称。
 * @param query 用于查找要更新文档的查询条件。
 * @param update 要应用于文档的更新操作。
 * @returns 如果成功更新一个文档，则返回 true；否则返回 false。
 */
async function updateOneDocument(collectionName: string, query: any, update: any): Promise<boolean> {
  const collection = await getCollection(collectionName);
  const result = await collection.updateOne(query, { $set: update });
  return result.modifiedCount === 1;
}

/**
 * 在指定集合中更新多个文档。
 * @param collectionName 要更新文档的集合名称。
 * @param query 用于查找要更新文档的查询条件。
 * @param update 要应用于文档的更新操作。
 * @returns 成功更新的文档数量。
 */
async function updateManyDocuments(collectionName: string, query: any, update: any): Promise<number> {
  const collection = await getCollection(collectionName);
  const result = await collection.updateMany(query, { $set: update });
  return result.modifiedCount;
}

/**
 * 在指定集合中删除单个文档。
 * @param collectionName 要删除文档的集合名称。
 * @param query 用于查找要删除文档的查询条件。
 * @returns 如果成功删除一个文档，则返回 true；否则返回 false。
 */
async function deleteOneDocument(collectionName: string, query: any): Promise<boolean> {
  const collection = await getCollection(collectionName);
  const result = await collection.deleteOne(query);
  return result.deletedCount === 1;
}

/**
 * 在指定集合中删除多个文档。
 * @param collectionName 要删除文档的集合名称。
 * @param query 用于查找要删除文档的查询条件。
 * @returns 成功删除的文档数量。
 */
async function deleteManyDocuments(collectionName: string, query: any): Promise<number> {
  const collection = await getCollection(collectionName);
  const result = await collection.deleteMany(query);
  return result.deletedCount;
}

export {
  connectToMongoDB,
  disconnectFromMongoDB,
  findDocuments,
  findOneDocument,
  insertOneDocument,
  insertManyDocuments,
  updateOneDocument,
  updateManyDocuments,
  deleteOneDocument,
  deleteManyDocuments,
  ObjectId,
  listDatabases,
  listCollections,
  fetchData
};