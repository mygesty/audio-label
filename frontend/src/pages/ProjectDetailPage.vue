<template>
  <div class="project-detail-container">
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
    <main class="main-content" v-loading="loading">
      <div class="page-header">
        <el-button @click="handleBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="page-actions">
          <el-button @click="showEditDialog = true">编辑</el-button>
          <el-button type="primary" @click="handleManageMembers">管理成员</el-button>
          <el-button type="danger" @click="handleDelete">删除</el-button>
        </div>
      </div>

      <template v-if="project">
        <el-card class="detail-card">
          <div class="detail-header">
            <h2 class="detail-title">{{ project.name }}</h2>
            <el-tag :type="getStatusType(project.status)">
              {{ getStatusText(project.status) }}
            </el-tag>
          </div>

          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="项目ID">
                {{ project.id }}
              </el-descriptions-item>
              <el-descriptions-item label="项目名称">
                {{ project.name }}
              </el-descriptions-item>
              <el-descriptions-item label="所属团队">
                {{ project.team?.name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建者">
                {{ project.creator?.username || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间" :span="2">
                {{ formatDate(project.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间" :span="2">
                {{ formatDate(project.updatedAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="detail-section" v-if="project.description">
            <div class="section-title">项目描述</div>
            <div class="description-text">{{ project.description }}</div>
          </div>

          <div class="detail-section">
            <div class="section-title">项目设置</div>
            <el-form label-width="120px" disabled>
              <el-form-item label="音频格式">
                <el-tag>MP3</el-tag>
                <el-tag>WAV</el-tag>
                <el-tag>FLAC</el-tag>
              </el-form-item>
              <el-form-item label="AI 模型">
                <el-tag type="success">Whisper Base</el-tag>
              </el-form-item>
            </el-form>
          </div>
        </el-card>

        <!-- Statistics -->
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>项目统计</span>
            </div>
          </template>
          <el-row :gutter="24">
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">128</div>
                <div class="stat-label">音频文件</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">45</div>
                <div class="stat-label">待标注</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">32</div>
                <div class="stat-label">待审核</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="stat-item">
                <div class="stat-value">51</div>
                <div class="stat-label">已完成</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- Quick Actions -->
        <el-card class="actions-card">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <el-space wrap>
            <el-button type="primary" @click="handleUploadAudio">
              <el-icon><Upload /></el-icon>
              上传音频
            </el-button>
            <el-button type="success" @click="handleStartAnnotation">
              <el-icon><Edit /></el-icon>
              开始标注
            </el-button>
            <el-button type="warning" @click="handleViewTasks">
              <el-icon><List /></el-icon>
              查看任务
            </el-button>
            <el-button type="info" @click="handleExport">
              <el-icon><Download /></el-icon>
              导出数据
            </el-button>
          </el-space>
        </el-card>
      </template>
    </main>

    <!-- Edit Dialog -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑项目"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入项目描述"
          />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="活跃" value="active" />
            <el-option label="已归档" value="archived" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  Upload,
  Edit,
  List,
  Download,
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { projectService } from '@/services/project.service'
import type { Project, UpdateProjectRequest } from '@/types/project'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const showEditDialog = ref(false)

// 数据
const project = ref<Project | null>(null)

// 表单
const formRef = ref<FormInstance>()
const form = reactive({
  name: '',
  description: '',
  status: 'active',
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 255, message: '项目名称长度在 1 到 255 个字符', trigger: 'blur' },
  ],
}

// 方法
const loadProject = async () => {
  loading.value = true
  try {
    const projectId = route.params.id as string
    project.value = await projectService.getProject(projectId)
    
    // 填充表单
    form.name = project.value.name
    form.description = project.value.description || ''
    form.status = project.value.status
  } catch (error: any) {
    ElMessage.error(error.message || '加载项目详情失败')
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleEdit = () => {
  if (!project.value) return
  
  form.name = project.value.name
  form.description = project.value.description || ''
  form.status = project.value.status
  showEditDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value || !project.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data: UpdateProjectRequest = {
      name: form.name,
      description: form.description,
      status: form.status as any,
    }
    
    await projectService.updateProject(project.value.id, data)
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadProject()
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

const handleDelete = async () => {
  if (!project.value) return

  try {
    await ElMessageBox.confirm(`确定要删除项目 "${project.value.name}" 吗？`, '确认删除', {
      type: 'warning',
    })

    await projectService.deleteProject(project.value.id)
    ElMessage.success('删除成功')
    router.push('/projects')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleManageMembers = () => {
  if (!project.value) return
  // TODO: 实现成员管理
  ElMessage.info('成员管理功能开发中...')
}

const handleUploadAudio = () => {
  if (!project.value) return
  // TODO: 实现上传音频
  ElMessage.info('上传音频功能开发中...')
}

const handleStartAnnotation = () => {
  if (!project.value) return
  // TODO: 跳转到标注页面
  ElMessage.info('标注功能开发中...')
}

const handleViewTasks = () => {
  if (!project.value) return
  router.push('/tasks')
}

const handleExport = () => {
  if (!project.value) return
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

const resetForm = () => {
  if (!project.value) return
  form.name = project.value.name
  form.description = project.value.description || ''
  form.status = project.value.status
  formRef.value?.resetFields()
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadProject()
})
</script>

<style scoped lang="scss">
.project-detail-container {
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.page-actions {
  display: flex;
  gap: 12px;
}

.detail-card {
  margin-bottom: 24px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.detail-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
}

.description-text {
  color: #6b7280;
  line-height: 1.6;
  white-space: pre-wrap;
}

.stats-card,
.actions-card {
  margin-bottom: 24px;
}

.card-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
}
</style>