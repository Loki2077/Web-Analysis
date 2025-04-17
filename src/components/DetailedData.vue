<template>
  <div class="detailed-data">
    <h2 class="section-title">
      {{ selectedUser ? `用户 ${selectedUser.ip} 的详细数据` : '所有用户操作记录' }}
    </h2>
    
    <div class="data-content">
      <el-table :data="filteredData" style="width: 100%">
        <el-table-column prop="url" label="访问页面" show-overflow-tooltip />
        <el-table-column prop="action" label="操作" width="180" />
        <el-table-column prop="timestamp" label="时间" width="180" />
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="totalItems"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TrackerDataService from '../services/TrackerDataService.js';

export default {
  name: 'DetailedData',
  props: {
    selectedUser: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      trackerService: TrackerDataService,
      currentPage: 1,
      pageSize: 10
    }
  },
  computed: {
    activityData() {
      // 如果选择了特定用户，则显示该用户的活动记录
      let activities = [];
      if (this.selectedUser && this.selectedUser.sessionId) {
        activities = this.trackerService.getUserActivities(this.selectedUser.sessionId);
      } else {
        // 否则显示所有活动记录
        activities = this.trackerService.getAllActivities();
      }
      // 确保数据按时间降序排列，最新的操作显示在最上面
      return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    },
    filteredData() {
      // 实现分页
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      return this.activityData.slice(startIndex, endIndex);
    },
    totalItems() {
      return this.activityData.length;
    }
  },
  methods: {
    getDeviceTagType(deviceType) {
      const types = {
        '桌面端': 'primary',
        '移动端': 'success',
        '平板': 'warning'
      };
      return types[deviceType] || 'info';
    },
    handlePageChange(page) {
      this.currentPage = page;
      // 页码变化时重新计算要显示的数据
    }
  },
  watch: {
    selectedUser() {
      // 当选中用户变化时，重置分页
      this.currentPage = 1;
    }
  }
}
</script>

<style scoped>
.detailed-data {
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

.data-content {
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>