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
          <!-- 搜索区域 -->
          <div class="search-area">
            <el-select
              v-model="selectedProjectId"
              placeholder="选择项目"
              style="width: 180px"
              @change="handleProjectChange"
            >
              <el-option
                v-for="project in projects"
                :key="project.id"
                :label="project.name"
                :value="project.id"
              />
            </el-select>

            <el-input
              v-model="searchKeyword"
              placeholder="搜索音频文件"
              style="width: 220px"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>

          <!-- 文件夹树 -->
          <VirtualFolderTree
            :audio-files="audioFiles"
            :current-path="selectedPath"
            @folder-select="handlePathChange"
          />
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
          <el-table-column label="操作" width="200" fixed="right">
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
                type="success"
                link
                size="small"
                @click="handleAnnotate(row)"
              >
                标注
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
      <div class="upload-form">
        <div class="form-item">
          <label>存储路径：</label>
          <el-input
            v-model="uploadStoragePath"
            placeholder="例如：会议记录/2024/Q1"
            clearable
          >
            <template #prefix>
              <el-icon><Folder /></el-icon>
            </template>
          </el-input>
          <div class="form-tip">路径用 / 分隔，会自动创建虚拟文件夹</div>
        </div>
      </div>
      
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

    <!-- 播放对话框 -->
    <el-dialog
      v-model="playDialogVisible"
      :title="`播放：${currentPlayingAudio?.name || ''}`"
      width="900px"
      :close-on-click-modal="false"
      @close="handlePlayDialogClose"
    >
      <div class="play-dialog-content">
        <AudioPlayer
          v-if="playDialogVisible && currentPlayingAudio"
          :audio-url="getAudioStreamUrl(currentPlayingAudio.id)"
          :duration="currentPlayingAudio.duration"
          @timeupdate="handleTimeUpdate"
          @play="handlePlayStart"
          @pause="handlePlayPause"
          @stop="handlePlayStop"
        />
        
        <!-- 音频信息 -->
        <div class="audio-info" v-if="currentPlayingAudio">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="文件名">{{ currentPlayingAudio.name }}</el-descriptions-item>
            <el-descriptions-item label="文件大小">{{ formatFileSize(currentPlayingAudio.fileSize) }}</el-descriptions-item>
            <el-descriptions-item label="文件类型">{{ currentPlayingAudio.fileType }}</el-descriptions-item>
            <el-descriptions-item label="时长">{{ formatDuration(currentPlayingAudio.duration) }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox, type UploadFile, type UploadInstance } from 'element-plus'
import { Search, Upload, UploadFilled, Folder } from '@element-plus/icons-vue'
import audioService from '@/services/audio.service'
import { projectService } from '@/services/project.service'
import type { AudioFile } from '@/types/audio'
import type { Project } from '@/types/project'
import VirtualFolderTree from '@/components/VirtualFolderTree.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// 数据
const projects = ref<Project[]>([])
const audioFiles = ref<AudioFile[]>([])
const selectedProjectId = ref<string>(route.query.projectId as string || '')
const selectedPath = ref<string>(route.query.path as string || '')
const searchKeyword = ref('')
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 上传相关
const uploadDialogVisible = ref(false)
const uploadRef = ref<UploadInstance>()
const uploadStoragePath = ref<string>('')
const fileList = ref<UploadFile[]>([])
const uploading = ref(false)

// 播放相关
const playDialogVisible = ref(false)
const currentPlayingAudio = ref<AudioFile | null>(null)

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
  selectedPath.value = ''
  currentPage.value = 1
  loadAudioFiles()
}

// 处理路径变化
const handlePathChange = (path: string) => {
  selectedPath.value = path
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
  uploadStoragePath.value = ''
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
        uploadStoragePath.value || undefined,
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
  uploadStoragePath.value = ''
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
  if (!audioFile.id) {
    ElMessage.error('音频文件ID不存在')
    return
  }

  // 检查音频文件状态
  if (audioFile.status !== 'ready') {
    ElMessage.warning(`音频文件状态为：${audioFile.status}，无法播放`)
    return
  }

  currentPlayingAudio.value = audioFile
  playDialogVisible.value = true
  
  console.log('播放音频:', {
    id: audioFile.id,
    name: audioFile.name,
    url: getAudioStreamUrl(audioFile.id),
    status: audioFile.status
  })
}

// 处理标注
const handleAnnotate = (audioFile: AudioFile) => {
  if (!audioFile.id) {
    ElMessage.error('音频文件ID不存在')
    return
  }

  // 检查音频文件状态
  if (audioFile.status !== 'ready') {
    ElMessage.warning(`音频文件状态为：${audioFile.status}，无法标注`)
    return
  }

  // 跳转到标注页面
  router.push({
    path: '/annotation',
    query: {
      audioId: audioFile.id,
      projectId: selectedProjectId.value,
    },
  })
}

// 获取音频流式传输URL
const getAudioStreamUrl = (audioId: string): string => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  const url = `${baseUrl}/audio/${audioId}/stream`
  console.log('音频URL:', url)
  return url
}

// 处理播放对话框关闭
const handlePlayDialogClose = () => {
  playDialogVisible.value = false
  currentPlayingAudio.value = null
}

// 处理时间更新
const handleTimeUpdate = (currentTime: number) => {
  // 可以在这里处理时间更新逻辑
  console.log('播放时间:', currentTime)
}

// 处理播放开始
const handlePlayStart = () => {
  console.log('播放开始')
}

// 处理播放暂停
const handlePlayPause = () => {
  console.log('播放暂停')
}

// 处理播放停止
const handlePlayStop = () => {
  console.log('播放停止')
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
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.toolbar-left {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.search-area {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 4px 0;
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

.upload-form {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
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

.play-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow: hidden; /* 防止内容溢出弹窗 */
  max-width: 100%; /* 确保不超出容器 */
}

.audio-info {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
  overflow-x: auto; /* 允许表格横向滚动 */
}
</style>