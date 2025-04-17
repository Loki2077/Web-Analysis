# Web-Analysis

## 系统架构说明

### 数据存储机制

虽然系统中有名为`JsonFileStorageService.js`的服务和`data/domains.json`、`data/users.json`等文件，但实际上数据并不存储在这些物理文件中。系统使用的是浏览器的`localStorage`作为数据存储介质，这就是为什么查看这些JSON文件时会发现它们是空的。

具体来说：
- 所有域名数据存储在浏览器的`localStorage`中，键名为`web_analysis_domains`
- 所有用户数据存储在浏览器的`localStorage`中，键名为`web_analysis_users`
- 这些数据只在浏览器中可见，不会写入服务器的物理文件系统

### 监控系统独立运行机制

系统设计为两部分独立运行：

1. **追踪脚本 (tracker.js)**
   - 被监控网站引入此脚本
   - 脚本会自动加载GoEasy SDK并建立连接
   - 收集用户访问信息并实时发送到监控频道
   - 完全独立运行，不依赖于监控主页面是否打开

2. **监控系统 (主应用)**
   - 显示从追踪脚本收集的数据
   - 通过GoEasy接收实时数据
   - 在浏览器localStorage中存储配置和历史数据

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
