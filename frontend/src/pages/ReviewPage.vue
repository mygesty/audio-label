<template>
  <div class="review-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Audio Label Pro</h1>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
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
      <div class="page-header">
        <h2 class="page-title">审核界面</h2>
      </div>
      <el-empty description="功能开发中..." />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const audioId = route.params.audioId
console.log('Audio ID:', audioId)

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}
</script>

<style scoped lang="scss">
.review-container {
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

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}
</style>