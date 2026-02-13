# 标注界面组件设计

标注界面是整个系统的核心页面，包含音频播放、波形显示、标注编辑、协作功能等。

## 页面结构

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header (导航栏)                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┬───────────────────────────────────────────────────┐ │
│  │  Sidebar    │  Main Content Area                              │ │
│  │  (左侧边栏)  │  ┌─────────────────────────────────────────────┐   │ │
│  │             │  │  WaveformView (波形显示)                  │   │ │
│  │ - 导航菜单  │  │  ┌─────────────────────────────────────┐   │   │ │
│  │ - 音频列表  │  │  │ PlaybackControls (播放控制)       │   │   │ │
│  │ - 标注统计  │  │  └─────────────────────────────────────┘   │   │ │
│  │ - 协作者    │  └─────────────────────────────────────────────┘   │ │
│  │             │  ┌─────────────────────────────────────────────┐   │ │
│  │             │  │  AnnotationWorkspace (标注工作区)       │   │   │ │
│  │             │  │  ┌───────────────┬─────────────────────┐   │   │ │
│  │             │  │  │  LayerManager  │  AnnotationList    │   │   │ │
│  │             │  │  │  (层管理)      │  (标注列表)         │   │   │ │
│  │             │  │  └───────────────┴─────────────────────┘   │   │ │
│  │             │  │  ┌─────────────────────────────────────┐   │   │ │
│  │             │  │  │       AnnotationPanel              │   │   │ │
│  │             │  │  │       (标注编辑面板)                │   │   │ │
│  │             │  │  └─────────────────────────────────────┘   │   │ │
│  │             │  └─────────────────────────────────────────────┘   │ │
│  │             │  ┌─────────────────────────────────────────────┐   │ │
│  │             │  │  CollaborationPanel (协作面板)          │   │   │ │
│  │             │  │  ┌───────────────┬─────────────────────┐   │   │ │
│  │             │  │  │  OnlineUsers   │  CommentPanel      │   │   │ │
│  │             │  │  │  (在线用户)    │  (评论面板)         │   │   │ │
│  │             │  │  └───────────────┴─────────────────────┘   │   │ │
│  │             │  └─────────────────────────────────────────────┘   │ │
│  │             │  ┌─────────────────────────────────────────────┐   │ │
│  │             │  │  AIProgressPanel (AI 进度面板)          │   │   │ │
│  │             │  └─────────────────────────────────────────────┘   │ │
│  └─────────────┴───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件详解

### 1. WaveformView 组件

**文件路径**: `src/components/audio/WaveformView.vue`

**功能**: 波形显示和交互，支持长音频的多级渲染。

#### Props

```typescript
interface WaveformViewProps {
  audioId: string;
  audioUrl: string;
  duration: number;
  currentTime?: number;
  zoomLevel?: 'overview' | 'detail' | 'zoom';
  showMarkers?: boolean;
  showAnnotations?: boolean;
  showSelection?: boolean;
  showCollaboratorCursors?: boolean;
}
```

#### Events

```typescript
interface WaveformViewEmits {
  (e: 'waveform-click', time: number): void;
  (e: 'waveform-drag', startTime: number, endTime: number): void;
  (e: 'waveform-select', selection: { start: number; end: number }): void;
  (e: 'zoom-change', level: 'overview' | 'detail' | 'zoom'): void;
  (e: 'timeupdate', time: number): void;
}
```

#### 内部状态

```typescript
interface WaveformViewState {
  zoomLevel: 'overview' | 'detail' | 'zoom';
  viewWindow: { start: number; end: number };
  selection: { start: number; end: number } | null;
  isDragging: boolean;
  isSelecting: boolean;
  mousePosition: { x: number; y: number; time: number } | null;
  tiles: Map<string, WaveformTile>;
  loadingTiles: Set<string>;
}
```

#### 子组件

- **WaveformCanvas**: 使用 Canvas 绘制波形
- **WaveformTileManager**: 管理波形瓦片加载
- **WaveformMarkers**: 显示标记（分段标记、书签等）
- **CollaboratorCursors**: 显示协作者光标
- **AnnotationOverlays**: 显示标注覆盖层

#### 长音频优化

```typescript
// 瓦片加载管理
class WaveformTileManager {
  private tiles = new Map<string, WaveformTile>();
  private tileWidth = 1000; // 每个瓦片 1000 像素
  private cache = new LRUCache<string, WaveformTile>({ max: 20, ttl: 3600000 });
  
  async loadVisibleTiles(
    zoomLevel: string,
    viewWindow: { start: number; end: number }
  ): Promise<void> {
    const config = WAVEFORM_ZOOM_LEVELS[zoomLevel];
    const startTile = Math.floor(viewWindow.start * config.pixelsPerSecond / this.tileWidth);
    const endTile = Math.ceil(viewWindow.end * config.pixelsPerSecond / this.tileWidth);
    
    const promises: Promise<WaveformTile>[] = [];
    for (let i = startTile; i <= endTile; i++) {
      const key = `${zoomLevel}-${i}`;
      if (!this.tiles.has(key) && !this.loadingTiles.has(key)) {
        this.loadingTiles.add(key);
        promises.push(this.loadTile(zoomLevel, i));
      }
    }
    
    if (promises.length > 0) {
      const results = await Promise.allSettled(promises);
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const tile = result.value;
          this.tiles.set(tile.key, tile);
          this.cache.set(tile.key, tile);
        }
      });
    }
    
    // 清理不可见的瓦片
    this.cleanupInvisibleTiles(startTile, endTile);
  }
  
  private cleanupInvisibleTiles(startTile: number, endTile: number): void {
    const visibleKeys = new Set<string>();
    for (let i = startTile; i <= endTile; i++) {
      visibleKeys.add(`overview-${i}`);
      visibleKeys.add(`detail-${i}`);
      visibleKeys.add(`zoom-${i}`);
    }
    
    this.tiles.forEach((_, key) => {
      if (!visibleKeys.has(key)) {
        this.tiles.delete(key);
      }
    });
  }
}
```

#### 缩放级别配置

```typescript
const WAVEFORM_ZOOM_LEVELS = {
  overview: {
    samplesPerPixel: 1000,
    segmentSize: 1000,
    pixelsPerSecond: 0.1, // 10像素/秒
    minTileCache: 10,
  },
  detail: {
    samplesPerPixel: 100,
    segmentSize: 500,
    pixelsPerSecond: 1, // 100像素/秒
    minTileCache: 20,
  },
  zoom: {
    samplesPerPixel: 10,
    segmentSize: 200,
    pixelsPerSecond: 10, // 1000像素/秒
    minTileCache: 30,
  },
};
```

---

### 2. AnnotationWorkspace 组件

**文件路径**: `src/components/annotation/AnnotationWorkspace.vue`

**功能**: 标注工作区，包含层管理、标注列表、标注面板。

#### Props

```typescript
interface AnnotationWorkspaceProps {
  audioId: string;
  currentTime?: number;
  readonly?: boolean;
}
```

#### Events

```typescript
interface AnnotationWorkspaceEmits {
  (e: 'annotation-create', annotation: Partial<Annotation>): void;
  (e: 'annotation-update', annotationId: string, changes: Partial<Annotation>): void;
  (e: 'annotation-delete', annotationId: string): void;
  (e: 'annotation-select', annotationId: string): void;
  (e: 'annotation-jump', annotationId: string): void;
  (e: 'layer-create', layer: Partial<AnnotationLayer>): void;
  (e: 'layer-update', layerId: string, changes: Partial<AnnotationLayer>): void;
  (e: 'layer-delete', layerId: string): void;
  (e: 'layer-select', layerId: string): void;
}
```

#### 布局策略

```vue
<template>
  <div class="annotation-workspace">
    <!-- 左侧：层管理和标注列表 -->
    <div class="workspace-sidebar">
      <LayerManager
        :layers="layers"
        :active-layer-id="activeLayerId"
        @layer-create="handleLayerCreate"
        @layer-update="handleLayerUpdate"
        @layer-delete="handleLayerDelete"
        @layer-select="handleLayerSelect"
      />
      
      <AnnotationList
        :annotations="filteredAnnotations"
        :current-time="currentTime"
        :show-layer="true"
        :show-speaker="true"
        :show-tags="true"
        @annotation-select="handleAnnotationSelect"
        @annotation-update="handleAnnotationUpdate"
        @annotation-delete="handleAnnotationDelete"
      />
    </div>
    
    <!-- 右侧：标注编辑面板 -->
    <div class="workspace-main">
      <AnnotationPanel
        v-if="activeAnnotation"
        :annotation="activeAnnotation"
        :speakers="speakers"
        :tags="tags"
        :layers="layers"
        :readonly="readonly"
        @annotation-update="handleAnnotationUpdate"
        @annotation-submit="handleAnnotationSubmit"
        @annotation-cancel="handleAnnotationCancel"
      />
      
      <div v-else class="empty-state">
        <Icon name="annotation" size="large" />
        <p>选择一个标注进行编辑</p>
      </div>
    </div>
  </div>
</template>
```

#### 标注过滤逻辑

```typescript
const filteredAnnotations = computed(() => {
  return annotations.value.filter(annotation => {
    // 只显示当前激活层的标注
    if (activeLayerId.value && annotation.layerId !== activeLayerId.value) {
      return false;
    }
    // 过滤已删除的标注
    if (annotation.deletedAt) {
      return false;
    }
    return true;
  }).sort((a, b) => a.startTime - b.startTime);
});
```

---

### 3. AnnotationPanel 组件

**文件路径**: `src/components/annotation/AnnotationPanel.vue`

**功能**: 标注编辑面板，显示当前选中的标注详情。

#### Props

```typescript
interface AnnotationPanelProps {
  annotation: Annotation | null;
  speakers: Speaker[];
  tags: Tag[];
  layers: AnnotationLayer[];
  readonly?: boolean;
}
```

#### Events

```typescript
interface AnnotationPanelEmits {
  (e: 'annotation-update', annotationId: string, changes: Partial<Annotation>): void;
  (e: 'annotation-submit', annotationId: string): void;
  (e: 'annotation-cancel'): void;
}
```

#### 表单结构

```vue
<template>
  <div class="annotation-panel">
    <!-- 时间范围 -->
    <div class="panel-section">
      <h3>时间范围</h3>
      <div class="time-range">
        <Input
          v-model.number="formData.startTime"
          type="number"
          label="开始时间 (秒)"
          :step="0.001"
          :disabled="readonly"
        />
        <Input
          v-model.number="formData.endTime"
          type="number"
          label="结束时间 (秒)"
          :step="0.001"
          :disabled="readonly"
        />
      </div>
    </div>
    
    <!-- 转写文本 -->
    <div class="panel-section">
      <h3>转写文本</h3>
      <Textarea
        v-model="formData.text"
        placeholder="输入转写文本..."
        :readonly="readonly"
        :maxlength="1000"
        :show-count="true"
      />
      <div class="text-tools">
        <Button size="small" @click="insertTimestamp" :disabled="readonly">
          <Icon name="clock" />
          插入时间戳
        </Button>
        <Button size="small" @click="markSpeaker" :disabled="readonly">
          <Icon name="user" />
          标记说话人
        </Button>
      </div>
    </div>
    
    <!-- 说话人 -->
    <div class="panel-section">
      <h3>说话人</h3>
      <Select
        v-model="formData.speakerId"
        :options="speakerOptions"
        placeholder="选择说话人"
        :clearable="true"
        :disabled="readonly"
      />
      <Button size="small" @click="createSpeaker" :disabled="readonly">
        <Icon name="plus" />
        新建说话人
      </Button>
    </div>
    
    <!-- 标签 -->
    <div class="panel-section">
      <h3>标签</h3>
      <TagSelector
        v-model="formData.tags"
        :available-tags="tags"
        :disabled="readonly"
      />
    </div>
    
    <!-- 备注 -->
    <div class="panel-section">
      <h3>备注</h3>
      <Textarea
        v-model="formData.note"
        placeholder="添加备注..."
        :readonly="readonly"
        :maxlength="500"
      />
    </div>
    
    <!-- 操作按钮 -->
    <div class="panel-actions">
      <Button type="primary" @click="handleSubmit" :disabled="readonly || !hasChanges">
        保存
      </Button>
      <Button @click="handleCancel" :disabled="readonly">
        取消
      </Button>
      <Button type="danger" @click="handleDelete" :disabled="readonly">
        删除
      </Button>
    </div>
  </div>
</template>
```

#### 表单验证

```typescript
const validationRules = {
  startTime: [
    { required: true, message: '请输入开始时间' },
    { type: 'number', min: 0, message: '开始时间必须大于等于0' },
  ],
  endTime: [
    { required: true, message: '请输入结束时间' },
    { type: 'number', min: 0, message: '结束时间必须大于等于0' },
    {
      validator: (rule, value, callback) => {
        if (value <= formData.value.startTime) {
          callback(new Error('结束时间必须大于开始时间'));
        } else {
          callback();
        }
      },
    },
  ],
  text: [
    { required: true, message: '请输入转写文本' },
    { max: 1000, message: '转写文本不能超过1000字符' },
  ],
};
```

---

### 4. LayerManager 组件

**文件路径**: `src/components/annotation/LayerManager.vue`

**功能**: 标注层管理，创建、编辑、删除、排序层。

#### Props

```typescript
interface LayerManagerProps {
  layers: AnnotationLayer[];
  activeLayerId?: string;
  readonly?: boolean;
}
```

#### Events

```typescript
interface LayerManagerEmits {
  (e: 'layer-create', layer: Partial<AnnotationLayer>): void;
  (e: 'layer-update', layerId: string, changes: Partial<AnnotationLayer>): void;
  (e: 'layer-delete', layerId: string): void;
  (e: 'layer-select', layerId: string): void;
  (e: 'layer-reorder', fromIndex: number, toIndex: number): void;
}
```

#### 层类型配置

```typescript
const LAYER_TYPES = [
  { value: 'transcript', label: '转写层', icon: 'file-text', color: '#3B82F6' },
  { value: 'speaker', label: '说话人层', icon: 'user', color: '#10B981' },
  { value: 'emotion', label: '情感层', icon: 'heart', color: '#F97316' },
  { value: 'event', label: '事件层', icon: 'calendar', color: '#8B5CF6' },
  { value: 'noise', label: '噪音层', icon: 'volume-x', color: '#6B7280' },
];
```

#### 拖拽排序

```vue
<template>
  <div class="layer-manager">
    <div class="layer-header">
      <h3>标注层</h3>
      <Button size="small" @click="handleCreate" :disabled="readonly">
        <Icon name="plus" />
        新建层
      </Button>
    </div>
    
    <VueDraggable
      v-model="sortedLayers"
      :disabled="readonly"
      item-key="id"
      @end="handleReorder"
    >
      <template #item="{ element: layer }">
        <div
          class="layer-item"
          :class="{ active: layer.id === activeLayerId, hidden: !layer.isVisible }"
          @click="handleSelect(layer.id)"
        >
          <div class="layer-info">
            <Icon :name="getLayerIcon(layer.type)" :style="{ color: layer.color }" />
            <span class="layer-name">{{ layer.name }}</span>
            <span class="layer-count">{{ getLayerAnnotationCount(layer.id) }}</span>
          </div>
          
          <div class="layer-actions">
            <Button
              size="small"
              type="ghost"
              @click.stop="toggleVisibility(layer.id)"
              :disabled="readonly"
            >
              <Icon :name="layer.isVisible ? 'eye' : 'eye-off'" />
            </Button>
            <Button
              size="small"
              type="ghost"
              @click.stop="handleEdit(layer.id)"
              :disabled="readonly"
            >
              <Icon name="edit" />
            </Button>
            <Button
              size="small"
              type="ghost"
              @click.stop="handleDelete(layer.id)"
              :disabled="readonly"
            >
              <Icon name="trash" />
            </Button>
          </div>
        </div>
      </template>
    </VueDraggable>
  </div>
</template>
```

---

### 5. CollaborationPanel 组件

**文件路径**: `src/components/collaboration/CollaborationPanel.vue`

**功能**: 协作面板，显示在线用户和评论。

#### Props

```typescript
interface CollaborationPanelProps {
  audioId: string;
  onlineUsers: User[];
  currentUserId: string;
  comments: Comment[];
  currentTime?: number;
  showPanel?: boolean;
}
```

#### Events

```typescript
interface CollaborationPanelEmits {
  (e: 'comment-create', comment: Partial<Comment>): void;
  (e: 'comment-update', commentId: string, changes: Partial<Comment>): void;
  (e: 'comment-delete', commentId: string): void;
  (e: 'close'): void;
}
```

#### 在线用户列表

```vue
<template>
  <div class="collaboration-panel">
    <!-- 标签页切换 -->
    <Tabs v-model="activeTab">
      <TabPane key="users" tab="在线用户">
        <div class="online-users">
          <div
            v-for="user in onlineUsers"
            :key="user.id"
            class="user-item"
            :class="{ is-me: user.id === currentUserId }"
          >
            <Avatar :src="user.avatar" :name="user.name" :color="user.color" />
            <span class="user-name">{{ user.name }}</span>
            <span class="user-status">{{ user.status }}</span>
          </div>
        </div>
      </TabPane>
      
      <TabPane key="comments" tab="评论">
        <CommentPanel
          :audio-id="audioId"
          :comments="comments"
          :current-time="currentTime"
          @comment-create="handleCommentCreate"
          @comment-update="handleCommentUpdate"
          @comment-delete="handleCommentDelete"
        />
      </TabPane>
    </Tabs>
  </div>
</template>
```

---

### 6. AIProgressPanel 组件

**文件路径**: `src/components/ai/AIProgressPanel.vue`

**功能**: AI 处理进度面板，显示多阶段进度和实时结果。

#### Props

```typescript
interface AIProgressPanelProps {
  jobId: string;
  audioId: string;
  jobType: 'asr' | 'speaker_diarization' | 'segmentation' | 'noise_detection';
  progress: AIProgress | null;
  results: AISegmentResult[];
  showPanel?: boolean;
}
```

#### Events

```typescript
interface AIProgressPanelEmits {
  (e: 'cancel'): void;
  (e: 'result-click', segmentIndex: number): void;
  (e: 'close'): void;
}
```

#### 进度显示

```vue
<template>
  <div class="ai-progress-panel">
    <!-- 头部 -->
    <div class="panel-header">
      <h3>AI 处理</h3>
      <Button size="small" type="ghost" @click="handleClose">
        <Icon name="x" />
      </Button>
    </div>
    
    <!-- 进度信息 -->
    <div v-if="progress" class="progress-info">
      <div class="overall-progress">
        <span class="progress-label">总体进度</span>
        <Progress :percent="progress.overallProgress" />
        <span class="progress-text">{{ progress.overallProgress }}%</span>
      </div>
      
      <div class="stage-info">
        <span class="stage-label">{{ getStageLabel(progress.stage) }}</span>
        <span class="stage-text">{{ progress.currentOperation }}</span>
        <span v-if="progress.estimatedTimeRemaining" class="time-remaining">
          预计剩余: {{ formatTime(progress.estimatedTimeRemaining) }}
        </span>
      </div>
      
      <div class="segment-progress">
        <span>分段: {{ progress.currentSegment }} / {{ progress.totalSegments }}</span>
      </div>
    </div>
    
    <!-- 结果预览 -->
    <div v-if="results.length > 0" class="results-preview">
      <h4>已完成分段</h4>
      <AISegmentPreview
        :segments="results"
        :show-confidence="true"
        :show-speaker="true"
        @segment-click="handleResultClick"
      />
    </div>
    
    <!-- 操作按钮 -->
    <div class="panel-actions">
      <Button type="danger" @click="handleCancel">
        <Icon name="x" />
        取消处理
      </Button>
    </div>
  </div>
</template>
```

---

## 状态管理集成

### useAnnotationWorkspace Composable

**文件路径**: `src/composables/useAnnotationWorkspace.ts`

```typescript
export function useAnnotationWorkspace(audioId: string) {
  const annotationStore = useAnnotationStore();
  const audioStore = useAudioStore();
  
  const annotations = computed(() => annotationStore.annotations);
  const layers = computed(() => annotationStore.layers);
  const speakers = computed(() => annotationStore.speakers);
  const tags = computed(() => annotationStore.tags);
  const activeAnnotationId = computed(() => annotationStore.activeAnnotationId);
  const activeLayerId = computed(() => annotationStore.activeLayerId);
  const currentTime = computed(() => audioStore.currentTime);
  
  const activeAnnotation = computed(() => 
    annotations.value.find(a => a.id === activeAnnotationId.value)
  );
  
  const filteredAnnotations = computed(() => {
    return annotations.value.filter(annotation => {
      if (activeLayerId.value && annotation.layerId !== activeLayerId.value) {
        return false;
      }
      return true;
    }).sort((a, b) => a.startTime - b.startTime);
  });
  
  // 加载数据
  const loadData = async () => {
    await Promise.all([
      annotationStore.loadAnnotations(audioId),
      annotationStore.loadLayers(audioId),
      annotationStore.loadSpeakers(),
      annotationStore.loadTags(),
    ]);
  };
  
  // 创建标注
  const createAnnotation = async (selection: { start: number; end: number }) => {
    const annotation = await annotationStore.createAnnotation({
      audioId,
      layerId: activeLayerId.value,
      startTime: selection.start,
      endTime: selection.end,
      text: '',
      isManual: true,
    });
    
    annotationStore.selectAnnotation(annotation.id);
    return annotation;
  };
  
  // 更新标注
  const updateAnnotation = async (annotationId: string, changes: Partial<Annotation>) => {
    await annotationStore.updateAnnotation(annotationId, changes);
  };
  
  // 删除标注
  const deleteAnnotation = async (annotationId: string) => {
    await annotationStore.deleteAnnotation(annotationId);
    if (activeAnnotationId.value === annotationId) {
      annotationStore.selectAnnotation(null);
    }
  };
  
  // 跳转到标注
  const jumpToAnnotation = (annotationId: string) => {
    const annotation = annotations.value.find(a => a.id === annotationId);
    if (annotation) {
      audioStore.seek(annotation.startTime);
      annotationStore.selectAnnotation(annotationId);
    }
  };
  
  return {
    annotations,
    layers,
    speakers,
    tags,
    activeAnnotationId,
    activeLayerId,
    activeAnnotation,
    filteredAnnotations,
    currentTime,
    loadData,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    jumpToAnnotation,
  };
}
```

---

## 性能优化

### 1. 虚拟滚动

标注列表使用虚拟滚动优化长列表性能：

```vue
<template>
  <RecycleScroller
    :items="filteredAnnotations"
    :item-size="60"
    key-field="id"
    v-slot="{ item: annotation }"
  >
    <AnnotationItem
      :annotation="annotation"
      :current-time="currentTime"
      @select="handleSelect"
      @update="handleUpdate"
      @delete="handleDelete"
    />
  </RecycleScroller>
</template>
```

### 2. 防抖和节流

高频操作使用防抖和节流优化：

```typescript
import { debounce, throttle } from 'lodash-es';

// 波形缩放防抖
const handleZoom = debounce((direction: 'in' | 'out' | 'reset') => {
  // 缩放逻辑
}, 100);

// 播放位置更新节流
const handleTimeUpdate = throttle((time: number) => {
  currentTime.value = time;
}, 100);
```

### 3. LRU 缓存

波形数据使用 LRU 缓存：

```typescript
import LRU from 'lru-cache';

const waveformCache = new LRU<string, WaveformData>({
  max: 20,
  ttl: 3600000, // 1小时
  updateAgeOnGet: true,
});
```

---

## 总结

标注界面是系统的核心页面，包含以下关键组件：

1. **WaveformView**: 波形显示和交互
2. **AnnotationWorkspace**: 标注工作区
3. **AnnotationPanel**: 标注编辑面板
4. **LayerManager**: 层管理
5. **CollaborationPanel**: 协作面板
6. **AIProgressPanel**: AI 进度面板

所有组件都遵循 Props 向下、Events 向上的原则，使用 TypeScript 定义类型，支持长音频场景的性能优化。