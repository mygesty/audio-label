<template>
  <div class="project-create-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Audio Label Pro</h1>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/teams" class="nav-link">团队管理</router-link>
          <router-link to="/projects" class="nav-link active">项目管理</router-link>
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
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2 class="page-title">创建项目</h2>
      </div>

      <el-card class="form-card">
        <el-form
          ref="formRef"
          :model="form"
          :rules="formRules"
          label-width="120px"
          size="large"
        >
          <el-form-item label="项目名称" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入项目名称"
              clearable
            />
          </el-form-item>

          <el-form-item label="所属团队" prop="teamId">
            <el-select
              v-model="form.teamId"
              placeholder="请选择团队"
              style="width: 100%"
              clearable
              :loading="teamsLoading"
            >
              <el-option
                v-for="team in teams"
                :key="team.id"
                :label="team.name"
                :value="team.id"
              />
            </el-select>
            <div class="form-tip">
              <span>没有团队？</span>
              <router-link to="/teams/create" class="create-link">创建新团队</router-link>
            </div>
          </el-form-item>

          <el-form-item label="项目描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="6"
              placeholder="请输入项目描述"
              clearable
            />
          </el-form-item>

          <el-form-item label="项目状态" prop="status">
            <el-radio-group v-model="form.status">
              <el-radio value="active">活跃</el-radio>
              <el-radio value="archived">已归档</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleSubmit">
              创建项目
            </el-button>
            <el-button @click="handleBack">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { projectService } from '@/services/project.service'
import type { CreateProjectRequest } from '@/types/project'
import teamService from '@/services/team.service'

const router = useRouter()
const userStore = useUserStore()

// 状态
const submitting = ref(false)
const teamsLoading = ref(false)

// 数据
const teams = ref<{ id: string; name: string }[]>([])

// 表单
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  teamId: '',
  description: '',
  status: 'active',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 255, message: '项目名称长度在 1 到 255 个字符', trigger: 'blur' },
  ],
  teamId: [
    { required: true, message: '请选择团队', trigger: 'change' },
  ],
}

// 方法
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data: CreateProjectRequest = {
      name: form.name,
      teamId: form.teamId,
      description: form.description,
      status: form.status as any,
    }
    
    const project = await projectService.create(data)
    ElMessage.success('创建成功')
    router.push(`/projects/${project.id}`)
  } catch (error: any) {
    ElMessage.error(error.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

// 加载团队列表
const loadTeams = async () => {
  console.log('='.repeat(50))
  console.log('🚀 ProjectCreatePage: 开始加载团队列表...')
  console.log('='.repeat(50))
  teamsLoading.value = true
  try {
    console.log('📡 调用 teamService.getTeams()')
    const result = await teamService.getTeams()
    console.log('✅ 团队列表加载成功:', result)
    teams.value = result
  } catch (error: any) {
    console.error('❌ 加载团队列表失败:', error)
    ElMessage.error(`加载团队列表失败: ${error.message || '未知错误'}`)
  } finally {
    teamsLoading.value = false
    console.log('='.repeat(50))
  }
}

// 生命周期
onMounted(() => {
  console.log('ProjectCreatePage onMounted 执行')
  console.log('当前路由:', router.currentRoute.value.path)
  console.log('用户信息:', userStore.user)
  console.log('认证状态:', userStore.isAuthenticated)
  loadTeams()
})
</script>

<style scoped lang="scss">
.project-create-container {
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
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 32px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.form-card {
  padding: 32px;
}

.form-tip {
  margin-top: 8px;
  font-size: 13px;
  color: #909399;
}

.create-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;

  &:hover {
    text-decoration: underline;
  }
}
</style>