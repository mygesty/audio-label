<template>
  <div class="home-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Audio Label Pro</h1>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link active">首页</router-link>
          <router-link to="/teams" class="nav-link">团队管理</router-link>
          <router-link to="/projects" class="nav-link">项目管理</router-link>
          <router-link to="/audio-list" class="nav-link">音频列表</router-link>
          <router-link to="/tasks" class="nav-link">任务管理</router-link>
        </nav>
        <div class="user-actions">
          <el-dropdown trigger="click">
            <div class="user-avatar">
              <el-avatar :size="40" :src="userStore.user?.avatarUrl">
                {{ userStore.user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: #ecfdf5; color: #059669">
            <el-icon size="24"><Document /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">128</div>
            <div class="stat-label">音频文件</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #fef3c7; color: #f59e0b">
            <el-icon size="24"><Edit /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">45</div>
            <div class="stat-label">待标注</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #dbeafe; color: #3b82f6">
            <el-icon size="24"><View /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">32</div>
            <div class="stat-label">待审核</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: #d1fae5; color: #10b981">
            <el-icon size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">51</div>
            <div class="stat-label">已完成</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">快捷操作</h2>
        <div class="action-grid">
          <el-button type="primary" size="large" @click="handleUploadAudio">
            <el-icon><Upload /></el-icon>
            上传音频
          </el-button>
          <el-button type="success" size="large" @click="$router.push('/audio-list')">
            <el-icon><Headset /></el-icon>
            开始标注
          </el-button>
          <el-button type="warning" size="large" @click="$router.push('/tasks')">
            <el-icon><List /></el-icon>
            查看任务
          </el-button>
          <el-button type="info" size="large" @click="handleExport">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>

      <!-- Recent Projects -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">最近项目</h2>
          <el-button type="primary" link @click="router.push('/projects')">
            查看全部
          </el-button>
        </div>
        <el-table 
          v-loading="loading" 
          :data="recentProjects" 
          stripe 
          style="width: 100%"
        >
          <el-table-column prop="name" label="项目名称" min-width="200" />
          <el-table-column prop="audioCount" label="音频数量" width="120">
            <template #default="{ row }">
              {{ row.audioCount || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="200">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" :color="progressColor" />
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleViewProject(row)">
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-if="!loading && recentProjects.length === 0" description="暂无项目" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Document,
  Edit,
  View,
  CircleCheck,
  Upload,
  Headset,
  List,
  Download,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { projectService } from '@/services/project.service'
import type { Project } from '@/types/project'

const router = useRouter()
const userStore = useUserStore()

const progressColor = '#059669'

const loading = ref(false)
const recentProjects = ref<any[]>([])

const loadRecentProjects = async () => {
  loading.value = true
  try {
    const response = await projectService.getProjects({
      page: 1,
      pageSize: 5,
    })
    
    // 转换为首页显示格式
    recentProjects.value = response.data.map((project: Project) => ({
      id: project.id,
      name: project.name,
      audioCount: 0, // TODO: 需要从音频表统计
      progress: Math.floor(Math.random() * 100), // TODO: 需要从标注表计算真实进度
      status: getStatusText(project.status),
    }))
  } catch (error: any) {
    console.error('加载项目失败:', error)
    // 显示空列表而不是报错
    recentProjects.value = []
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

const handleViewProject = (project: any) => {
  router.push(`/projects/${project.id}`)
}

const handleUploadAudio = () => {
  // TODO: 实现上传功能
  ElMessage.info('上传功能开发中...')
}

const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '活跃'
    case 'archived':
      return '已归档'
    default:
      return status
  }
}

const getStatusType = (status: string) => {
  switch (status) {
    case '已完成':
      return 'success'
    case '进行中':
      return 'warning'
    case '活跃':
      return 'success'
    case '已归档':
      return 'info'
    default:
      return 'info'
  }
}

// 生命周期
onMounted(() => {
  loadRecentProjects()
})
</script>

<style scoped lang="scss">
.home-container {
  min-height: 100vh;
  background-color: var(--background-color);
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  padding: 8px 0;

  &:hover,
  &.active {
    color: var(--primary-color);
  }
}

.user-avatar {
  cursor: pointer;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}

.section {
  margin-bottom: 48px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
</style>