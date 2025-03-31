# Web Analysis 项目说明文档

## 项目背景
专为中小型网站打造的轻量级流量分析解决方案，解决传统分析工具臃肿、部署复杂的问题。通过Serverless架构实现零运维成本，满足基本流量监控需求。

## 系统架构

### 整体架构
```
[网站访客] → [跟踪脚本] → [Vercel Edge Function] → [Vercel KV存储]
                        ↖                ↙
                    [Next.js数据分析后台]
```

### 技术架构
1. **采集层**
   - 基于Service Worker的跟踪脚本（tracker.js）
   - 浏览器指纹生成算法
   - 数据压缩传输协议

2. **处理层**
   - Vercel Edge Functions实时数据处理
   - 请求合法性验证（防刷机制）
   - 数据清洗管道

3. **存储层**
   - Vercel KV 分片存储结构
   - 30天自动过期策略
   - 统计缓存层设计

4. **展示层**
   - Next.js App Router架构
   - 按需增量统计计算
   - 图表数据动态聚合

## 核心模块

### 数据采集模块
- 基础访问指标采集
- 自定义事件跟踪系统
- 异常请求过滤机制

### 实时处理模块
- 分布式计数器
- UV去重算法
- 设备特征分析

### 统计展示模块
- 动态时间范围选择
- 多维度数据透视
- 实时数据刷新

## 数据存储方案

### KV存储结构设计
```redis
# 网站基础统计
stats:[website_id]:[date]:total 
stats:[website_id]:[date]:unique

# 访问来源记录
referrers:[website_id]:[date]

# 设备统计
devices:[website_id]:[date]

# 自定义事件
events:[website_id]:[event_name]:[date]
```

### 性能优化
- 批量写入策略（每5秒合并写入）
- 内存缓存热点数据
- LUA脚本原子操作

## 扩展路线
1. 用户行为路径分析
2. 自定义报表生成
3. Web Vitals监控集成
4. 异常流量报警机制