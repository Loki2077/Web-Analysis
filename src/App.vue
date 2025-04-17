<template>
  <div class="app-container">
    <el-container>
      <el-header height="60px">
        <div class="header-content">
          <h1 class="app-title">网站流量监控系统</h1>
        </div>
      </el-header>
      
      <el-container class="main-content">
        <el-aside width="300px" class="domain-section">
          <DomainMonitor @domain-selected="handleDomainSelected" />
        </el-aside>
        
        <el-main>
          <el-row :gutter="20" class="data-sections">
            <el-col :span="24" :lg="12">
              <OnlineUsers 
                :selectedDomain="selectedDomain" 
                @user-selected="handleUserSelected" 
              />
            </el-col>
            <el-col :span="24" :lg="12">
              <DetailedData :selectedUser="selectedUser" />
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import DomainMonitor from './components/DomainMonitor.vue'
import OnlineUsers from './components/OnlineUsers.vue'
import DetailedData from './components/DetailedData.vue'

export default {
  name: 'App',
  components: {
    DomainMonitor,
    OnlineUsers,
    DetailedData
  },
  data() {
    return {
      selectedDomain: null,
      selectedUser: null
    }
  },
  methods: {
    handleDomainSelected(domain) {
      this.selectedDomain = domain;
      this.selectedUser = null; // 重置选中的用户
    },
    handleUserSelected(user) {
      this.selectedUser = user;
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
}

.app-container {
  height: 100vh;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
}

.app-title {
  color: #409EFF;
  font-size: 24px;
  font-weight: 600;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10;
  padding: 0 20px;
}

.main-content {
  height: calc(100vh - 60px);
}

.domain-section {
  border-right: 1px solid #ebeef5;
  background-color: #fff;
}

.el-main {
  padding: 20px;
  background-color: #f0f2f5;
}

.data-sections {
  height: 100%;
}

.data-sections .el-col {
  height: 100%;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .el-aside {
    width: 250px !important;
  }
}

@media (max-width: 992px) {
  .el-aside {
    width: 200px !important;
  }
}

@media (max-width: 768px) {
  .el-container {
    flex-direction: column;
  }
  
  .el-aside {
    width: 100% !important;
    height: auto;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
  }
  
  .main-content {
    height: auto;
  }
}
</style>