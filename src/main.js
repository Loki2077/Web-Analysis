import { createApp } from 'vue'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as echarts from 'echarts'
import TrackerDataService from './services/TrackerDataService.js'

/**
 * 追踪数据服务
 * 用于处理从tracker.js收集的实时数据并提供给各组件使用
 */
// 导入环境变量配置
import dotenv from 'dotenv';
dotenv.config();

// 设置Vercel API Token环境变量（如果没有在.env文件中设置）
if (!process.env.VUE_APP_VERCEL_API_TOKEN) {
  console.warn('监控系统: 未设置VUE_APP_VERCEL_API_TOKEN环境变量，Blob存储功能可能无法正常工作');
}

// 初始化GoEasy实例
import GoEasy from 'goeasy'
const goEasy = GoEasy.getInstance({
  host: 'hangzhou.goeasy.io', // 使用杭州节点
  appkey: 'BC-3c9aebd68555496aa086c46caf78393d', // 使用与tracker.js相同的appkey
  modules: ['pubsub']
});

// 建立连接
goEasy.connect({
  onSuccess: function () {
    console.log("GoEasy connect successfully.") 
  },
  onFailed: function (error) {
    console.log("Failed to connect GoEasy, code:"+error.code+ ",error:"+error.content);
  }
});

const app = createApp(App)

// 将GoEasy实例添加到全局属性
app.config.globalProperties.goEasy = goEasy

// 初始化追踪数据服务
TrackerDataService.initTrackerService(goEasy)

app.config.globalProperties.$echarts = echarts
app.use(ElementPlus)
app.mount('#app')
