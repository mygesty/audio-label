# 组件设计文档

本文档提供详细的组件设计方案，供前端开发使用。

## 目录

1. [组件设计原则](#组件设计原则)
2. [通用组件](#通用组件)
3. [布局组件](#布局组件)
4. [音频相关组件](#音频相关组件)
5. [标注相关组件](#标注相关组件)
6. [协作相关组件](#协作相关组件)
7. [AI相关组件](#AI相关组件)
8. [状态管理](#状态管理)
9. [API服务](#API服务)

---

## 组件设计原则

### 1. 单一职责
每个组件只负责一个明确的功能，避免组件过于庞大。

### 2. Props 向下，Events 向上
- Props：父组件向子组件传递数据
- Events：子组件向父组件传递事件

### 3. 可复用性
通用组件应该高度可配置，支持多种使用场景。

### 4. 类型安全
所有组件都必须使用 TypeScript 定义 Props 和 Events。

### 5. 响应式设计
所有组件都应该支持响应式布局，适配不同屏幕尺寸。

---

## 通用组件

### Button 组件

**文件路径**: `src/components/common/Button.vue`

**Props 定义**:
```typescript
interface ButtonProps {
  type?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  block?: boolean;
  htmlType?: 'button' | 'submit' | 'reset';
}
```

**Events 定义**:
```typescript
interface ButtonEmits {
  (e: 'click', event: MouseEvent): void;
}
```

**使用示例**:
```vue
<Button type="primary" size="medium" @click="handleClick">
  <template #icon><Icon name="plus" /></template>
  新建标注
</Button>
```

---

### Input 组件

**文件路径**: `src/components/common/Input.vue`

**Props 定义**:
```typescript
interface InputProps {
  modelValue?: string | number;
  type?: 'text' | 'password' | 'email' | 'number' | 'textarea';
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  maxlength?: number;
  showCount?: boolean;
}
```

**Events 定义**:
```typescript
interface InputEmits {
  (e: 'update:modelValue', value: string | number): void;
  (e: 'blur', event: FocusEvent): void;
  (e: 'focus', event: FocusEvent): void;
  (e: 'enter', event: KeyboardEvent): void;
}
```

---

### Modal 组件

**文件路径**: `src/components/common/Modal.vue`

**Props 定义**:
```typescript
interface ModalProps {
  visible: boolean;
  title?: string;
  width?: string | number;
  closable?: boolean;
  maskClosable?: boolean;
  footer?: boolean | VNode;
  centered?: boolean;
  destroyOnClose?: boolean;
}
```

**Events 定义**:
```typescript
interface ModalEmits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'ok'): void;
  (e: 'cancel'): void;
  (e: 'afterClose'): void;
}
```

**Slots**:
```typescript
interface ModalSlots {
  header?: VNode;
  footer?: VNode;
  default?: VNode;
}
```

---

## 布局组件

### MainLayout 组件

**文件路径**: `src/layouts/MainLayout.vue`

**功能**: 主页面布局，包含顶部导航、侧边栏和内容区域。

**布局结构**:
```
┌─────────────────────────────────────────────────┐
│  Header (Logo, 导航菜单, 用户信息)               │
├──────────┬──────────────────────────────────────┤
│          │                                       │
│ Sidebar  │         Content Area                 │
│ (导航)   │        (子路由内容)                  │
│          │                                       │
└──────────┴──────────────────────────────────────┘
```

**Props 定义**:
```typescript
interface MainLayoutProps {
  collapsed?: boolean;
  theme?: 'light' | 'dark';
}
```

**Events 定义**:
```typescript
interface MainLayoutEmits {
  (e: 'update:collapsed', collapsed: boolean): void;
}
```

**Slots**:
```typescript
interface MainLayoutSlots {
  header?: VNode;
  sidebar?: VNode;
  default?: VNode;
}
```

---

### AuthLayout 组件

**文件路径**: `src/layouts/AuthLayout.vue`

**功能**: 认证页面布局（登录、注册、忘记密码）。

**布局结构**:
```
┌─────────────────────────────────────────────────┐
│                                                 │
│              Logo / 品牌标识                      │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │           登录表单内容                     │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Props 定义**:
```typescript
interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  logo?: string;
}
```

**Slots**:
```typescript
interface AuthLayoutSlots {
  default?: VNode;
  footer?: VNode;
}
```

---

## 音频相关组件

### AudioPlayer 组件

**文件路径**: `src/components/audio/AudioPlayer.vue`

**功能**: 音频播放器，包含波形显示、播放控制、时间显示。

**Props 定义**:
```typescript
interface AudioPlayerProps {
  audioId: string;
  audioUrl: string;
  duration: number;
  autoplay?: boolean;
  loop?: boolean;
  showWaveform?: boolean;
  showControls?: boolean;
}
```

**Events 定义**:
```typescript
interface AudioPlayerEmits {
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'stop'): void;
  (e: 'seek', time: number): void;
  (e: 'timeupdate', currentTime: number): void;
  (e: 'ended'): void;
  (e: 'error', error: Error): void;
}
```

**内部状态**:
```typescript
interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  loopStart: number | null;
  loopEnd: number | null;
}
```

**子组件**:
- `WaveformView` - 波形显示
- `PlaybackControls` - 播放控制
- `TimeDisplay` - 时间显示

---

### WaveformView 组件

**文件路径**: `src/components/audio/WaveformView.vue`

**功能**: 波形显示和交互，支持缩放、平移、拖拽选择。

**Props 定义**:
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
}
```

**Events 定义**:
```typescript
interface WaveformViewEmits {
  (e: 'waveform-click', time: number): void;
  (e: 'waveform-drag', startTime: number, endTime: number): void;
  (e: 'waveform-select', selection: { start: number; end: number }): void;
  (e: 'zoom-change', level: 'overview' | 'detail' | 'zoom'): void;
}
```

**内部状态**:
```typescript
interface WaveformViewState {
  zoomLevel: 'overview' | 'detail' | 'zoom';
  viewWindow: { start: number; end: number };
  selection: { start: number; end: number } | null;
  isDragging: boolean;
}
```

**关键方法**:
```typescript
class WaveformView {
  // 加载波形数据
  async loadWaveformData(zoomLevel: string, viewWindow: { start: number; end: number }): Promise<WaveformData>;
  
  // 渲染波形
  renderWaveform(canvas: HTMLCanvasElement, data: WaveformData): void;
  
  // 处理缩放
  handleZoom(direction: 'in' | 'out' | 'reset'): void;
  
  // 处理平移
  handlePan(deltaX: number): void;
  
  // 处理选择
  handleSelection(start: number, end: number): void;
}
```

---

### WaveformCanvas 组件

**文件路径**: `src/components/audio/WaveformCanvas.vue`

**功能**: 使用 Canvas 绘制波形，优化长音频渲染性能。

**Props 定义**:
```typescript
interface WaveformCanvasProps {
  waveformData: WaveformData;
  zoomLevel: 'overview' | 'detail' | 'zoom';
  viewWindow: { start: number; end: number };
  currentTime?: number;
  selection?: { start: number; end: number } | null;
  markers?: WaveformMarker[];
  height?: number;
}
```

**Events 定义**:
```typescript
interface WaveformCanvasEmits {
  (e: 'click', time: number): void;
  (e: 'drag', startTime: number, endTime: number): void;
  (e: 'hover', time: number): void;
}
```

**Canvas 渲染逻辑**:
```typescript
class WaveformCanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  
  // 清除画布
  clear(): void;
  
  // 绘制背景
  drawBackground(): void;
  
  // 绘制波形
  drawWaveform(data: number[]): void;
  
  // 绘制选择区域
  drawSelection(selection: { start: number; end: number }): void;
  
  // 绘制标记
  drawMarkers(markers: WaveformMarker[]): void;
  
  // 绘制当前时间线
  drawCurrentTime(currentTime: number): void;
  
  // 优化渲染（只绘制可见区域）
  renderVisibleArea(viewWindow: { start: number; end: number }): void;
}
```

---

### PlaybackControls 组件

**文件路径**: `src/components/audio/PlaybackControls.vue`

**功能**: 播放控制按钮和滑块。

**Props 定义**:
```typescript
interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  loop: boolean;
  showSpeedControl?: boolean;
  showVolumeControl?: boolean;
}
```

**Events 定义**:
```typescript
interface PlaybackControlsEmits {
  (e: 'play'): void;
  (e: 'pause'): void;
  (e: 'stop'): void;
  (e: 'seek', time: number): void;
  (e: 'speed-change', rate: number): void;
  (e: 'volume-change', volume: number): void;
  (e: 'mute-change', isMuted: boolean): void;
  (e: 'loop-change', loop: boolean): void;
  (e: 'prev-segment'): void;
  (e: 'next-segment'): void;
}
```

**快捷键映射**:
```typescript
const SHORTCUTS = {
  ' ': 'toggle-play',
  'Escape': 'stop',
  'ArrowLeft': 'seek-backward',
  'ArrowRight': 'seek-forward',
  'Shift+ArrowLeft': 'prev-segment',
  'Shift+ArrowRight': 'next-segment',
  'Home': 'seek-start',
  'End': 'seek-end',
};
```

---

## 标注相关组件

### AnnotationEditor 组件

**文件路径**: `src/components/annotation/AnnotationEditor.vue`

**功能**: 标注编辑器，包含标注列表、标注面板、层管理。

**Props 定义**:
```typescript
interface AnnotationEditorProps {
  audioId: string;
  annotations: Annotation[];
  layers: AnnotationLayer[];
  speakers: Speaker[];
  tags: Tag[];
  readonly?: boolean;
}
```

**Events 定义**:
```typescript
interface AnnotationEditorEmits {
  (e: 'annotation-create', annotation: Partial<Annotation>): void;
  (e: 'annotation-update', annotationId: string, changes: Partial<Annotation>): void;
  (e: 'annotation-delete', annotationId: string): void;
  (e: 'annotation-select', annotationId: string): void;
  (e: 'layer-create', layer: Partial<AnnotationLayer>): void;
  (e: 'layer-update', layerId: string, changes: Partial<AnnotationLayer>): void;
  (e: 'layer-delete', layerId: string): void;
}
```

**子组件**:
- `LayerManager` - 层管理
- `AnnotationList` - 标注列表
- `AnnotationPanel` - 标注编辑面板

---

### AnnotationList 组件

**文件路径**: `src/components/annotation/AnnotationList.vue`

**功能**: 标注列表，显示所有标注。

**Props 定义**:
```typescript
interface AnnotationListProps {
  annotations: Annotation[];
  currentTime?: number;
  showLayer?: boolean;
  showSpeaker?: boolean;
  showTags?: boolean;
  sortable?: boolean;
  filter?: AnnotationFilter;
}
```

**Events 定义**:
```typescript
interface AnnotationListEmits {
  (e: 'annotation-select', annotationId: string): void;
  (e: 'annotation-update', annotationId: string, changes: Partial<Annotation>): void;
  (e: 'annotation-delete', annotationId: string): void;
  (e: 'annotation-sort', sortBy: string, order: 'asc' | 'desc'): void;
}
```

**虚拟滚动**:
```typescript
// 使用 vue-virtual-scroller 优化长列表性能
import { RecycleScroller } from 'vue-virtual-scroller';
```

---

### AnnotationPanel 组件

**文件路径**: `src/components/annotation/AnnotationPanel.vue`

**功能**: 标注编辑面板，显示当前选中的标注详情。

**Props 定义**:
```typescript
interface AnnotationPanelProps {
  annotation: Annotation | null;
  speakers: Speaker[];
  tags: Tag[];
  layers: AnnotationLayer[];
  readonly?: boolean;
}
```

**Events 定义**:
```typescript
interface AnnotationPanelEmits {
  (e: 'annotation-update', annotationId: string, changes: Partial<Annotation>): void;
  (e: 'annotation-submit', annotationId: string): void;
  (e: 'annotation-cancel'): void;
}
```

**表单字段**:
```typescript
interface AnnotationFormData {
  startTime: number;
  endTime: number;
  text: string;
  speakerId?: string;
  layerId: string;
  tags: string[];
  note: string;
}
```

---

### LayerManager 组件

**文件路径**: `src/components/annotation/LayerManager.vue`

**功能**: 标注层管理，创建、编辑、删除、排序层。

**Props 定义**:
```typescript
interface LayerManagerProps {
  layers: AnnotationLayer[];
  activeLayerId?: string;
  readonly?: boolean;
}
```

**Events 定义**:
```typescript
interface LayerManagerEmits {
  (e: 'layer-create', layer: Partial<AnnotationLayer>): void;
  (e: 'layer-update', layerId: string, changes: Partial<AnnotationLayer>): void;
  (e: 'layer-delete', layerId: string): void;
  (e: 'layer-select', layerId: string): void;
  (e: 'layer-reorder', fromIndex: number, toIndex: number): void;
}
```

---

### AnnotationTimeline 组件

**文件路径**: `src/components/annotation/AnnotationTimeline.vue`

**功能**: 标注时间轴，可视化显示标注分布。

**Props 定义**:
```typescript
interface AnnotationTimelineProps {
  annotations: Annotation[];
  layers: AnnotationLayer[];
  currentTime?: number;
  showOnlyActiveLayer?: boolean;
  showSpeakers?: boolean;
}
```

**Events 定义**:
```typescript
interface AnnotationTimelineEmits {
  (e: 'annotation-click', annotationId: string): void;
  (e: 'timeline-click', time: number): void;
  (e: 'timeline-select', startTime: number, endTime: number): void;
}
```

---

## 协作相关组件

### CollaboratorCursor 组件

**文件路径**: `src/components/collaboration/CollaboratorCursor.vue`

**功能**: 显示协作者的光标和名称。

**Props 定义**:
```typescript
interface CollaboratorCursorProps {
  userId: string;
  userName: string;
  userAvatar?: string;
  color: string;
  position: { x: number; y: number; time: number };
  showName?: boolean;
}
```

**Events 定义**:
```typescript
interface CollaboratorCursorEmits {
  // 无 Events
}
```

**动画效果**:
```css
.cursor {
  transition: all 0.1s ease-out;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

---

### CommentPanel 组件

**文件路径**: `src/components/collaboration/CommentPanel.vue`

**功能**: 评论面板，显示、添加、回复评论。

**Props 定义**:
```typescript
interface CommentPanelProps {
  audioId: string;
  annotations: Annotation[];
  comments: Comment[];
  currentTime?: number;
  showPanel?: boolean;
}
```

**Events 定义**:
```typescript
interface CommentPanelEmits {
  (e: 'comment-create', comment: Partial<Comment>): void;
  (e: 'comment-update', commentId: string, changes: Partial<Comment>): void;
  (e: 'comment-delete', commentId: string): void;
  (e: 'comment-reply', commentId: string, reply: Partial<Comment>): void;
  (e: 'close'): void;
}
```

**评论数据结构**:
```typescript
interface Comment {
  id: string;
  annotationId?: string;
  audioId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  startTime?: number;
  parentId?: string;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}
```

---

### OnlineUsers 组件

**文件路径**: `src/components/collaboration/OnlineUsers.vue`

**功能**: 显示在线协作者列表。

**Props 定义**:
```typescript
interface OnlineUsersProps {
  users: User[];
  currentUserId: string;
  showStatus?: boolean;
}
```

**Events 定义**:
```typescript
interface OnlineUsersEmits {
  (e: 'user-click', userId: string): void;
}
```

---

## AI相关组件

### AIProgressPanel 组件

**文件路径**: `src/components/ai/AIProgressPanel.vue`

**功能**: AI 处理进度面板，显示多阶段进度和实时结果。

**Props 定义**:
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

**Events 定义**:
```typescript
interface AIProgressPanelEmits {
  (e: 'cancel'): void;
  (e: 'result-click', segmentIndex: number): void;
  (e: 'close'): void;
}
```

**进度数据结构**:
```typescript
interface AIProgress {
  stage: 'downloading' | 'segmentation' | 'asr' | 'diarization' | 'postprocessing';
  currentSegment: number;
  totalSegments: number;
  stageProgress: number; // 0-100
  overallProgress: number; // 0-100
  estimatedTimeRemaining: number;
  currentOperation: string;
}
```

---

### AISegmentPreview 组件

**文件路径**: `src/components/ai/AISegmentPreview.vue`

**功能**: AI 处理结果预览，显示分段转写结果。

**Props 定义**:
```typescript
interface AISegmentPreviewProps {
  segments: AISegmentResult[];
  currentTime?: number;
  showConfidence?: boolean;
  showSpeaker?: boolean;
}
```

**Events 定义**:
```typescript
interface AISegmentPreviewEmits {
  (e: 'segment-click', segmentIndex: number): void;
  (e: 'segment-update', segmentIndex: number, changes: Partial<AISegmentResult>): void;
}
```

---

### AIModelSelector 组件

**文件路径**: `src/components/ai/AIModelSelector.vue`

**功能**: AI 模型选择器。

**Props 定义**:
```typescript
interface AIModelSelectorProps {
  models: AIModel[];
  selectedModelId?: string;
  disabled?: boolean;
}
```

**Events 定义**:
```typescript
interface AIModelSelectorEmits {
  (e: 'model-change', modelId: string): void;
}
```

**模型数据结构**:
```typescript
interface AIModel {
  id: string;
  name: string;
  type: 'whisper_tiny' | 'whisper_base' | 'whisper_small' | 'whisper_medium' | 'whisper_large';
  size: number; // MB
  accuracy: 'low' | 'medium' | 'high' | 'very_high';
  speed: 'very_fast' | 'fast' | 'medium' | 'slow' | 'very_slow';
  languages: string[];
  isDefault?: boolean;
  status: 'available' | 'testing' | 'deprecated';
}
```

---

## 状态管理

### audio.ts Store

**文件路径**: `src/stores/audio.ts`

**State 定义**:
```typescript
interface AudioState {
  currentAudio: Audio | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  volume: number;
  isMuted: boolean;
  loop: boolean;
  loopStart: number | null;
  loopEnd: number | null;
}
```

**Actions**:
```typescript
interface AudioActions {
  loadAudio(audioId: string): Promise<void>;
  play(): void;
  pause(): void;
  stop(): void;
  seek(time: number): void;
  setPlaybackRate(rate: number): void;
  setVolume(volume: number): void;
  setMuted(isMuted: boolean): void;
  toggleLoop(): void;
  setLoopRange(start: number, end: number): void;
}
```

---

### annotation.ts Store

**文件路径**: `src/stores/annotation.ts`

**State 定义**:
```typescript
interface AnnotationState {
  annotations: Annotation[];
  layers: AnnotationLayer[];
  activeAnnotationId: string | null;
  activeLayerId: string | null;
  filter: AnnotationFilter;
}
```

**Actions**:
```typescript
interface AnnotationActions {
  loadAnnotations(audioId: string): Promise<void>;
  loadLayers(audioId: string): Promise<void>;
  createAnnotation(annotation: Partial<Annotation>): Promise<Annotation>;
  updateAnnotation(id: string, changes: Partial<Annotation>): Promise<void>;
  deleteAnnotation(id: string): Promise<void>;
  selectAnnotation(id: string | null): void;
  setActiveLayer(id: string): void;
  setFilter(filter: AnnotationFilter): void;
}
```

---

### collaboration.ts Store

**文件路径**: `src/stores/collaboration.ts`

**State 定义**:
```typescript
interface CollaborationState {
  connected: boolean;
  users: User[];
  cursors: Record<string, Cursor>;
  locks: Record<string, Lock>;
  comments: Comment[];
}
```

**Actions**:
```typescript
interface CollaborationActions {
  connect(): void;
  disconnect(): void;
  joinAudioRoom(audioId: string): void;
  leaveAudioRoom(audioId: string): void;
  sendCursor(position: { time: number }): void;
  acquireLock(annotationId: string): Promise<void>;
  releaseLock(annotationId: string): void;
  sendComment(comment: Partial<Comment>): Promise<Comment>;
}
```

---

## API服务

### audio.service.ts

**文件路径**: `src/services/audio.service.ts`

**方法**:
```typescript
class AudioService {
  // 获取音频列表
  getAudioList(params: AudioListParams): Promise<OffsetPaginationResponse<Audio>>;
  
  // 上传音频
  uploadAudio(file: File): Promise<StandardResponse<Audio>>;
  
  // 获取音频详情
  getAudioDetail(audioId: string): Promise<StandardResponse<Audio>>;
  
  // 删除音频
  deleteAudio(audioId: string): Promise<StandardResponse<void>>;
  
  // 获取波形数据
  getWaveformData(audioId: string, params: WaveformDataParams): Promise<StandardResponse<WaveformData>>;
  
  // 触发 AI 处理
  triggerAIProcess(audioId: string, config: AIProcessConfig): Promise<StandardResponse<AIJob>>;
  
  // 获取 AI 处理状态
  getAIStatus(audioId: string): Promise<StandardResponse<AIJob>>;
}
```

---

### annotation.service.ts

**文件路径**: `src/services/annotation.service.ts`

**方法**:
```typescript
class AnnotationService {
  // 获取标注列表（基础）
  getAnnotationList(audioId: string, params: AnnotationListParams): Promise<OffsetPaginationResponse<Annotation>>;
  
  // 按时间范围获取标注（长音频优化）
  getAnnotationsByTimeRange(audioId: string, params: TimeRangeParams): Promise<CursorPaginationResponse<Annotation>>;
  
  // 创建标注
  createAnnotation(annotation: Partial<Annotation>): Promise<StandardResponse<Annotation>>;
  
  // 更新标注
  updateAnnotation(id: string, changes: Partial<Annotation>): Promise<StandardResponse<Annotation>>;
  
  // 删除标注
  deleteAnnotation(id: string): Promise<StandardResponse<void>>;
  
  // 批量操作
  batchOperation(operations: BatchOperation[]): Promise<StandardResponse<BatchOperationResponse>>;
  
  // 获取版本历史
  getVersions(annotationId: string): Promise<StandardResponse<AnnotationVersion[]>>;
  
  // 提交审核
  submitForReview(annotationId: string): Promise<StandardResponse<void>>;
}
```

---

### segment.service.ts

**文件路径**: `src/services/segment.service.ts`

**方法**:
```typescript
class SegmentService {
  // 获取分段列表
  getSegments(audioId: string): Promise<StandardResponse<AudioSegment[]>>;
  
  // 获取分段详情
  getSegmentDetail(segmentId: string): Promise<StandardResponse<AudioSegment>>;
  
  // 创建分段
  createSegment(segment: Partial<AudioSegment>): Promise<StandardResponse<AudioSegment>>;
  
  // 合并分段
  mergeSegments(segmentIds: string[]): Promise<StandardResponse<AudioSegment>>;
  
  // 拆分分段
  splitSegment(segmentId: string, time: number): Promise<StandardResponse<[AudioSegment, AudioSegment]>>;
  
  // 删除分段
  deleteSegment(segmentId: string): Promise<StandardResponse<void>>;
  
  // 按时间查找分段
  findByTime(audioId: string, time: number): Promise<StandardResponse<AudioSegment>>;
  
  // 获取相邻分段
  getNeighbors(audioId: string, index: number, count: number): Promise<StandardResponse<AudioSegment[]>>;
}
```

---

### websocket.service.ts

**文件路径**: `src/services/websocket.service.ts`

**方法**:
```typescript
class WebSocketService {
  // 连接
  connect(): Promise<void>;
  
  // 断开
  disconnect(): void;
  
  // 加入房间
  joinRoom(roomId: string, roomType: RoomType): void;
  
  // 离开房间
  leaveRoom(roomId: string, roomType: RoomType): void;
  
  // 发送消息
  send(event: string, data: any): void;
  
  // 监听消息
  on(event: string, callback: (data: any) => void): void;
  
  // 取消监听
  off(event: string, callback?: (data: any) => void): void;
}
```

**WebSocket 事件类型**:
```typescript
type WebSocketEvent =
  | 'join-room'
  | 'leave-room'
  | 'annotation-created'
  | 'annotation-updated'
  | 'annotation-deleted'
  | 'cursor-moved'
  | 'selection-changed'
  | 'playback-started'
  | 'playback-paused'
  | 'playback-seeked'
  | 'lock-acquired'
  | 'lock-released'
  | 'comment-added'
  | 'comment-updated'
  | 'comment-deleted'
  | 'notification'
  | 'mention'
  | 'ai-job-progress'
  | 'ai-segment-result'
  | 'ai-job-completed'
  | 'ai-job-failed';
```

---

## TypeScript 类型定义

### types/audio.ts

**文件路径**: `src/types/audio.ts`

```typescript
interface Audio {
  id: string;
  projectId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  format: string;
  duration: number;
  sampleRate: number;
  channels: number;
  metadata: Record<string, any>;
  uploadStatus: 'uploading' | 'completed' | 'failed';
  aiStatus: 'pending' | 'processing' | 'completed' | 'failed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface WaveformData {
  audioId: string;
  zoomLevel: 'overview' | 'detail' | 'zoom';
  samplesPerPixel: number;
  data: number[];
  totalSamples: number;
}

interface WaveformMarker {
  id: string;
  time: number;
  type: 'point' | 'range';
  label?: string;
  color: string;
}
```

---

### types/annotation.ts

**文件路径**: `src/types/annotation.ts`

```typescript
interface Annotation {
  id: string;
  audioId: string;
  layerId: string;
  speakerId?: string;
  startTime: number;
  endTime: number;
  text: string;
  textRaw?: string;
  confidence?: number;
  isManual: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  tags: Tag[];
  note?: string;
  metadata: Record<string, any>;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface AnnotationLayer {
  id: string;
  audioId: string;
  name: string;
  type: 'transcript' | 'speaker' | 'emotion' | 'event' | 'noise';
  color: string;
  isVisible: boolean;
  isLocked: boolean;
  orderIndex: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Speaker {
  id: string;
  projectId: string;
  name: string;
  color: string;
  gender?: 'male' | 'female' | 'unknown';
  ageRange?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Tag {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
  type: 'emotion' | 'scene' | 'custom';
  color?: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

---

### types/ai.ts

**文件路径**: `src/types/ai.ts`

```typescript
interface AIJob {
  id: string;
  audioId: string;
  jobType: 'asr' | 'speaker_diarization' | 'segmentation' | 'noise_detection';
  modelName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  resultSummary: {
    totalSegments: number;
    language: string;
    duration: number;
  };
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

interface AIProgress {
  jobId: string;
  audioId: string;
  stage: 'downloading' | 'segmentation' | 'asr' | 'diarization' | 'postprocessing';
  currentSegment: number;
  totalSegments: number;
  stageProgress: number;
  overallProgress: number;
  estimatedTimeRemaining: number;
  currentOperation: string;
}

interface AISegmentResult {
  jobId: string;
  audioId: string;
  segmentIndex: number;
  segment: {
    id: string;
    startTime: number;
    endTime: number;
    transcript?: string;
    speaker?: string;
    confidence?: number;
    words?: Word[];
  };
}

interface Word {
  word: string;
  start: number;
  end: number;
  confidence: number;
}
```

---

## Composables

### useAudioPlayer.ts

**文件路径**: `src/composables/useAudioPlayer.ts`

```typescript
export function useAudioPlayer(audioId: string) {
  const audioStore = useAudioStore();
  
  const audio = computed(() => audioStore.currentAudio);
  const isPlaying = computed(() => audioStore.isPlaying);
  const currentTime = computed(() => audioStore.currentTime);
  const duration = computed(() => audioStore.duration);
  const playbackRate = computed(() => audioStore.playbackRate);
  const volume = computed(() => audioStore.volume);
  
  const play = () => audioStore.play();
  const pause = () => audioStore.pause();
  const stop = () => audioStore.stop();
  const seek = (time: number) => audioStore.seek(time);
  const setPlaybackRate = (rate: number) => audioStore.setPlaybackRate(rate);
  const setVolume = (vol: number) => audioStore.setVolume(vol);
  const toggleLoop = () => audioStore.toggleLoop();
  
  return {
    audio,
    isPlaying,
    currentTime,
    duration,
    playbackRate,
    volume,
    play,
    pause,
    stop,
    seek,
    setPlaybackRate,
    setVolume,
    toggleLoop,
  };
}
```

---

### useAnnotation.ts

**文件路径**: `src/composables/useAnnotation.ts`

```typescript
export function useAnnotation(audioId: string) {
  const annotationStore = useAnnotationStore();
  
  const annotations = computed(() => annotationStore.annotations);
  const layers = computed(() => annotationStore.layers);
  const activeAnnotationId = computed(() => annotationStore.activeAnnotationId);
  const activeLayerId = computed(() => annotationStore.activeLayerId);
  const activeAnnotation = computed(() => 
    annotations.value.find(a => a.id === activeAnnotationId.value)
  );
  
  const loadAnnotations = async () => {
    await annotationStore.loadAnnotations(audioId);
  };
  
  const createAnnotation = async (data: Partial<Annotation>) => {
    return await annotationStore.createAnnotation(data);
  };
  
  const updateAnnotation = async (id: string, changes: Partial<Annotation>) => {
    await annotationStore.updateAnnotation(id, changes);
  };
  
  const deleteAnnotation = async (id: string) => {
    await annotationStore.deleteAnnotation(id);
  };
  
  const selectAnnotation = (id: string | null) => {
    annotationStore.selectAnnotation(id);
  };
  
  return {
    annotations,
    layers,
    activeAnnotationId,
    activeLayerId,
    activeAnnotation,
    loadAnnotations,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
  };
}
```

---

### useCollaboration.ts

**文件路径**: `src/composables/useCollaboration.ts`

```typescript
export function useCollaboration(audioId: string) {
  const collaborationStore = useCollaborationStore();
  
  const connected = computed(() => collaborationStore.connected);
  const users = computed(() => collaborationStore.users);
  const cursors = computed(() => collaborationStore.cursors);
  const locks = computed(() => collaborationStore.locks);
  
  const connect = () => {
    collaborationStore.connect();
  };
  
  const disconnect = () => {
    collaborationStore.disconnect();
  };
  
  const sendCursor = (position: { time: number }) => {
    collaborationStore.sendCursor(position);
  };
  
  const acquireLock = async (annotationId: string) => {
    await collaborationStore.acquireLock(annotationId);
  };
  
  const releaseLock = (annotationId: string) => {
    collaborationStore.releaseLock(annotationId);
  };
  
  return {
    connected,
    users,
    cursors,
    locks,
    connect,
    disconnect,
    sendCursor,
    acquireLock,
    releaseLock,
  };
}
```

---

## 路由配置

### routes.ts

**文件路径**: `src/router/routes.ts`

```typescript
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/Login.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/pages/auth/Register.vue'),
    meta: { layout: 'auth', requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/pages/dashboard/Dashboard.vue'),
      },
      {
        path: 'projects',
        name: 'projects',
        component: () => import('@/pages/projects/ProjectList.vue'),
      },
      {
        path: 'projects/:id',
        name: 'project-detail',
        component: () => import('@/pages/projects/ProjectDetail.vue'),
      },
      {
        path: 'audio',
        name: 'audio-list',
        component: () => import('@/pages/audio/AudioList.vue'),
      },
      {
        path: 'audio/:id',
        name: 'audio-detail',
        component: () => import('@/pages/audio/AudioDetail.vue'),
      },
      {
        path: 'tasks',
        name: 'tasks',
        component: () => import('@/pages/tasks/TaskList.vue'),
      },
      {
        path: 'tasks/:id',
        name: 'task-detail',
        component: () => import('@/pages/tasks/TaskDetail.vue'),
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/settings/Preferences.vue'),
      },
    ],
  },
];

export default routes;
```

---

## 总结

本文档提供了详细的组件设计方案，包括：

1. **组件定义**: Props、Events、Slots
2. **状态管理**: Pinia stores 的结构和 actions
3. **API 服务**: 后端接口的调用方法
4. **类型定义**: TypeScript 类型
5. **Composables**: 可复用的组合式函数
6. **路由配置**: 页面路由和权限控制

前端开发者可以根据本文档直接实现各个组件。