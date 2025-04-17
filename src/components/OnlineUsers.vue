<template>
  <div class="online-users">
    <h2 class="section-title" v-if="selectedDomain">
      {{ selectedDomain.name }} - 在线用户
      <span class="user-count">({{ users.length }})</span>
    </h2>
    <h2 class="section-title" v-else>请选择一个域名查看在线用户</h2>

    <div class="user-list" v-if="selectedDomain">
      <el-table :data="users" style="width: 100%" @row-click="selectUser" :highlight-current-row="true">
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="url" label="访问页面" show-overflow-tooltip />
        <el-table-column prop="visitTime" label="访问时间" width="180" />
        <el-table-column prop="deviceFingerprint" label="设备指纹" width="120">
          <template #default="scope">
            <el-tag type="success">
              {{ scope.row.deviceFingerprint || '未生成' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="empty-state" v-else>
      <el-empty description="选择一个域名以查看在线用户" />
    </div>
    
    <!-- 用户指纹信息区域 -->
    <div class="fingerprint-section">
      <UserFingerprint :user="selectedUser" />
    </div>
  </div>
</template>

<script>
import UserFingerprint from './UserFingerprint.vue'
import TrackerDataService from '../services/TrackerDataService.js';

export default {
  name: 'OnlineUsers',
  components: {
    UserFingerprint
  },
  props: {
    selectedDomain: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectedUser: null,
      trackerService: TrackerDataService
    }
  },
  computed: {
    users() {
      if (!this.selectedDomain) return [];
      return this.trackerService.getOnlineUsersByDomain(this.selectedDomain.id) || [];
    }
  },
  methods: {
    selectUser(user) {
      this.selectedUser = user;
      this.$emit('user-selected', user);
    },
    

    getDeviceTagType(deviceType) {
      const types = {
        '桌面端': 'primary',
        '移动端': 'success',
        '平板': 'warning'
      };
      return types[deviceType] || 'info';
    }
  },
  watch: {
    selectedDomain(newDomain) {
      // 当域名变化时，重置选中的用户
      this.selectedUser = null;
      console.log('Domain changed:', newDomain);      
    },
    // 监听users数组变化，当有用户数据时自动选择第一个
    users: {
      handler(newUsers) {
        if (newUsers.length > 0 && !this.selectedUser) {
          this.$nextTick(() => {
            this.selectUser(newUsers[0]);
            console.log('监控系统: 自动选择第一个用户', newUsers[0].ip);
          });
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.online-users {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 500;
  font-size: 22px;
  display: flex;
}

.user-list {
  margin-bottom: 20px;
}

.fingerprint-section {
  margin-top: 20px;
  flex-grow: 1;
  align-items: center;
}

.user-count {
  margin-left: 10px;
  font-size: 16px;
  color: #909399;
}

.user-list {
  margin-top: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100% - 60px);
}
</style>