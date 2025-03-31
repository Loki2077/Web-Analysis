# 使用Vercel部署Web-Analysis项目

本指南将帮助你使用Vercel部署和运行Web-Analysis项目，而不是使用本地的`npm run dev`命令。

## 方法一：使用Vercel网页界面部署

### 1. 准备项目代码

确保你的项目代码已经提交到GitHub仓库。如果尚未提交，请执行以下命令：

```bash
git add .
git commit -m "准备部署到Vercel"
git push origin main
```

### 2. 在Vercel网站上部署

1. 登录[Vercel官网](https://vercel.com)
2. 点击"New Project"按钮
3. 从GitHub导入你的仓库
4. 配置项目设置：
   - 框架预设：选择"Next.js"
   - 构建命令：`npm run build`（默认）
   - 输出目录：`.next`（默认）
   - 项目名称：输入一个有效的项目名称，如"web-analysis"
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
   - `NEXT_PUBLIC_SITE_URL`: 你的Vercel部署URL（例如：https://web-analysis.vercel.app）

### 5. 访问你的项目

部署完成后，你可以通过Vercel提供的URL访问你的项目，例如：
```
https://web-analysis.vercel.app
```

## 方法二：使用Vercel CLI部署

### 1. 安装Vercel CLI

如果你尚未安装Vercel CLI，请执行以下命令：

```bash
npm install -g vercel
```

### 2. 登录Vercel

```bash
vercel login
```

### 3. 部署项目

在项目目录中执行：

```bash
vercel --name web-analysis
```

按照提示完成部署配置。确保指定一个有效的项目名称，避免使用默认的目录名称。

### 4. 配置Vercel KV存储

与方法一中的步骤3和4相同，需要在Vercel控制台中配置KV存储和环境变量。

## 方法三：使用Vercel本地开发环境（替代npm run dev）

如果你想在本地使用Vercel的开发环境，而不是使用`npm run dev`，可以按照以下步骤操作：

1. 确保你已经安装并登录了Vercel CLI

2. 在项目目录中创建一个`.vercel`目录和项目配置文件：

```bash
mkdir .vercel
```

3. 在`.vercel`目录中创建一个`project.json`文件，内容如下：

```json
{
  "projectId": "你的Vercel项目ID",
  "orgId": "你的Vercel组织ID"
}
```

你可以通过执行`vercel link`命令获取这些ID。

4. 使用以下命令启动Vercel本地开发环境：

```bash
vercel dev
```

这将启动Vercel的本地开发环境，包括所有Vercel特定的功能，如KV存储等。

## 集成到你的网站

部署完成后，将以下跟踪代码添加到你网站的`<head>`标签中：

```html
<script async src="https://你的vercel域名/tracker.js" data-website-id="YOUR-WEBSITE-ID"></script>
```

请将`你的vercel域名`替换为你的Vercel部署URL，将`YOUR-WEBSITE-ID`替换为你为网站选择的唯一标识符。

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