# Web-Analysis 使用文档

## 目录

- [Web-Analysis 使用文档](#web-analysis-使用文档)
  - [目录](#目录)
  - [项目概述](#项目概述)
    - [主要功能](#主要功能)
  - [部署指南](#部署指南)
    - [前提条件](#前提条件)
    - [部署步骤](#部署步骤)
  - [配置存储服务](#配置存储服务)
    - [配置Vercel Blob存储](#配置vercel-blob存储)
    - [配置Vercel KV存储](#配置vercel-kv存储)
  - [集成到您的网站](#集成到您的网站)
    - [跟踪自定义事件](#跟踪自定义事件)
  - [自定义和扩展](#自定义和扩展)
    - [修改仪表盘](#修改仪表盘)
    - [添加新的分析指标](#添加新的分析指标)
    - [添加用户认证](#添加用户认证)
  - [常见问题](#常见问题)
    - [数据不显示在仪表盘上](#数据不显示在仪表盘上)
    - [如何清除所有数据？](#如何清除所有数据)
    - [是否支持多个网站？](#是否支持多个网站)
    - [如何导出数据？](#如何导出数据)

## 项目概述

Web-Analysis是一个基于Vercel的开源Web流量分析工具，无需自己的服务器即可部署和使用。它提供了轻量级的跟踪脚本和直观的分析仪表盘，帮助您了解网站的访问情况。

### 主要功能

- 实时跟踪页面浏览量和访客数
- 分析访客来源和浏览行为
- 响应式仪表盘，支持移动端查看
- 轻量级跟踪脚本，对网站性能影响最小
- 注重隐私，不使用Cookie

## 部署指南

### 前提条件

- GitHub账号
- Vercel账号（可以使用GitHub账号登录）

### 部署步骤

1. **Fork本仓库**
   - 访问[GitHub仓库](https://github.com/yourusername/web-analysis)
   - 点击右上角的"Fork"按钮

2. **部署到Vercel**
   - 登录[Vercel](https://vercel.com)
   - 点击"New Project"
   - 从GitHub导入您fork的仓库
   - 点击"Deploy"开始部署

3. **配置环境变量**
   - 在Vercel项目设置中，添加以下环境变量：
     - `NEXT_PUBLIC_SITE_URL`: 您的网站URL（例如：https://your-analysis.vercel.app）

## 配置存储服务

本项目支持两种Vercel存储服务：Vercel Blob和Vercel KV。您可以选择其中一种或同时配置两种存储服务。

### 配置Vercel Blob存储

推荐使用Vercel Blob存储，它更适合存储大量分析数据。以下是配置步骤：

1. **创建Vercel Blob存储**
   - 在Vercel控制台中，选择您的项目
   - 点击"Storage"选项卡
   - 点击"Connect Database"按钮
   - 在Marketplace数据库提供商列表中，找到并选择"Vercel Blob"
   - 按照向导完成创建

2. **连接Blob存储到项目**
   - 创建完成后，Vercel会自动添加必要的环境变量到您的项目中
   - 这些变量包括：
     - `BLOB_READ_WRITE_TOKEN`

3. **Blob存储优势**
   - 更大的存储空间（Hobby方案提供5GB）
   - 更高的带宽限制（Hobby方案提供50GB/月）
   - 支持存储大型分析数据和报告
   - 无请求数限制

4. **重新部署项目**
   - 环境变量添加后，重新部署您的项目以应用更改

### 配置Vercel KV存储

如果您希望使用KV存储或同时使用两种存储服务，以下是配置步骤：

1. **创建Vercel KV数据库**
   - 在Vercel控制台中，选择您的项目
   - 点击"Storage"选项卡
   - 点击"Connect Database"按钮
   - 在Marketplace数据库提供商列表中，找到并选择"Vercel KV"
   - 按照向导完成创建

2. **连接KV数据库到项目**
   - 创建完成后，Vercel会自动添加必要的环境变量到您的项目中
   - 这些变量包括：
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

3. **重新部署项目**
   - 环境变量添加后，重新部署您的项目以应用更改

## 集成到您的网站

将以下跟踪代码添加到您网站的`<head>`标签中：

```html
<script async src="https://your-analysis.vercel.app/tracker.js" data-website-id="YOUR-WEBSITE-ID"></script>
```

请将`your-analysis.vercel.app`替换为您的Vercel部署URL，将`YOUR-WEBSITE-ID`替换为您为网站选择的唯一标识符（可以是任何字符串）。

### 跟踪自定义事件

除了自动跟踪页面浏览外，您还可以跟踪自定义事件：

```javascript
// 跟踪按钮点击
webAnalytics.trackEvent('button_click', 'signup_button');

// 跟踪表单提交
webAnalytics.trackEvent('form_submit', 'contact_form');
```

## 自定义和扩展

### 修改仪表盘

您可以通过编辑`src/pages/index.tsx`文件来自定义仪表盘的外观和功能。

### 添加新的分析指标

1. 修改`src/pages/api/collect.ts`以收集额外数据
2. 更新`src/pages/api/stats.ts`以处理和返回新数据
3. 在仪表盘中添加新的图表或指标显示

### 添加用户认证

默认情况下，仪表盘是公开的。您可以添加认证层来保护您的分析数据：

1. 使用Next.js Auth或类似库添加认证
2. 在`src/pages/index.tsx`和API路由中添加认证检查

## 常见问题

### 数据不显示在仪表盘上

- 确认跟踪脚本已正确添加到您的网站
- 检查浏览器控制台是否有错误
- 验证Vercel Blob或KV存储是否正确配置
- 确保环境变量已正确设置

### 如何清除所有数据？

- **Blob存储**：您可以通过Vercel Blob控制台清除数据，或创建一个管理API端点来执行此操作
- **KV存储**：您可以通过Vercel KV控制台清除数据，或创建一个管理API端点来执行此操作

### 是否支持多个网站？

是的，您可以使用不同的`data-website-id`值来区分不同网站的数据。

### 如何导出数据？

您可以创建一个额外的API端点来导出数据为CSV或JSON格式。

---

如有更多问题，请在GitHub仓库中创建Issue。