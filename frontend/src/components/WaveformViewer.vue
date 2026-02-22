<template>
  <div class="waveform-viewer">
    <!-- 工具栏 -->
    <div class="waveform-toolbar" v-if="showToolbar">
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
      </el-button-group>

      <div class="view-info">
        <span>{{ formatTime(viewStartTime) }} - {{ formatTime(viewEndTime) }}</span>
        <span class="divider">|</span>
        <span>总时长: {{ formatTime(duration) }}</span>
      </div>

      <div class="zoom-level" v-if="currentZoomLevel">
        <el-tag size="small">{{ currentZoomLevel }}</el-tag>
      </div>
    </div>

    <!-- 波形容器 -->
    <div
      ref="waveformContainer"
      class="waveform-container"
      :class="{ 'with-toolbar': showToolbar, 'annotation-mode': annotationMode }"
      :style="{ height: height }"
      @click="handleWaveformClick"
      @mousemove="handleWaveformMouseMove"
    >
      <!-- 加载状态 -->
      <div v-if="loading" class="waveform-loading">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
        <p>{{ loadingText }}</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="waveform-error">
        <el-icon :size="40" color="#F56C6C">
          <Warning />
        </el-icon>
        <p>{{ error }}</p>
        <el-button size="small" @click="loadWaveform">重试</el-button>
      </div>

      <!-- 波形 Canvas（WaveSurfer.js 会自动创建） -->
      
      <!-- 十字准光标（标注模式下显示） -->
      <div 
        v-if="annotationMode" 
        ref="crosshairElement"
        class="crosshair-cursor"
        :style="{ 
          display: selectionStep > 0 ? 'block' : 'none'
        }"
      ></div>
      
      <!-- 选择区域高亮 -->
      <div 
        v-if="annotationMode && selectionStep === 1"
        class="selection-highlight"
        :style="getSelectionStyle()"
      ></div>
      
      <!-- 标注蒙板层 -->
      <div class="annotation-masks">
        <div
          v-for="annotation in filteredAnnotations"
          :key="annotation.id"
          class="annotation-mask"
          :class="{ 'selected': selectedAnnotationId === annotation.id }"
          :style="getAnnotationMaskStyle(annotation)"
          @click="handleAnnotationClick(annotation)"
          @mouseenter="handleAnnotationMouseEnter(annotation)"
          @mouseleave="handleAnnotationMouseLeave"
        >
          <span class="annotation-text">
            {{ truncateText(annotation.text) }}
          </span>
          <el-tooltip
            v-if="annotation.text.length > 20"
            :content="annotation.text"
            placement="top"
          >
            <template #content>
              <div>{{ annotation.text }}</div>
            </template>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 热力图 -->
    <div class="waveform-heatmap" v-if="showHeatmap && !loading && !error">
      <div class="heatmap-bar">
        <canvas ref="heatmapCanvas" :width="heatmapWidth" :height="heatmapHeight"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.esm.js';
import { ZoomIn, ZoomOut, RefreshRight, FullScreen, Loading, Warning } from '@element-plus/icons-vue';
import audioService from '@/services/audio.service';

// Props
interface Props {
  audioId: string;
  audioUrl?: string;
  height?: string;
  showToolbar?: boolean;
  showHeatmap?: boolean;
  initialZoom?: number;
  autoPlay?: boolean;
  autoScroll?: boolean;
  annotationMode?: boolean;
  annotations?: any[]; // 标注列表
  annotationTypes?: any[]; // 标注类型列表
  currentAnnotationType?: string; // 当前选中的标注类型
}

const props = withDefaults(defineProps<Props>(), {
  height: '400px',
  showToolbar: true,
  showHeatmap: true,
  initialZoom: 100,
  autoPlay: false,
  autoScroll: true,
  annotationMode: false,
  annotations: () => [],
  annotationTypes: () => [],
  currentAnnotationType: '',
});

// Emits
const emit = defineEmits<{
  ready: [];
  play: [];
  pause: [];
  finish: [];
  timeupdate: [currentTime: number];
  regionclick: [region: any];
  regionupdate: [region: any];
  zoom: [zoomLevel: number];
  interaction: [interaction: string];
  selectionComplete: [selection: { startTime: number; endTime: number }]; // 新增：选择完成事件
  annotationClick: [annotation: any];
}>();

// Refs
const waveformContainer = ref<HTMLDivElement>();
const heatmapCanvas = ref<HTMLCanvasElement>();

// State
const loading = ref(false);
const loadingText = ref('正在加载波形...');
const error = ref<string | null>(null);
const duration = ref(0);
const currentTime = ref(0);
const currentZoom = ref(props.initialZoom);
const viewStartTime = ref(0);
const viewEndTime = ref(0);

// WaveSurfer 实例
let wavesurfer: WaveSurfer | null = null;
let regionsPlugin: any = null;
let timelinePlugin: any = null;

// 热力图相关
const heatmapWidth = ref(1000);
const heatmapHeight = ref(40);

// 选择相关状态
const selectionStep = ref(0); // 0: 未开始, 1: 已选择开始时间, 2: 已选择结束时间
const selectionStartTime = ref(0);
const selectionEndTime = ref(0);
const selectionElement = ref<HTMLDivElement | null>(null);

// 标注相关状态
const selectedAnnotationId = ref<string | null>(null);
const hoveredAnnotationId = ref<string | null>(null);

// 计算属性
const currentZoomLevel = computed(() => {
  if (currentZoom.value >= 1000) return '概览级';
  if (currentZoom.value >= 100) return '详细级';
  if (currentZoom.value >= 10) return '缩放级';
  return '默认';
});

// 过滤当前类型的标注
const filteredAnnotations = computed(() => {
  if (!props.annotations || !props.currentAnnotationType) return [];
  return props.annotations.filter(a => 
    a.type === props.currentAnnotationType
  );
});

// 方法

/**
 * 格式化时间
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
};

/**
 * 计算选择区域的样式
 */
const getSelectionStyle = () => {
  if (!wavesurfer || selectionStep.value !== 1) return {};
  
  const duration = wavesurfer.getDuration();
  const containerWidth = waveformContainer.value?.clientWidth || 1000;
  
  const startPercent = (selectionStartTime.value / duration) * 100;
  const endPercent = (selectionEndTime.value / duration) * 100;
  const leftPercent = Math.min(startPercent, endPercent);
  const widthPercent = Math.abs(endPercent - startPercent);
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    height: '100%',
  };
};

/**
 * 计算标注蒙板的样式
 */
const getAnnotationMaskStyle = (annotation: any) => {
  if (!wavesurfer) return {};
  
  const duration = wavesurfer.getDuration();
  const annotationType = props.annotationTypes?.find(t => t.id === annotation.type);
  const color = annotationType?.color || '#059669';
  
  const leftPercent = (annotation.startTime / duration) * 100;
  const widthPercent = ((annotation.endTime - annotation.startTime) / duration) * 100;
  
  return {
    left: `${leftPercent}%`,
    width: `${widthPercent}%`,
    height: '100%',
    backgroundColor: `${color}33`, // 20% 透明度
    borderColor: `${color}66`, // 40% 透明度
  };
};

/**
 * 截断文本（显示省略号）
 */
const truncateText = (text: string, maxLength: number = 20): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * 处理标注点击
 */
const handleAnnotationClick = (annotation: any) => {
  selectedAnnotationId.value = annotation.id;
  emit('annotationClick', annotation);
  
  // 跳转到标注位置
  if (wavesurfer) {
    wavesurfer.seekTo(annotation.startTime / wavesurfer.getDuration());
    currentTime.value = annotation.startTime;
  }
};

/**
 * 处理标注鼠标悬停进入
 */
const handleAnnotationMouseEnter = (annotation: any) => {
  hoveredAnnotationId.value = annotation.id;
};

/**
 * 处理标注鼠标悬停离开
 */
const handleAnnotationMouseLeave = () => {
  hoveredAnnotationId.value = null;
};

/**
 * 处理波形点击（标注模式）
 */
const handleWaveformClick = (e: MouseEvent) => {
  if (!props.annotationMode || !wavesurfer || !waveformContainer.value) return;
  
  const rect = waveformContainer.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const duration = wavesurfer.getDuration();
  const time = (x / rect.width) * duration;
  
  if (selectionStep.value === 0) {
    // 第一步：选择开始时间
    selectionStartTime.value = time;
    selectionEndTime.value = time;
    selectionStep.value = 1;
  } else if (selectionStep.value === 1) {
    // 第二步：选择结束时间
    selectionEndTime.value = time;
    selectionStep.value = 2;
    
    // 发射选择完成事件
    emit('selectionComplete', {
      startTime: Math.min(selectionStartTime.value, selectionEndTime.value),
      endTime: Math.max(selectionStartTime.value, selectionEndTime.value),
    });
    
    // 重置选择状态
    setTimeout(() => {
      selectionStep.value = 0;
    }, 100);
  }
};

/**
 * 处理鼠标移动（更新选择区域）
 */
const handleWaveformMouseMove = (e: MouseEvent) => {
  if (!props.annotationMode || selectionStep.value !== 1 || !wavesurfer || !waveformContainer.value) return;
  
  const rect = waveformContainer.value.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const duration = wavesurfer.getDuration();
  const time = (x / rect.width) * duration;
  
  selectionEndTime.value = time;
};

/**
 * 重置选择状态
 */
const resetSelection = () => {
  selectionStep.value = 0;
  selectionStartTime.value = 0;
  selectionEndTime.value = 0;
};

/**
 * 设置播放速度
 */
const setPlaybackRate = (rate: number) => {
  if (wavesurfer) {
    const media = wavesurfer.getMediaElement();
    if (media) {
      media.playbackRate = rate;
    }
  }
};

/**
 * 设置音量
 */
const setVolume = (volume: number) => {
  if (wavesurfer) {
    const media = wavesurfer.getMediaElement();
    if (media) {
      media.volume = volume;
    }
  }
};

/**
 * 初始化 WaveSurfer.js
 */
const initWaveSurfer = async () => {
  if (!waveformContainer.value) return;

  loading.value = true;
  loadingText.value = '正在初始化波形...';
  error.value = null;

  try {
    // 创建 Regions 插件实例
    regionsPlugin = RegionsPlugin.create({
      dragSelection: {
        slop: 5,
      },
    });

    // 创建 Timeline 插件实例
    timelinePlugin = TimelinePlugin.create({
      height: 20,
      insertPosition: 'beforebegin',
      timeInterval: 0.5,
      primaryLabelInterval: 2,
      secondaryLabelInterval: 0.5,
      style: {
        fontSize: '11px',
        color: '#999',
      },
    });

    // 初始化 WaveSurfer
    wavesurfer = WaveSurfer.create({
      container: waveformContainer.value,
      waveColor: '#409EFF',
      progressColor: '#67C23A',
      cursorColor: '#F56C6C',
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      // height: props.height.includes('%') ? null : parseInt(props.height),
      height: 'auto',
      minPxPerSec: currentZoom.value,
      autoScroll: props.autoScroll,
      interact: true,
      hideScrollbar: false,
      autoCenter: true,
      normalize: false,
      plugins: [regionsPlugin, timelinePlugin],
    });

    // 监听事件
    wavesurfer.on('ready', () => {
      loading.value = false;
      duration.value = wavesurfer!.getDuration();
      emit('ready');

      // 自动播放
      if (props.autoPlay) {
        wavesurfer!.play();
      }
    });

    wavesurfer.on('play', () => {
      emit('play');
    });

    wavesurfer.on('pause', () => {
      emit('pause');
    });

    wavesurfer.on('finish', () => {
      emit('finish');
    });

    wavesurfer.on('timeupdate', (time: number) => {
      currentTime.value = time;
      emit('timeupdate', time);
      updateViewRange();
    });

    wavesurfer.on('interaction', (interaction: string) => {
      emit('interaction', interaction);
    });

    wavesurfer.on('zoom', (zoomLevel: number) => {
      currentZoom.value = zoomLevel;
      emit('zoom', zoomLevel);
      updateViewRange();
    });

    // 区域相关事件
    regionsPlugin.on('region-updated', (region: any) => {
      emit('regionupdate', region);
    });

    regionsPlugin.on('region-clicked', (region: any, e: MouseEvent) => {
      e.stopPropagation();
      emit('regionclick', region);
    });

    // 加载音频
    if (props.audioUrl) {
      await wavesurfer.load(props.audioUrl);
    } else {
      // 如果没有提供音频 URL，尝试从后端获取
      await loadWaveform();
    }
  } catch (err: any) {
    console.error('WaveSurfer 初始化失败:', err);
    error.value = err.message || '波形初始化失败';
    loading.value = false;
  }
};

/**
 * 从后端加载波形数据
 */
const loadWaveform = async () => {
  if (!wavesurfer) return;

  loading.value = true;
  loadingText.value = '正在生成波形数据...';
  error.value = null;

  try {
    // 获取波形数据
    const response = await audioService.getWaveformData(props.audioId, 100);

    if (response.data && response.data.length > 0) {
      // 加载音频文件（使用流式传输 URL）
      const streamUrl = `/api/audio/${props.audioId}/stream`;
      await wavesurfer.load(streamUrl);
    } else {
      throw new Error('波形数据为空');
    }
  } catch (err: any) {
    console.error('加载波形失败:', err);
    error.value = err.message || '加载波形失败';
    loading.value = false;
  }
};

/**
 * 更新视图范围
 */
const updateViewRange = () => {
  if (!wavesurfer) return;

  const duration = wavesurfer.getDuration();
  const zoom = wavesurfer.options.minPxPerSec;
  const width = waveformContainer.value?.clientWidth || 1000;

  // 计算当前视图的时间范围
  const viewDuration = width / zoom;
  const start = Math.max(0, currentTime.value - viewDuration / 2);
  const end = Math.min(duration, start + viewDuration);

  viewStartTime.value = start;
  viewEndTime.value = end;
};

/**
 * 放大
 */
const zoomIn = () => {
  if (!wavesurfer) return;
  const newZoom = Math.min(currentZoom.value * 1.5, 10000);
  wavesurfer.zoom(newZoom);
};

/**
 * 缩小
 */
const zoomOut = () => {
  if (!wavesurfer) return;
  const newZoom = Math.max(currentZoom.value / 1.5, 10);
  wavesurfer.zoom(newZoom);
};

/**
 * 重置缩放
 */
const resetZoom = () => {
  if (!wavesurfer) return;
  wavesurfer.zoom(props.initialZoom);
};

/**
 * 适应窗口
 */
const fitToWindow = () => {
  if (!wavesurfer || !waveformContainer.value) return;

  const duration = wavesurfer.getDuration();
  const width = waveformContainer.value.clientWidth;
  const newZoom = width / duration;

  wavesurfer.zoom(newZoom);
};

/**
 * 跳转到指定时间
 */
const seekTo = (time: number) => {
  if (!wavesurfer) return;
  wavesurfer.seekTo(time / wavesurfer.getDuration());
};

/**
 * 播放
 */
const play = () => {
  if (!wavesurfer) return;
  wavesurfer.play();
};

/**
 * 暂停
 */
const pause = () => {
  if (!wavesurfer) return;
  wavesurfer.pause();
};

/**
 * 停止
 */
const stop = () => {
  if (!wavesurfer) return;
  wavesurfer.stop();
};

/**
 * 添加区域
 */
const addRegion = (options: any) => {
  if (!regionsPlugin) return;
  return regionsPlugin.addRegion(options);
};

/**
 * 清除所有区域
 */
const clearRegions = () => {
  if (!regionsPlugin) return;
  regionsPlugin.clearRegions();
};

/**
 * 销毁 WaveSurfer
 */
const destroy = () => {
  if (wavesurfer) {
    wavesurfer.destroy();
    wavesurfer = null;
  }
};

// 监听 audioId 变化
watch(() => props.audioId, (newId, oldId) => {
  if (newId !== oldId) {
    destroy();
    nextTick(() => {
      initWaveSurfer();
    });
  }
});

// 监听 audioUrl 变化
watch(() => props.audioUrl, (newUrl) => {
  if (wavesurfer && newUrl) {
    wavesurfer.load(newUrl);
  }
});

// 监听 annotationMode 变化
watch(() => props.annotationMode, (newMode) => {
  if (!newMode) {
    resetSelection();
  }
});

// 生命周期
onMounted(() => {
  initWaveSurfer();
});

onBeforeUnmount(() => {
  destroy();
});

// 暴露方法给父组件
defineExpose({
  play,
  pause,
  stop,
  seekTo,
  zoomIn,
  zoomOut,
  resetZoom,
  fitToWindow,
  addRegion,
  clearRegions,
  resetSelection,
  setPlaybackRate,
  setVolume,
  getCurrentTime: () => currentTime.value,
  getDuration: () => duration.value,
  getZoom: () => currentZoom.value,
});
</script>

<style scoped>
.waveform-viewer {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.waveform-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
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

.zoom-level {
  margin-left: auto;
}

.waveform-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.waveform-container.with-toolbar {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.waveform-container.annotation-mode {
  cursor: crosshair;
}

.crosshair-cursor {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.crosshair-cursor::before,
.crosshair-cursor::after {
  content: '';
  position: absolute;
  background: rgba(64, 158, 255, 0.8);
}

.crosshair-cursor::before {
  width: 1px;
  height: 100%;
  left: 50%;
  transform: translateX(-50%);
}

.crosshair-cursor::after {
  width: 100%;
  height: 1px;
  top: 50%;
  transform: translateY(-50%);
}

.selection-highlight {
  position: absolute;
  top: 0;
  height: 100%;
  background: rgba(64, 158, 255, 0.2);
  border: 2px solid rgba(64, 158, 255, 0.6);
  pointer-events: none;
  z-index: 5;
  transition: all 0.1s ease;
}

/* 标注蒙板层 */
.annotation-masks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 6;
}

.annotation-mask {
  position: absolute;
  top: 0;
  height: 100%;
  border: 1px solid transparent;
  border-radius: 2px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.annotation-mask:hover {
  transform: scaleY(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.annotation-mask.selected {
  border: 2px solid;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  transform: scaleY(1.1);
}

.annotation-text {
  font-size: 12px;
  color: #1f2937;
  font-weight: 500;
  text-align: center;
  padding: 2px 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 3px;
  pointer-events: none;
}

.waveform-loading,
.waveform-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.9);
}

.waveform-loading p,
.waveform-error p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.waveform-heatmap {
  width: 100%;
}

.heatmap-bar {
  width: 100%;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

/* WaveSurfer.js 样式覆盖 */
:deep(.wavesurfer-audio) {
  width: 100%;
}

:deep(.wavesurfer-canvas) {
  width: 100%;
  height: 100%;
}

:deep(.wavesurfer-timeline) {
  height: 20px;
  border-top: 1px solid #dcdfe6;
  background: #fafafa;
}

:deep(.wavesurfer-region) {
  background: rgba(64, 158, 255, 0.2);
  border: 2px solid #409EFF;
  border-radius: 2px;
}

:deep(.wavesurfer-region:hover) {
  background: rgba(64, 158, 255, 0.3);
  cursor: move;
}
</style>