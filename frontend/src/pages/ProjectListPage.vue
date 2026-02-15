<template>
  <div class="project-list-container">
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
        <h2 class="page-title">项目管理</h2>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建项目
        </el-button>
      </div>

      <!-- Search and Filter -->
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索项目名称"
          clearable
          style="width: 300px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="statusFilter"
          placeholder="项目状态"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="活跃" value="active" />
          <el-option label="已归档" value="archived" />
        </el-select>
        <el-button @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- Project List -->
      <el-table
        v-loading="loading"
        :data="projects"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="项目名称" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column prop="team.name" label="所属团队" width="150" />
        <el-table-column prop="creator.username" label="创建者" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleView(row)">
              查看
            </el-button>
            <el-button type="primary" link size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </main>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? '编辑项目' : '创建项目'"
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
        <el-form-item label="所属团队" prop="teamId">
          <el-select
            v-model="form.teamId"
            placeholder="请选择团队"
            style="width: 100%"
          >
            <el-option
              v-for="team in teams"
              :key="team.id"
              :label="team.name"
              :value="team.id"
            />
          </el-select>
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
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { projectService } from '@/services/project.service'
import teamService from '@/services/team.service'
import type { Project, QueryProjectsRequest, CreateProjectRequest, UpdateProjectRequest } from '@/types/project'

const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const submitting = ref(false)
const showCreateDialog = ref(false)
const isEdit = ref(false)
const currentProject = ref<Project | null>(null)

// 查询条件
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 数据
const projects = ref<Project[]>([])
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
const loadProjects = async () => {
  loading.value = true
  try {
    const query: QueryProjectsRequest = {
      page: currentPage.value,
      pageSize: pageSize.value,
    }

    if (searchQuery.value) {
      query.name = searchQuery.value
    }

    if (statusFilter.value) {
      query.status = statusFilter.value as any
    }

    const response = await projectService.getProjects(query)
    projects.value = response.data
    total.value = response.total
  } catch (error: any) {
    ElMessage.error(error.message || '加载项目列表失败')
  } finally {
    loading.value = false
  }
}

const loadTeams = async () => {
  try {
    console.log('🔄 开始加载团队列表...')
    const teamList = await teamService.getTeams()
    teams.value = teamList
    console.log('✅ 团队列表加载成功:', teamList)
  } catch (error: any) {
    console.error('❌ 加载团队列表失败:', error)
    ElMessage.error(error.message || '加载团队列表失败')
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadProjects()
}

const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  loadProjects()
}

const handleView = (project: Project) => {
  router.push(`/projects/${project.id}`)
}

const handleEdit = (project: Project) => {
  isEdit.value = true
  currentProject.value = project
  form.name = project.name
  form.teamId = project.teamId
  form.description = project.description || ''
  form.status = project.status
  showCreateDialog.value = true
}

const handleDelete = async (project: Project) => {
  try {
    await ElMessageBox.confirm(`确定要删除项目 "${project.name}" 吗？`, '确认删除', {
      type: 'warning',
    })

    await projectService.deleteProject(project.id)
    ElMessage.success('删除成功')
    loadProjects()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    if (isEdit.value && currentProject.value) {
      const data: UpdateProjectRequest = {
        name: form.name,
        teamId: form.teamId,
        description: form.description,
        status: form.status as any,
      }
      await projectService.updateProject(currentProject.value.id, data)
      ElMessage.success('更新成功')
    } else {
      const data: CreateProjectRequest = {
        name: form.name,
        teamId: form.teamId,
        description: form.description,
        status: form.status as any,
      }
      await projectService.create(data)
      ElMessage.success('创建成功')
    }
    
    showCreateDialog.value = false
    loadProjects()
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  isEdit.value = false
  currentProject.value = null
  form.name = ''
  form.teamId = ''
  form.description = ''
  form.status = 'active'
  formRef.value?.resetFields()
}

// 监听对话框打开，确保团队列表已加载
watch(showCreateDialog, (newVal) => {
  if (newVal && teams.value.length === 0) {
    loadTeams()
  }
})

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
  loadProjects()
  loadTeams()
})
</script>

<style scoped lang="scss">
.project-list-container {
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

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}
</style>