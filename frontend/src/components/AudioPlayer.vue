<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { VideoPlay, VideoPause, CircleClose, ArrowLeft, ArrowRight, Mute, Notification } from '@element-plus/icons-vue'

interface Props {
  audioUrl: string // 音频流式传输 URL
  duration?: number // 音频总时长（秒）
}

interface Emits {
  (e: 'timeupdate', currentTime: number): void
  (e: 'playbackratechange', rate: number): void
  (e: 'play'): void
  (e: 'pause'): void
  (e: 'stop'): void
  (e: 'error', details: any): void
}

const props = withDefaults(defineProps<Props>(), {
  duration: 0,
})

const emit = defineEmits<Emits>()

// 播放状态
const isPlaying = ref(false)
const currentTime = ref(0)
const playbackRate = ref(1.0)
const volume = ref(1.0)
const isMuted = ref(false)

// 循环播放
const loopEnabled = ref(false)
const loopStart = ref(0)
const loopEnd = ref(0)

// 音频元素
const audioRef = ref<HTMLAudioElement>()

// 格式化时间（秒 -> MM:SS）
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化详细时间（秒 -> HH:MM:SS）
const formatTimeDetailed = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return '00:00:00'
  
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 播放
const play = async () => {
  if (!audioRef.value) return
  
  try {
    console.log('尝试播放音频:', {
      src: audioRef.value.src,
      readyState: audioRef.value.readyState,
      networkState: audioRef.value.networkState
    })
    
    await audioRef.value.play()
    isPlaying.value = true
    emit('play')
  } catch (error) {
    console.error('播放失败:', error)
    isPlaying.value = false
    
    // 显示友好的错误消息
    if (error instanceof Error) {
      if (error.message.includes('supported sources')) {
        ElMessage.error('无法播放音频：音频源不支持或文件不存在')
      } else if (error.message.includes('network')) {
        ElMessage.error('网络错误：无法加载音频')
      } else {
        ElMessage.error(`播放失败：${error.message}`)
      }
    } else {
      ElMessage.error('播放失败，请检查音频文件是否存在')
    }
  }
}

// 暂停
const pause = () => {
  if (!audioRef.value) return
  
  audioRef.value.pause()
  isPlaying.value = false
  emit('pause')
}

// 停止
const stop = () => {
  if (!audioRef.value) return
  
  audioRef.value.pause()
  audioRef.value.currentTime = 0
  isPlaying.value = false
  currentTime.value = 0
  emit('stop')
}

// 快进/后退
const seek = (seconds: number) => {
  if (!audioRef.value) return
  
  audioRef.value.currentTime = Math.max(0, Math.min(audioRef.value.duration, seconds))
}

// 快进5秒
const forward = () => {
  if (!audioRef.value) return
  seek(audioRef.value.currentTime + 5)
}

// 后退5秒
const backward = () => {
  if (!audioRef.value) return
  seek(audioRef.value.currentTime - 5)
}

// 设置播放速度
const setPlaybackRate = (rate: number) => {
  if (!audioRef.value) return
  
  playbackRate.value = rate
  audioRef.value.playbackRate = rate
  emit('playbackratechange', rate)
}

// 设置音量
const setVolume = (vol: number) => {
  if (!audioRef.value) return
  
  volume.value = Math.max(0, Math.min(1, vol))
  audioRef.value.volume = volume.value
  isMuted.value = volume.value === 0
}

// 切换静音
const toggleMute = () => {
  if (!audioRef.value) return
  
  isMuted.value = !isMuted.value
  audioRef.value.muted = isMuted.value
}

// 设置循环播放
const setLoop = (start: number, end: number) => {
  loopEnabled.value = true
  loopStart.value = start
  loopEnd.value = end
}

// 取消循环播放
const clearLoop = () => {
  loopEnabled.value = false
  loopStart.value = 0
  loopEnd.value = 0
}

// 音频事件处理
const handleTimeUpdate = () => {
  if (!audioRef.value) return

  currentTime.value = audioRef.value.currentTime
  emit('timeupdate', currentTime.value)

  // 循环播放检查
  if (loopEnabled.value && currentTime.value >= loopEnd.value) {
    // 跳转到循环起始位置
    audioRef.value.currentTime = loopStart.value

    // 确保音频继续播放（设置 currentTime 可能会暂停音频）
    if (!audioRef.value.paused) {
      audioRef.value.play().catch(err => {
        console.error('循环播放失败:', err)
      })
    }
  }
}

const handleLoadedMetadata = () => {
  if (!audioRef.value) return
  // 音频元数据加载完成
}

const handlePlay = () => {
  isPlaying.value = true
  emit('play')
}

const handlePause = () => {
  isPlaying.value = false
  emit('pause')
}

const handleEnded = () => {
  isPlaying.value = false
  // 如果循环播放，重新开始
  if (loopEnabled.value) {
    audioRef.value!.currentTime = loopStart.value
    play()
  }
}

const handleError = (error: Event) => {
  console.error('音频播放错误:', error)
  
  // 获取音频元素的错误信息
  const audioEl = error.target as HTMLAudioElement
  const errorDetails = {
    networkState: audioEl.networkState,
    readyState: audioEl.readyState,
    error: audioEl.error ? {
      code: audioEl.error.code,
      message: audioEl.error.message
    } : null,
    src: audioEl.src,
    currentSrc: audioEl.currentSrc
  }
  
  console.error('音频元素错误详情:', errorDetails)
  isPlaying.value = false
  
  // 通过事件发射错误信息
  emit('error', errorDetails)
}

// 进度条拖拽
const handleProgressInput = (value: number) => {
  seek(value)
}

// 快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 防止在输入框中触发快捷键
  if (event.target instanceof HTMLInputElement) return
  
  switch (event.code) {
    case 'Space':
      event.preventDefault()
      isPlaying.value ? pause() : play()
      break
    case 'Escape':
      stop()
      break
    case 'ArrowLeft':
      event.preventDefault()
      backward()
      break
    case 'ArrowRight':
      event.preventDefault()
      forward()
      break
    case 'BracketLeft':
      event.preventDefault()
      setPlaybackRate(Math.max(0.5, playbackRate.value - 0.25))
      break
    case 'BracketRight':
      event.preventDefault()
      setPlaybackRate(Math.min(2.0, playbackRate.value + 0.25))
      break
    case 'Slash':
      event.preventDefault()
      setPlaybackRate(1.0)
      break
  }
}

// 加载音频（使用 Blob URL 携带认证）
const loadAudioWithAuth = async (url: string): Promise<string> => {
  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('未登录，无法播放音频')
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('认证失败，请重新登录')
      } else if (response.status === 404) {
        throw new Error('音频文件不存在')
      }
      throw new Error(`加载音频失败: ${response.status}`)
    }

    const blob = await response.blob()
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('加载音频失败:', error)
    throw error
  }
}

// 监听音频 URL 变化
watch(() => props.audioUrl, async (newUrl) => {
  if (newUrl && audioRef.value) {
    try {
      const blobUrl = await loadAudioWithAuth(newUrl)
      // 释放旧的 Blob URL
      if (audioRef.value.src && audioRef.value.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioRef.value.src)
      }
      audioRef.value.src = blobUrl
    } catch (error) {
      console.error('加载音频失败:', error)
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    }
  }
})

// 组件挂载时设置音频源
onMounted(async () => {
  if (audioRef.value && props.audioUrl) {
    try {
      const blobUrl = await loadAudioWithAuth(props.audioUrl)
      audioRef.value.src = blobUrl
    } catch (error) {
      console.error('加载音频失败:', error)
      if (error instanceof Error) {
        ElMessage.error(error.message)
      }
    }
  }
  
  // 添加全局快捷键监听
  window.addEventListener('keydown', handleKeyDown)
})

// 组件卸载时移除快捷键监听并释放 Blob URL
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  
  // 释放 Blob URL
  if (audioRef.value?.src && audioRef.value.src.startsWith('blob:')) {
    URL.revokeObjectURL(audioRef.value.src)
  }
})

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  stop,
  seek,
  setPlaybackRate,
  setVolume,
  toggleMute,
  setLoop,
  clearLoop,
  isPlaying: () => isPlaying.value,
  getCurrentTime: () => currentTime.value,
})
</script>

<template>
  <div class="audio-player">
    <!-- 隐藏的音频元素 -->
    <audio
      ref="audioRef"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
      @error="handleError"
    />
    
    <!-- 播放器控制面板 -->
    <div class="player-controls">
      <!-- 播放控制按钮 -->
      <div class="control-buttons">
        <el-button
          circle
          size="large"
          :icon="ArrowLeft"
          @click="backward"
          title="后退5秒"
        />
        
        <el-button
          v-if="!isPlaying"
          circle
          size="large"
          type="primary"
          :icon="VideoPlay"
          @click="play"
          title="播放 (空格)"
        />
        
        <el-button
          v-else
          circle
          size="large"
          type="primary"
          :icon="VideoPause"
          @click="pause"
          title="暂停 (空格)"
        />
        
        <el-button
          circle
          size="large"
          :icon="CircleClose"
          @click="stop"
          title="停止 (Esc)"
        />
        
        <el-button
          circle
          size="large"
          :icon="ArrowRight"
          @click="forward"
          title="前进5秒"
        />
      </div>
      
      <!-- 进度条 -->
      <div class="progress-section">
        <span class="time-display">{{ formatTime(currentTime) }}</span>
        
        <el-slider
          v-model="currentTime"
          :max="duration || audioRef?.duration || 100"
          :show-tooltip="false"
          @input="handleProgressInput"
          class="progress-slider"
        />
        
        <span class="time-display">{{ formatTime(duration || audioRef?.duration || 0) }}</span>
      </div>
      
      <!-- 播放速度控制 -->
      <div class="playback-rate-control">
        <el-dropdown @command="setPlaybackRate">
          <el-button size="small">
            {{ playbackRate }}x
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="0.5">0.5x</el-dropdown-item>
              <el-dropdown-item :command="0.75">0.75x</el-dropdown-item>
              <el-dropdown-item :command="1.0">1.0x</el-dropdown-item>
              <el-dropdown-item :command="1.25">1.25x</el-dropdown-item>
              <el-dropdown-item :command="1.5">1.5x</el-dropdown-item>
              <el-dropdown-item :command="2.0">2.0x</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      
      <!-- 音量控制 -->
      <div class="volume-control">
        <el-button
          circle
          size="small"
          :icon="isMuted ? Mute : Notification"
          @click="toggleMute"
          title="静音"
        />
        
        <el-slider
          v-model="volume"
          :max="1"
          :step="0.1"
          :show-tooltip="false"
          @input="setVolume"
          class="volume-slider"
        />
      </div>
      
      <!-- 循环播放控制 -->
      <div class="loop-control">
        <el-button
          :type="loopEnabled ? 'primary' : 'default'"
          size="small"
          @click="loopEnabled ? clearLoop() : setLoop(currentTime, duration || audioRef?.duration || 0)"
          title="循环播放"
        >
          {{ loopEnabled ? '循环中' : '循环' }}
        </el-button>
      </div>
    </div>
    
    <!-- 快捷键提示 -->
    <div class="shortcuts-hint">
      <span class="hint-item">空格: 播放/暂停</span>
      <span class="hint-item">←/→: 后退/前进5秒</span>
      <span class="hint-item">[/]: 减速/加速</span>
      <span class="hint-item">/: 重置速度</span>
      <span class="hint-item">Esc: 停止</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.audio-player {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  overflow: hidden; /* 防止溢出 */
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  min-width: 0; /* 关键：允许 flex 容器压缩 */
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto; /* 不增长，不收缩，自动宽度 */
}

.progress-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0; /* 关键：允许压缩 */
  max-width: 100%;
}

.time-display {
  min-width: 45px;
  text-align: center;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  font-family: 'Courier New', monospace;
  flex: 0 0 auto; /* 不增长，不收缩，自动宽度 */
}

.progress-slider {
  flex: 1;
  min-width: 0; /* 关键：允许压缩 */
  max-width: 250px; /* 减小最大宽度 */
  flex-grow: 1; /* 关键：占据剩余空间 */
}

:deep(.el-slider__runway) {
  background-color: #e5e7eb;
}

:deep(.el-slider__bar) {
  background-color: #059669;
}

:deep(.el-slider__button) {
  border-color: #059669;
}

.playback-rate-control {
  flex: 0 0 auto;
  min-width: 60px; /* 限制最小宽度 */
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  min-width: 80px; /* 限制最小宽度 */
  max-width: 120px; /* 限制最大宽度 */
}

.volume-slider {
  width: 60px;
  min-width: 60px;
  flex: 0 1 auto; /* 可收缩，但保留最小宽度 */
}

.loop-control {
  flex: 0 0 auto;
  min-width: 60px; /* 限制最小宽度 */
}

.shortcuts-hint {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.hint-item::before {
  content: '•';
  color: #9ca3af;
}

.shortcuts-hint .hint-item:first-child::before {
  content: '';
}
</style>