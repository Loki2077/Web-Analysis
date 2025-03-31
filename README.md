# Web Analysis - 轻量级网站流量分析工具

这是一个基于Next.js和Vercel构建的轻量级网站流量分析工具，无需服务器即可部署和使用。通过简单地在您的网站中添加一段跟踪代码，即可开始收集和分析访问数据。

## 主要功能

- 🔍 实时流量监控
- 📊 访问来源分析
- 👥 用户行为跟踪
- 📱 设备和浏览器统计
- 🌐 支持多网站监控
- ☁️ 基于Vercel部署，无需服务器

## 技术栈

- **前端框架**: Next.js 14
- **UI库**: React 18
- **样式**: TailwindCSS
- **图表**: Chart.js
- **数据存储**: Vercel KV (Redis)
- **部署**: Vercel

## 快速开始

### 本地开发

1. 克隆仓库

```bash
git clone https://github.com/yourusername/web-analysis.git
cd web-analysis
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

复制`.env.local.example`文件为`.env.local`并填入您的Vercel KV配置信息。

4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

### 部署到Vercel

1. 在Vercel上创建一个新项目
2. 连接到您的GitHub仓库
3. 在项目设置中添加环境变量（KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN）
4. 部署项目

## 使用方法

### 添加跟踪代码

在您想要监控的网站的`<head>`标签中添加以下代码：

```html
<script src="https://your-domain.vercel.app/tracker.js" data-website-id="YOUR_WEBSITE_ID"></script>
```

将`your-domain.vercel.app`替换为您的Vercel部署域名，将`YOUR_WEBSITE_ID`替换为您为该网站指定的唯一标识符。

### 查看分析数据

1. 访问您的Web Analysis部署地址
2. 在仪表盘中查看实时数据和统计信息
3. 在网站列表页面查看所有被监控的网站

### 跟踪自定义事件

除了自动跟踪页面访问外，您还可以跟踪自定义事件：

```javascript
// 在您的网站代码中
webAnalytics.trackEvent('button_click', 'signup_button');
```

## 数据存储

所有分析数据存储在Vercel KV（基于Redis）中，具有以下特点：

- 高性能读写
- 自动过期（访问数据保留30天）
- 无需维护数据库服务器

## 隐私合规

本工具设计时考虑了隐私保护：

- 不使用cookies（使用localStorage存储访客ID）
- 不跟踪个人身份信息
- 符合GDPR基本要求

## 许可证

MIT