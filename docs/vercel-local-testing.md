# Vercel 本地测试指南

本文档提供了如何在本地使用 Vercel 进行测试的详细步骤，以便在部署前验证您的 Web Analysis 应用。

## 准备工作

### 1. 安装 Vercel CLI

我们已经在项目的 `package.json` 中添加了 Vercel CLI 作为开发依赖。运行以下命令安装所有依赖：

```bash
npm install
```

如果您想全局安装 Vercel CLI，可以运行：

```bash
npm install -g vercel
```

### 2. 配置环境变量

确保您已经正确配置了 `.env.local` 文件。该文件应包含以下环境变量：

```
# Vercel KV 配置
KV_URL=redis://default:password@localhost:6379
KV_REST_API_URL=https://example.upstash.io
KV_REST_API_TOKEN=your_token_here
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token_here
```

请将这些值替换为您的实际 Vercel KV 配置信息。

## 使用 Vercel 进行本地测试

### 方法 1：使用 vercel dev 命令

这种方法会模拟完整的 Vercel 生产环境，包括 Serverless Functions 和 Edge Functions：

```bash
npm run vercel:dev
```

或者直接使用：

```bash
vercel dev
```

首次运行时，Vercel CLI 会要求您登录并链接到您的 Vercel 项目。按照提示完成配置。

### 方法 2：使用标准的 Next.js 开发服务器

如果您只需要测试基本功能，而不需要完整的 Vercel 环境模拟，可以使用：

```bash
npm run dev
```

## 验证跟踪脚本

启动本地服务器后，您可以通过以下步骤验证跟踪脚本是否正常工作：

1. 访问 http://localhost:3000
2. 打开浏览器开发者工具，查看网络请求
3. 检查是否有对 `/api/collect` 的请求，这表明跟踪脚本正在工作

## 常见问题

### Vercel KV 连接问题

如果您在本地测试时遇到 Vercel KV 连接问题，请确保：

1. 您已正确配置 `.env.local` 文件中的 KV 环境变量
2. 如果使用本地 Redis 实例进行测试，确保 Redis 服务器已启动
3. 如果使用远程 Vercel KV 实例，确保您的 API 令牌有效且具有适当的权限

### 端口冲突

如果端口 3000 已被占用，Vercel CLI 会自动尝试使用其他端口。您也可以通过以下命令指定端口：

```bash
vercel dev --listen 3001
```

## 部署到 Vercel

完成本地测试后，您可以使用以下命令将应用部署到 Vercel：

```bash
vercel
```

对于生产环境部署：

```bash
vercel --prod
```