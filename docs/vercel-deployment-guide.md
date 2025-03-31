# Vercel部署指南

本指南将帮助你使用Vercel部署Web-Analysis项目，而不是使用本地的`npm run dev`命令进行开发。

## 前提条件

- GitHub账号
- Vercel账号（可以使用GitHub账号登录）
- 已将项目代码推送到GitHub仓库

## 部署步骤

### 1. 准备项目代码

确保你的项目代码已经提交到GitHub仓库。如果尚未提交，请执行以下命令：

```bash
git add .
git commit -m "准备部署到Vercel"
git push origin main
```

### 2. 使用Vercel网页界面部署

1. 登录[Vercel](https://vercel.com)
2. 点击"New Project"按钮
3. 从GitHub导入你的仓库
4. 配置项目设置：
   - 框架预设：选择"Next.js"
   - 构建命令：`npm run build`（默认）
   - 输出目录：`.next`（默认）
5. 点击"Deploy"按钮开始部署

### 3. 配置Vercel KV存储

项目使用Vercel KV存储分析数据，需要进行以下配置：

1. 在Vercel控制台中，选择你的项目
2. 点击"Storage"选项卡
3. 选择"Create"并选择"KV Database"
4. 按照向导完成创建
5. 创建完成后，Vercel会自动添加必要的环境变量到你的项目中，包括：
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 4. 配置其他环境变量

1. 在Vercel项目设置中，找到"Environment Variables"部分
2. 添加以下环境变量：
   - `NEXT_PUBLIC_SITE_URL`: 你的Vercel部署URL（例如：https://your-analysis.vercel.app）

### 5. 重新部署项目

环境变量添加后，重新部署你的项目以应用更改：

1. 在Vercel控制台中，找到你的项目
2. 点击"Deployments"选项卡
3. 点击"Redeploy"按钮

## 使用Vercel CLI部署（可选）

如果你更喜欢使用命令行，可以使用Vercel CLI进行部署：

1. 安装Vercel CLI（如果尚未安装）：
   ```bash
   npm install -g vercel
   ```

2. 登录Vercel：
   ```bash
   vercel login
   ```

3. 部署项目：
   ```bash
   vercel
   ```
   按照提示完成部署配置。

4. 使用Vercel开发环境（替代`npm run dev`）：
   ```bash
   vercel dev
   ```
   这将启动Vercel的本地开发环境，包括所有Vercel特定的功能。

## 集成到你的网站

部署完成后，将以下跟踪代码添加到你网站的`<head>`标签中：

```html
<script async src="https://your-analysis.vercel.app/tracker.js" data-website-id="YOUR-WEBSITE-ID"></script>
```

请将`your-analysis.vercel.app`替换为你的Vercel部署URL，将`YOUR-WEBSITE-ID`替换为你为网站选择的唯一标识符。

## 访问分析仪表盘

部署完成后，你可以通过访问你的Vercel部署URL来查看分析仪表盘：

```
https://your-analysis.vercel.app
```

## 常见问题

### 如何更新已部署的项目？

当你对代码进行更改并推送到GitHub仓库后，Vercel会自动重新部署你的项目。

### 如何查看部署日志？

在Vercel控制台中，选择你的项目，然后点击"Deployments"选项卡查看部署历史和日志。

### 如何配置自定义域名？

1. 在Vercel控制台中，选择你的项目
2. 点击"Settings"选项卡
3. 选择"Domains"部分
4. 添加你的自定义域名并按照指示完成DNS配置

### 如何清除分析数据？

你可以通过Vercel KV控制台清除数据，或创建一个管理API端点来执行此操作。