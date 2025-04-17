/**
 * Web-Analysis 后端服务
 * 用于处理JSON文件的读写操作，替代localStorage存储
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// 启用CORS和JSON解析中间件
app.use(cors());
app.use(express.json());

// 数据文件路径
const DOMAINS_FILE_PATH = path.join(__dirname, 'data', 'domains.json');
const USERS_FILE_PATH = path.join(__dirname, 'data', 'users.json');

// 确保数据文件存在
function ensureFileExists(filePath, defaultContent = '{}') {
  try {
    if (!fs.existsSync(filePath)) {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      fs.writeFileSync(filePath, defaultContent);
      console.log(`创建文件: ${filePath}`);
    }
  } catch (error) {
    console.error(`确保文件存在时出错: ${filePath}`, error);
  }
}

// 初始化数据文件
ensureFileExists(DOMAINS_FILE_PATH, '[]');
ensureFileExists(USERS_FILE_PATH, '{}');

// 读取JSON文件
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`读取文件出错: ${filePath}`, error);
    // 如果文件不存在或解析错误，返回默认值
    return filePath.includes('domains') ? [] : {};
  }
}

// 写入JSON文件
function writeJsonFile(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`写入文件出错: ${filePath}`, error);
    return false;
  }
}

// API路由

// 获取所有域名
app.get('/api/domains', (req, res) => {
  const domains = readJsonFile(DOMAINS_FILE_PATH);
  res.json(domains);
});

// 保存域名数据
app.post('/api/domains', (req, res) => {
  const domains = req.body;
  if (!Array.isArray(domains)) {
    return res.status(400).json({ error: '无效的域名数据格式' });
  }
  
  const success = writeJsonFile(DOMAINS_FILE_PATH, domains);
  if (success) {
    res.json({ success: true, message: '域名数据保存成功' });
  } else {
    res.status(500).json({ error: '保存域名数据失败' });
  }
});

// 添加新域名
app.post('/api/domains/add', (req, res) => {
  const newDomain = req.body;
  if (!newDomain || !newDomain.name) {
    return res.status(400).json({ error: '无效的域名对象' });
  }
  
  const domains = readJsonFile(DOMAINS_FILE_PATH);
  
  // 检查域名是否已存在
  if (domains.some(d => d.name === newDomain.name)) {
    return res.json({ success: true, message: `域名 ${newDomain.name} 已存在` });
  }
  
  // 添加新域名
  domains.push(newDomain);
  const success = writeJsonFile(DOMAINS_FILE_PATH, domains);
  
  if (success) {
    res.json({ success: true, message: '域名添加成功' });
  } else {
    res.status(500).json({ error: '添加域名失败' });
  }
});

// 更新域名
app.put('/api/domains/:name', (req, res) => {
  const domainName = req.params.name;
  const updatedDomain = req.body;
  
  if (!updatedDomain) {
    return res.status(400).json({ error: '无效的域名数据' });
  }
  
  const domains = readJsonFile(DOMAINS_FILE_PATH);
  const index = domains.findIndex(d => d.name === domainName);
  
  if (index === -1) {
    return res.status(404).json({ error: `域名 ${domainName} 不存在` });
  }
  
  domains[index] = { ...domains[index], ...updatedDomain };
  const success = writeJsonFile(DOMAINS_FILE_PATH, domains);
  
  if (success) {
    res.json({ success: true, message: '域名更新成功' });
  } else {
    res.status(500).json({ error: '更新域名失败' });
  }
});

// 获取所有用户
app.get('/api/users', (req, res) => {
  const users = readJsonFile(USERS_FILE_PATH);
  res.json(users);
});

// 保存用户数据
app.post('/api/users', (req, res) => {
  const users = req.body;
  if (typeof users !== 'object') {
    return res.status(400).json({ error: '无效的用户数据格式' });
  }
  
  const success = writeJsonFile(USERS_FILE_PATH, users);
  if (success) {
    res.json({ success: true, message: '用户数据保存成功' });
  } else {
    res.status(500).json({ error: '保存用户数据失败' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Web-Analysis 后端服务已启动，监听端口: ${PORT}`);
  console.log(`域名数据文件: ${DOMAINS_FILE_PATH}`);
  console.log(`用户数据文件: ${USERS_FILE_PATH}`);
});