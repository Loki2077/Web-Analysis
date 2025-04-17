<template>
  <div class="user-fingerprint">
    <h3 class="fingerprint-title">用户设备指纹信息</h3>
    
    <div v-if="user" class="fingerprint-content">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="IP地址">
          <el-tag type="info">{{ user.ip }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备类型">
          <el-tag :type="getDeviceTagType(user.deviceType)">{{ user.deviceType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作系统">
          {{ user.os || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="浏览器">
          {{ user.browser || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="屏幕分辨率">
          {{ user.screenResolution || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="语言">
          {{ user.language || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="时区">
          {{ user.timezone || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="首次访问时间">
          {{ user.firstVisit || '未知' }}
        </el-descriptions-item>
        <el-descriptions-item label="来源页面">
          <el-tag type="info">{{ user.referrer || '直接访问' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备名称">
          <el-tag type="warning">{{ user.computerName || '未知设备' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Cookie启用">
          <el-tag :type="user.cookieEnabled ? 'success' : 'danger'">
            {{ user.cookieEnabled ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="JavaScript启用">
          <el-tag type="success">是</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="WebGL支持">
          <el-tag :type="user.webglSupport ? 'success' : 'danger'">
            {{ user.webglSupport ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Canvas指纹">
          <el-tag type="warning">{{ user.canvasFingerprint || '未采集' }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="设备指纹">
          <el-tag type="success">{{ user.deviceFingerprint || '未生成' }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    
    <div v-else class="empty-state">
      <el-empty description="请选择一个用户查看设备指纹信息" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserFingerprint',
  props: {
    user: {
      type: Object,
      default: null
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
    }
  }
}
</script>

<style scoped>
.user-fingerprint {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  height: 100%;
}

.fingerprint-title {
  margin-top: 0;
  margin-bottom: 20px;
  color: #303133;
  font-weight: 500;
  font-size: 18px;
}

.fingerprint-content {
  margin-top: 20px;
}

.empty-state {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}
</style>