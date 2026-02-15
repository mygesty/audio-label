<template>
  <div class="team-list-page">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Audio Label Pro</h1>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/teams" class="nav-link active">团队管理</router-link>
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
        <h2 class="page-title">团队管理</h2>
        <el-button type="primary" @click="router.push('/teams/create')">
          <el-icon><Plus /></el-icon>
          创建团队
        </el-button>
      </div>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="搜索">
          <el-input
            v-model="searchForm.search"
            placeholder="请输入团队名称或描述"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #append>
              <el-button :icon="Search" @click="handleSearch" />
            </template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-loading="loading">
      <el-empty v-if="teams.length === 0 && !loading" description="暂无团队" />
      
      <el-row :gutter="20" v-else>
        <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="team in teams" :key="team.id">
          <el-card class="team-card" shadow="hover" @click="viewTeamDetail(team.id)">
            <div class="team-header">
              <h3 class="team-name">{{ team.name }}</h3>
              <el-tag v-if="team.ownerId === currentUserId" type="warning" size="small">
                所有者
              </el-tag>
            </div>
            
            <p class="team-description">{{ team.description || '暂无描述' }}</p>
            
            <div class="team-footer">
              <div class="team-info">
                <el-icon><User /></el-icon>
                <span>{{ team.teamMembers?.length || 0 }} 成员</span>
              </div>
              <div class="team-info">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(team.createdAt) }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Plus, Search, User, Calendar } from '@element-plus/icons-vue';
import type { Team } from '../types/team';
import teamService from '../services/team.service';
import { useUserStore } from '../stores/user';

const router = useRouter();
const userStore = useUserStore();
const currentUserId = userStore.user?.id;

const loading = ref(false);
const teams = ref<Team[]>([]);
const searchForm = ref({
  search: '',
});

// 格式化日期
const formatDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  if (days < 30) return `${Math.floor(days / 7)} 周前`;
  return d.toLocaleDateString('zh-CN');
};

// 加载团队列表
const loadTeams = async () => {
  loading.value = true;
  try {
    const params = searchForm.value.search ? { search: searchForm.value.search } : undefined;
    teams.value = await teamService.getTeams(params);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载团队列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  loadTeams();
};

// 查看团队详情
const viewTeamDetail = (teamId: string) => {
  router.push(`/teams/${teamId}`);
};

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  loadTeams();
});
</script>

<style scoped>
.team-list-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.search-card {
  margin-bottom: 24px;
}

.team-card {
  cursor: pointer;
  transition: transform 0.2s;
  margin-bottom: 20px;
}

.team-card:hover {
  transform: translateY(-4px);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.team-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 8px;
}

.team-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  min-height: 42px;
  max-height: 84px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.team-footer {
  display: flex;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.team-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.team-info .el-icon {
  font-size: 14px;
}
</style>