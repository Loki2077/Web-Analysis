<template>
  <div class="domain-monitor">
    <h2 class="section-title">域名监控</h2>
    <el-card class="domain-card" v-for="domain in domains" :key="domain.id" @click="selectDomain(domain)">
      <div class="domain-info">
        <div class="domain-name">{{ domain.name }}</div>
        <div class="online-count">
          <el-tag type="success" effect="dark" size="large">{{ domain.onlineCount }} 在线</el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import TrackerDataService from '../services/TrackerDataService.js';

export default {
  name: 'DomainMonitor',
  data() {
    return {
      trackerService: TrackerDataService
    }
  },
  computed: {
    domains() {
      return this.trackerService.state.domains;
    }
  },
  mounted() {
    // 初始化追踪数据服务
    this.trackerService.initTrackerService();
    
    // 页面加载时，自动选择第一个域名
    this.$nextTick(() => {
      if (this.domains.length > 0) {
        this.selectDomain(this.domains[0]);
        console.log('监控系统: 自动选择第一个域名', this.domains[0].name);
      }
    });
  },
  methods: {
    selectDomain(domain) {
      this.$emit('domain-selected', domain);
    }
  }
}
</script>

<style scoped>
.domain-monitor {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  height: 100%;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 500;
  font-size: 22px;
}

.domain-card {
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.domain-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.domain-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.domain-name {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.online-count {
  font-size: 16px;
}
</style>