<template>
  <div class="annotation-container">
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
    <main class="main-content" v-loading="loading">
      <!-- 顶部区域：长文本显示区 -->
      <div class="annotation-top">
        <div class="top-toolbar">
          <el-button-group size="small">
            <el-button @click="handleBold" title="加粗">
              <strong>B</strong>
            </el-button>
            <el-button @click="handleItalic" title="斜体">
              <em>I</em>
            </el-button>
            <el-button @click="handleInsertTimestamp" title="插入时间戳">
              <el-icon><Clock /></el-icon>
            </el-button>
            <el-button @click="handleMarkSpeaker" title="标记说话人">
              <el-icon><User /></el-icon>
            </el-button>
            <el-button @click="handleMarkNoise" title="非语音标记">
              <el-icon><MuteNotification /></el-icon>
            </el-button>
          </el-button-group>
          
          <div class="toolbar-divider"></div>
          
          <el-button-group size="small">
            <el-button type="success" @click="handleSave" :loading="saving">
              <el-icon><DocumentCopy /></el-icon>
              保存
            </el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              <el-icon><Select /></el-icon>
              提交审核
            </el-button>
          </el-button-group>
          
          <div class="toolbar-right">
            <span class="text-stats">字数: {{ textStats.charCount }} | 标注: {{ textStats.annotationCount }}</span>
            <el-tag :type="saveStatusType">{{ saveStatusText }}</el-tag>
          </div>
        </div>
        
        <div class="text-editor-container">
          <textarea
            ref="textEditorRef"
            v-model="annotationText"
            class="text-editor"
            :disabled="!selectedAnnotationId"
            :placeholder="selectedAnnotationId ? '编辑当前标注文本...' : '请点击波形上的标注蒙板选择标注，或进入标注模式创建新标注...'"
            @input="handleTextChange"
            @keydown="handleKeydown"
          ></textarea>
        </div>
      </div>

      <!-- 中部区域：波形显示区 -->
      <div class="annotation-middle">
        <div class="waveform-toolbar">
          <el-button-group size="small">
            <el-button @click="zoomIn" title="放大">
              <el-icon><ZoomIn /></el-icon>
            </el-button>
            <el-button @click="zoomOut" title="缩小">
              <el-icon><ZoomOut /></el-icon>
            </el-button>
            <el-button @click="resetZoom" title="重置">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button @click="fitToWindow" title="适应窗口">
              <el-icon><FullScreen /></el-icon>
            </el-button>
            <el-button 
              @click="toggleAnnotationMode" 
              title="标注模式"
              :type="annotationMode ? 'primary' : 'default'"
            >
              <el-icon><Edit /></el-icon>
              {{ annotationMode ? '标注中' : '标注' }}
            </el-button>
          </el-button-group>
          
          <div class="toolbar-divider"></div>
          
          <!-- 标注类型切换器 -->
          <AnnotationTypeSwitcher
            v-if="annotationTypes.length > 0"
            :types="annotationTypes"
            :current-type="currentAnnotationType"
            @type-change="handleAnnotationTypeChange"
          />
          
          <div class="view-info">
            <span>{{ formatTime(viewStartTime) }} - {{ formatTime(viewEndTime) }}</span>
            <span class="divider">|</span>
            <span>总时长: {{ formatTime(duration) }}</span>
          </div>
        </div>
        
        <div class="waveform-container">
          <WaveformViewer
            v-if="audioId && audioUrl"
            ref="waveformViewerRef"
            :audio-id="audioId"
            :audio-url="audioUrl"
            :show-toolbar="false"
            :show-heatmap="true"
            :annotation-mode="annotationMode"
            :annotations="annotations"
            :annotation-types="annotationTypes"
            :current-annotation-type="currentAnnotationType"
            @ready="handleWaveformReady"
            @play="handlePlay"
            @pause="handlePause"
            @timeupdate="handleTimeUpdate"
            @regionclick="handleRegionClick"
            @interaction="handleInteraction"
            @selection-complete="handleSelectionComplete"
            @annotation-click="handleAnnotationClick"
          />
          
          <el-empty v-else description="请先选择音频文件" />
        </div>
      </div>

      <!-- 底部区域：功能控制区 -->
      <div class="annotation-bottom">
        <el-row :gutter="16">
          <!-- 播放控制 -->
          <el-col :span="6">
            <div class="panel">
              <div class="panel-header">播放控制</div>
              <div class="panel-content">
                <el-button-group size="small" style="width: 100%">
                  <el-button @click="playPrevious" style="flex: 1">
                    <el-icon><DArrowLeft /></el-icon>
                  </el-button>
                  <el-button @click="togglePlay" style="flex: 2" :type="isPlaying ? 'warning' : 'primary'">
                    <el-icon><component :is="isPlaying ? VideoPause : VideoPlay" /></el-icon>
                    {{ isPlaying ? '暂停' : '播放' }}
                  </el-button>
                  <el-button @click="stop" style="flex: 1">
                    <el-icon><CircleClose /></el-icon>
                  </el-button>
                  <el-button @click="playNext" style="flex: 1">
                    <el-icon><DArrowRight /></el-icon>
                  </el-button>
                </el-button-group>
                
                <div class="playback-controls" style="margin-top: 12px">
                  <el-row :gutter="8">
                    <el-col :span="12">
                      <el-select v-model="playbackRate" size="small" style="width: 100%">
                        <el-option label="0.5x" :value="0.5" />
                        <el-option label="0.75x" :value="0.75" />
                        <el-option label="1.0x" :value="1.0" />
                        <el-option label="1.25x" :value="1.25" />
                        <el-option label="1.5x" :value="1.5" />
                        <el-option label="2.0x" :value="2.0" />
                      </el-select>
                    </el-col>
                    <el-col :span="12">
                      <el-slider
                        v-model="volume"
                        :min="0"
                        :max="100"
                        :step="10"
                        size="small"
                        style="width: 100%"
                      />
                    </el-col>
                  </el-row>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 音频元数据 -->
          <el-col :span="6">
            <div class="panel">
              <div class="panel-header">音频信息</div>
              <div class="panel-content">
                <el-descriptions :column="1" size="small" border>
                  <el-descriptions-item label="文件名">{{ audioFile?.name || '-' }}</el-descriptions-item>
                  <el-descriptions-item label="时长">{{ formatDuration(duration) }}</el-descriptions-item>
                  <el-descriptions-item label="文件大小">{{ formatFileSize(audioFile?.fileSize || 0) }}</el-descriptions-item>
                  <el-descriptions-item label="格式">{{ audioFile?.fileType || '-' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
          </el-col>

          <!-- 快捷操作 -->
          <el-col :span="12">
            <div class="panel">
              <div class="panel-header">快捷操作</div>
              <div class="panel-content">
                <el-space wrap>
                  <el-button size="small" @click="handleNewAnnotation">
                    <el-icon><Plus /></el-icon>
                    新建标注
                  </el-button>
                  <el-button size="small" @click="handleAIProcess">
                    <el-icon><MagicStick /></el-icon>
                    AI 转写
                  </el-button>
                  <el-button size="small" @click="handleExport">
                    <el-icon><Download /></el-icon>
                    导出数据
                  </el-button>
                  <el-button size="small" @click="handleHelp">
                    <el-icon><QuestionFilled /></el-icon>
                    帮助文档
                  </el-button>
                </el-space>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 进度条 -->
        <div class="progress-bar-container">
          <el-slider
            v-model="progress"
            :max="100"
            :format-tooltip="formatProgressTooltip"
            @change="handleSeek"
            style="width: 100%"
          />
          <div class="progress-info">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
        </div>
</div>
    </main>

    <!-- 标注文本输入弹窗 -->
    <el-dialog
      v-model="annotationDialogVisible"
      title="添加标注"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="开始时间">{{ formatTimestamp(selectionStart) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatTimestamp(selectionEnd) }}</el-descriptions-item>
        <el-descriptions-item label="时长">{{ formatDuration(selectionEnd - selectionStart) }}</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 16px">
        <el-input
          v-model="annotationInputText"
          type="textarea"
          :rows="4"
          placeholder="请输入标注内容..."
          @keydown.ctrl.enter="handleConfirmAnnotation"
        />
      </div>
      
      <template #footer>
        <el-button @click="handleCancelAnnotation">取消</el-button>
        <el-button type="primary" @click="handleConfirmAnnotation">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Clock,
  User,
  MuteNotification,
  DocumentCopy,
  Select,
  ZoomIn,
  ZoomOut,
  RefreshRight,
  FullScreen,
  DArrowLeft,
  DArrowRight,
  VideoPlay,
  VideoPause,
  CircleClose,
  Plus,
  MagicStick,
  Download,
  QuestionFilled,
  Edit,
} from '@element-plus/icons-vue'
import WaveformViewer from '@/components/WaveformViewer.vue'
import AnnotationTypeSwitcher from '@/components/AnnotationTypeSwitcher.vue'
import audioService from '@/services/audio.service'
import httpService from '@/services/http'
import { authService } from '@/services/auth.service'
import type { AudioFile } from '@/types/audio'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const saving = ref(false)
const submitting = ref(false)

// 音频相关
const audioId = ref<string>('')
const audioFile = ref<AudioFile | null>(null)
const audioUrl = ref<string>('')
const waveformViewerRef = ref<InstanceType<typeof WaveformViewer>>()
const duration = ref(0)
const currentTime = ref(0)
const isPlaying = ref(false)
const playbackRate = ref(1.0)
const volume = ref(80)
const viewStartTime = ref(0)
const viewEndTime = ref(0)

// 标注模式相关
const annotationMode = ref(false)
const annotationDialogVisible = ref(false)
const annotationInputText = ref('')
const selectionStart = ref(0)
const selectionEnd = ref(0)

// 标注类型相关
const annotationTypes = ref<any[]>([
  { id: 'speaker-1', name: '说话人 1', color: '#059669', visible: true },
  { id: 'speaker-2', name: '说话人 2', color: '#3B82F6', visible: true },
  { id: 'speaker-3', name: '说话人 3', color: '#8B5CF6', visible: true },
  { id: 'noise', name: '非语音', color: '#EF4444', visible: true },
])
const currentAnnotationType = ref('speaker-1')

// 标注列表
const annotations = ref<any[]>([])
const selectedAnnotationId = ref<string | null>(null)

// 文本编辑器
const textEditorRef = ref<HTMLTextAreaElement>()
const annotationText = ref('')
const textStats = computed(() => {
  const text = annotationText.value
  // 计算字数（排除时间戳和标签）
  const cleanText = text.replace(/\[\d{2}:\d{2}\.\d{3}\]/g, '').replace(/\[👤[^]]+\]/g, '').replace(/\[🔇[^]]+\]/g, '')
  const charCount = cleanText.length
  
  // 计算标注数量（时间戳数量）
  const annotationCount = (text.match(/\[\d{2}:\d{2}\.\d{3}\]/g) || []).length
  
  return { charCount, annotationCount }
})

// 保存状态
const saveStatus = ref<'saved' | 'unsaved'>('saved')
const saveStatusType = computed(() => saveStatus.value === 'saved' ? 'success' : 'warning')
const saveStatusText = computed(() => saveStatus.value === 'saved' ? '已保存' : '未保存')

// 进度条
const progress = computed(() => {
  if (duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 加载音频文件
const loadAudioFile = async () => {
  if (!audioId.value) return

  loading.value = true
  try {
    audioFile.value = await audioService.getAudioFileById(audioId.value)
    duration.value = audioFile.value.duration || 0
    
    // 使用 HTTP 客户端获取音频流（自动携带认证令牌）
    const response = await httpService.get<ArrayBuffer>(
      `/audio/${audioId.value}/stream`,
      {
        responseType: 'arraybuffer',
      }
    )
    
    const blob = new Blob([response.data], { type: audioFile.value.fileType || 'audio/mpeg' })
    audioUrl.value = URL.createObjectURL(blob)
  } catch (error: any) {
    ElMessage.error(error.message || '加载音频文件失败')
  } finally {
    loading.value = false
  }
}

// 波形相关
const handleWaveformReady = () => {
  console.log('波形准备就绪')
}

const zoomIn = () => {
  waveformViewerRef.value?.zoomIn()
}

const zoomOut = () => {
  waveformViewerRef.value?.zoomOut()
}

const resetZoom = () => {
  waveformViewerRef.value?.resetZoom()
}

const fitToWindow = () => {
  waveformViewerRef.value?.fitToWindow()
}

// 播放控制
const togglePlay = () => {
  if (isPlaying.value) {
    waveformViewerRef.value?.pause()
  } else {
    waveformViewerRef.value?.play()
  }
}

const handlePlay = () => {
  isPlaying.value = true
}

const handlePause = () => {
  isPlaying.value = false
}

const stop = () => {
  waveformViewerRef.value?.stop()
  isPlaying.value = false
}

const playPrevious = () => {
  // TODO: 实现跳转到上一个标注
  ElMessage.info('跳转到上一个标注')
}

const playNext = () => {
  // TODO: 实现跳转到下一个标注
  ElMessage.info('跳转到下一个标注')
}

const handleTimeUpdate = (time: number) => {
  currentTime.value = time
  // 更新视图范围
  updateViewRange()
}

const handleSeek = (value: number) => {
  const time = (value / 100) * duration.value
  waveformViewerRef.value?.seekTo(time)
}

const updateViewRange = () => {
  if (duration.value === 0) return
  // 这里可以根据需要更新视图范围
}

// 文本编辑器
const handleTextChange = () => {
  saveStatus.value = 'unsaved'
  
  // 双向同步：更新当前选中的标注文本
  if (selectedAnnotationId.value) {
    const annotation = annotations.value.find(a => a.id === selectedAnnotationId.value)
    if (annotation) {
      annotation.text = annotationText.value
      annotation.updatedAt = new Date().toISOString()
    }
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+S 保存
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault()
    handleSave()
  }
  
  // Ctrl+T 插入时间戳
  if (event.ctrlKey && event.key === 't') {
    event.preventDefault()
    handleInsertTimestamp()
  }
  
  // Ctrl+Space 播放/暂停
  if (event.ctrlKey && event.code === 'Space') {
    event.preventDefault()
    togglePlay()
  }
}

const handleBold = () => {
  const textarea = textEditorRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = annotationText.value.substring(start, end)
  
  annotationText.value = annotationText.value.substring(0, start) + 
    `**${selectedText}**` + 
    annotationText.value.substring(end)
  
  saveStatus.value = 'unsaved'
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + 2, end + 2)
  })
}

const handleItalic = () => {
  const textarea = textEditorRef.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = annotationText.value.substring(start, end)
  
  annotationText.value = annotationText.value.substring(0, start) + 
    `*${selectedText}*` + 
    annotationText.value.substring(end)
  
  saveStatus.value = 'unsaved'
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + 1, end + 1)
  })
}

const handleInsertTimestamp = () => {
  const textarea = textEditorRef.value
  if (!textarea) return
  
  const timestamp = formatTimestamp(currentTime.value)
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  annotationText.value = annotationText.value.substring(0, start) + 
    `\n[${timestamp}]\n` + 
    annotationText.value.substring(end)
  
  saveStatus.value = 'unsaved'
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + timestamp.length + 4, start + timestamp.length + 4)
  })
}

const handleMarkSpeaker = () => {
  const textarea = textEditorRef.value
  if (!textarea) return
  
  ElMessageBox.prompt('请输入说话人名称', '标记说话人', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(({ value }) => {
    if (value) {
      const start = textarea.selectionStart
      annotationText.value = annotationText.value.substring(0, start) + 
        `[👤${value}] ` + 
        annotationText.value.substring(start)
      
      saveStatus.value = 'unsaved'
      nextTick(() => {
        textarea.focus()
      })
    }
  }).catch(() => {})
}

const handleMarkNoise = () => {
  const textarea = textEditorRef.value
  if (!textarea) return
  
  ElMessageBox.prompt('请输入噪音描述', '标记非语音', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  }).then(({ value }) => {
    if (value) {
      const start = textarea.selectionStart
      annotationText.value = annotationText.value.substring(0, start) + 
        `[🔇${value}] ` + 
        annotationText.value.substring(start)
      
      saveStatus.value = 'unsaved'
      nextTick(() => {
        textarea.focus()
      })
    }
  }).catch(() => {})
}

// 区域相关
const handleRegionClick = (region: any) => {
  console.log('区域点击:', region)
}

const handleInteraction = (interaction: string) => {
  console.log('交互:', interaction)
}

// 切换标注模式
const toggleAnnotationMode = () => {
  annotationMode.value = !annotationMode.value
  if (annotationMode.value) {
    ElMessage.info('进入标注模式，请在波形上点击两次选择时间区间')
  } else {
    waveformViewerRef.value?.resetSelection()
  }
}

// 处理标注类型切换
const handleAnnotationTypeChange = (typeId: string) => {
  currentAnnotationType.value = typeId
  ElMessage.success(`已切换到标注类型: ${annotationTypes.value.find(t => t.id === typeId)?.name}`)
}

// 处理标注点击
const handleAnnotationClick = (annotation: any) => {
  selectedAnnotationId.value = annotation.id
  // 更新文本编辑器，只显示当前标注的文本
  annotationText.value = annotation.text
  ElMessage.info(`已选中标注: ${annotation.text.substring(0, 20)}${annotation.text.length > 20 ? '...' : ''}`)
}

// 处理选择完成事件
const handleSelectionComplete = (selection: { startTime: number; endTime: number }) => {
  selectionStart.value = selection.startTime
  selectionEnd.value = selection.endTime
  
  // 检查同类型标注区间是否重叠
  const hasOverlap = checkAnnotationOverlap(selection.startTime, selection.endTime)
  if (hasOverlap) {
    ElMessage.error('所选时间区间与现有标注重叠，请重新选择')
    waveformViewerRef.value?.resetSelection()
    return
  }
  
  annotationInputText.value = ''
  annotationDialogVisible.value = true
}

// 检查标注区间是否重叠
const checkAnnotationOverlap = (startTime: number, endTime: number): boolean => {
  const sameTypeAnnotations = annotations.value.filter(
    a => a.type === currentAnnotationType.value
  )
  
  for (const annotation of sameTypeAnnotations) {
    // 检查是否有重叠：[a1, b1] 和 [a2, b2] 重叠当且仅当 max(a1, a2) < min(b1, b2)
    const overlapStart = Math.max(startTime, annotation.startTime)
    const overlapEnd = Math.min(endTime, annotation.endTime)
    
    if (overlapStart < overlapEnd) {
      return true
    }
  }
  
  return false
}

// 确认标注文本
const handleConfirmAnnotation = () => {
  // 创建新的标注
  const newAnnotation = {
    id: `annotation-${Date.now()}`,
    audioId: audioId.value,
    type: currentAnnotationType.value,
    startTime: selectionStart.value,
    endTime: selectionEnd.value,
    text: annotationInputText.value || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  // 添加到标注列表
  annotations.value.push(newAnnotation)
  
  // 自动选中新建的标注
  selectedAnnotationId.value = newAnnotation.id
  annotationText.value = newAnnotation.text
  
  saveStatus.value = 'unsaved'
  annotationDialogVisible.value = false
  annotationMode.value = false
  waveformViewerRef.value?.resetSelection()
  
  ElMessage.success('标注创建成功')
}

// 取消标注
const handleCancelAnnotation = () => {
  annotationDialogVisible.value = false
  annotationInputText.value = ''
  waveformViewerRef.value?.resetSelection()
}

// 操作
const handleSave = async () => {
  saving.value = true
  try {
    // TODO: 实现保存逻辑
    await new Promise(resolve => setTimeout(resolve, 500))
    saveStatus.value = 'saved'
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    await ElMessageBox.confirm('确定要提交审核吗？', '确认提交', {
      type: 'warning',
    })
    
    // TODO: 实现提交逻辑
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('提交成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('提交失败')
    }
  } finally {
    submitting.value = false
  }
}

const handleNewAnnotation = () => {
  ElMessage.info('新建标注功能开发中...')
}

const handleAIProcess = () => {
  ElMessage.info('AI 转写功能开发中...')
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const handleHelp = () => {
  ElMessage.info('帮助文档功能开发中...')
}

const handleLogout = () => {
  authService.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

// 格式化工具
const formatTime = (seconds: number): string => {
  if (!seconds || seconds < 0) return '00:00.000'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

const formatTimestamp = (seconds: number): string => {
  return formatTime(seconds)
}

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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatProgressTooltip = (value: number): string => {
  const time = (value / 100) * duration.value
  return formatTime(time)
}

// 监听播放速度变化
watch(playbackRate, (newRate) => {
  if (waveformViewerRef.value) {
    waveformViewerRef.value.setPlaybackRate(newRate);
  }
  console.log('播放速度:', newRate)
})

// 监听音量变化
watch(volume, (newVolume) => {
  if (waveformViewerRef.value) {
    waveformViewerRef.value.setVolume(newVolume);
  }
  console.log('音量:', newVolume)
})

// 生命周期
onMounted(async () => {
  audioId.value = route.query.audioId as string
  if (audioId.value) {
    await loadAudioFile()
  } else {
    ElMessage.warning('未选择音频文件')
  }
})

onBeforeUnmount(() => {
  // 清理 Blob URL
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>

<style scoped lang="scss">
.annotation-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
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
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// 顶部区域：长文本显示区
.annotation-top {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 150px;
  height: 15vh;
}

.top-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #e5e7eb;
  margin: 0 8px;
}

.toolbar-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.text-stats {
  font-size: 12px;
  color: #6b7280;
}

.text-editor-container {
  flex: 1;
  overflow: hidden;
}

.text-editor {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  outline: none;
  
  &:focus {
    outline: none;
  }

  &:disabled {
    background-color: #f5f7fa;
    color: #909399;
    cursor: not-allowed;
  }
}

// 中部区域：波形显示区
.annotation-middle {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  min-height: 300px;
  height: 35vh;
}

.waveform-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.view-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.view-info .divider {
  color: #dcdfe6;
}

.waveform-container {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

// 底部区域：功能控制区
.annotation-bottom {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  padding: 16px;
  flex-shrink: 0;
}

.panel {
  height: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.panel-header {
  padding: 8px 12px;
  background: #f5f7fa;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e5e7eb;
}

.panel-content {
  padding: 12px;
}

.playback-controls {
  margin-top: 12px;
}

.progress-bar-container {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #606266;
}
</style>