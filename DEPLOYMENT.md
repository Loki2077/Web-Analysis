# 部署指南

## 环境变量配置

本项目使用Vercel Blob Storage存储分析数据，需要配置以下环境变量：

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob Storage的读写令牌

### 本地开发

1. 在项目根目录创建`.env.local`文件
2. 添加以下内容：
   ```
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```
3. 从Vercel控制台获取Blob Storage令牌：
   - 登录Vercel账户
   - 进入项目设置
   - 找到"Storage"选项
   - 创建或查看现有的Blob Storage令牌

### Vercel部署

1. 在Vercel控制台中，进入项目设置
2. 找到"Environment Variables"选项
3. 添加`BLOB_READ_WRITE_TOKEN`环境变量
4. 设置其值为从Vercel获取的Blob Storage令牌

## 部署步骤

1. 确保项目代码已推送到GitHub仓库
2. 登录Vercel账户
3. 点击"New Project"按钮
4. 选择包含此项目的GitHub仓库
5. 配置项目设置：
   - 构建命令: `next build`
   - 输出目录: `.next`
   - 环境变量: 添加`BLOB_READ_WRITE_TOKEN`
6. 点击"Deploy"按钮

## 验证部署

部署完成后，可以通过以下方式验证功能是否正常：

1. 访问部署后的网站
2. 检查分析数据是否正常收集
3. 访问仪表盘页面，确认数据是否正常显示

如果遇到问题，请检查Vercel的日志输出，确保环境变量已正确配置。