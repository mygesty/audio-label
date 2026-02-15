<template>
  <div class="audio-list-container">
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
          <router-link to="/audio-list" class="nav-link active">音频列表</router-link>
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
        <h2 class="page-title">音频列表</h2>
      </div>

      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-select
            v-model="selectedProjectId"
            placeholder="选择项目"
            style="width: 200px"
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in projects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>

          <el-select
            v-model="selectedFolderId"
            placeholder="选择文件夹"
            style="width: 200px"
            @change="handleFolderChange"
          >
            <el-option
              v-for="folder in folders"
              :key="folder.id"
              :label="folder.name"
              :value="folder.id"
            />
          </el-select>

          <el-input
            v-model="searchKeyword"
            placeholder="搜索音频文件"
            style="width: 200px"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="toolbar-right">
          <el-button type="primary" @click="handleUpload">
            <el-icon><Upload /></el-icon>
            上传音频
          </el-button>
        </div>
      </div>

      <!-- 音频文件列表 -->
      <div class="audio-list">
        <el-table
          :data="audioFiles"
          v-loading="loading"
          stripe
          style="width: 100%"
        >
          <el-table-column prop="name" label="文件名" min-width="200" />
          <el-table-column prop="fileSize" label="文件大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="fileType" label="文件类型" width="120" />
          <el-table-column prop="duration" label="时长" width="120">
            <template #default="{ row }">
              {{ formatDuration(row.duration) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="上传时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="handlePlay(row)"
              >
                播放
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </main>

    <!-- 上传对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传音频文件"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
        :limit="10"
        :file-list="fileList"
        drag
        multiple
        accept=".mp3,.wav,.flac,.ogg,.m4a"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">
          将文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式：MP3、WAV、FLAC、OGG、M4A，单个文件不超过 500MB
          </div>
        </template>
      </el-upload>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="uploading" @click="handleConfirmUpload">
            开始上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox, type UploadFile, type UploadInstance } from 'element-plus'
import { Search, Upload, UploadFilled } from '@element-plus/icons-vue'
import audioService from '@/services/audio.service'
import { projectService } from '@/services/project.service'
import type { AudioFile, AudioFolder } from '@/types/audio'
import type { Project } from '@/types/project'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 数据
const projects = ref<Project[]>([])
const folders = ref<AudioFolder[]>([])
const audioFiles = ref<AudioFile[]>([])
const selectedProjectId = ref<string>(route.query.projectId as string || '')
const selectedFolderId = ref<string>(route.query.folderId as string || '')
const searchKeyword = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 上传相关
const uploadDialogVisible = ref(false)
const uploadRef = ref<UploadInstance>()
const fileList = ref<UploadFile[]>([])
const uploading = ref(false)

// 处理登出
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

// 加载项目列表
const loadProjects = async () => {
  try {
    const response = await projectService.getProjects({
      page: 1,
      pageSize: 100,
    })
    projects.value = response.data
  } catch (error) {
    ElMessage.error('加载项目列表失败')
  }
}

// 加载文件夹列表
const loadFolders = async () => {
  if (!selectedProjectId.value) {
    folders.value = []
    return
  }

  try {
    folders.value = await audioService.getFolders(selectedProjectId.value)
  } catch (error) {
    ElMessage.error('加载文件夹列表失败')
  }
}

// 加载音频文件列表
const loadAudioFiles = async () => {
  if (!selectedProjectId.value) {
    audioFiles.value = []
    total.value = 0
    return
  }

  loading.value = true
  try {
    const response = await audioService.getAudioFiles({
      projectId: selectedProjectId.value,
      folderId: selectedFolderId.value || undefined,
      name: searchKeyword.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
    })
    audioFiles.value = response.data
    total.value = response.total
  } catch (error) {
    ElMessage.error('加载音频文件列表失败')
  } finally {
    loading.value = false
  }
}

// 处理项目变化
const handleProjectChange = () => {
  selectedFolderId.value = ''
  currentPage.value = 1
  loadFolders()
  loadAudioFiles()
}

// 处理文件夹变化
const handleFolderChange = () => {
  currentPage.value = 1
  loadAudioFiles()
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  loadAudioFiles()
}

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadAudioFiles()
}

// 处理页码变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadAudioFiles()
}

// 处理上传按钮点击
const handleUpload = () => {
  if (!selectedProjectId.value) {
    ElMessage.warning('请先选择项目')
    return
  }
  uploadDialogVisible.value = true
}

// 处理文件选择
const handleFileChange = (file: UploadFile, newFileList: UploadFile[]) => {
  fileList.value = newFileList
}

// 处理文件移除
const handleFileRemove = (file: UploadFile, newFileList: UploadFile[]) => {
  fileList.value = newFileList
}

// 处理对话框关闭
const handleDialogClose = () => {
  fileList.value = []
  uploadRef.value?.clearFiles()
}

// 确认上传
const handleConfirmUpload = async () => {
  if (fileList.value.length === 0) {
    ElMessage.warning('请选择要上传的文件')
    return
  }

  uploading.value = true
  const failedFiles: string[] = []

  for (const file of fileList.value) {
    try {
      await audioService.uploadFile(
        file.raw as File,
        selectedProjectId.value,
        selectedFolderId.value || undefined,
      )
      ElMessage.success(`${file.name} 上传成功`)
    } catch (error) {
      failedFiles.push(file.name)
      ElMessage.error(`${file.name} 上传失败`)
    }
  }

  uploading.value = false
  uploadDialogVisible.value = false
  fileList.value = []
  // 清空上传组件的文件列表
  uploadRef.value?.clearFiles()
  loadAudioFiles()

  if (failedFiles.length > 0) {
    ElMessage.error(`${failedFiles.length} 个文件上传失败`)
  } else {
    ElMessage.success('所有文件上传成功')
  }
}

// 处理播放
const handlePlay = (audioFile: AudioFile) => {
  ElMessage.info('播放功能开发中...')
}

// 处理删除
const handleDelete = async (audioFile: AudioFile) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除音频文件 "${audioFile.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      },
    )

    await audioService.deleteAudioFile(audioFile.id)
    ElMessage.success('删除成功')
    loadAudioFiles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// 格式化时长
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return '-'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

// 格式化日期
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (status: string): string => {
  const statusMap: Record<string, string> = {
    uploading: 'info',
    ready: 'success',
    processing: 'warning',
    error: 'danger',
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    uploading: '上传中',
    ready: '就绪',
    processing: '处理中',
    error: '错误',
  }
  return statusMap[status] || status
}

// 页面加载时初始化
onMounted(async () => {
  await loadProjects()
  if (selectedProjectId.value) {
    await loadFolders()
    await loadAudioFiles()
  }
})
</script>

<style scoped lang="scss">
.audio-list-container {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
}

.audio-list {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.el-icon--upload {
  font-size: 67px;
  color: var(--el-text-color-secondary);
  margin: 40px 0 16px;
}
</style>