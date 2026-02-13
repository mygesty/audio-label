# 组件设计索引

本文档提供了所有组件设计文档的索引，方便快速查找。

## 目录

### 1. [总览文档](./README.md)
- 组件设计原则
- 通用组件定义
- 布局组件定义
- 音频相关组件定义
- 标注相关组件定义
- 协作相关组件定义
- AI相关组件定义
- 状态管理定义
- API服务定义
- TypeScript类型定义
- Composables定义
- 路由配置

---

### 2. 页面组件设计

#### [标注界面](./page-标注界面.md)
**重要性**: ⭐⭐⭐⭐⭐ (核心页面)

**包含组件**:
- WaveformView - 波形显示和交互
- AnnotationWorkspace - 标注工作区
- AnnotationPanel - 标注编辑面板
- LayerManager - 层管理
- CollaborationPanel - 协作面板
- AIProgressPanel - AI 进度面板

**关键特性**:
- 长音频多级波形渲染
- 实时协作光标显示
- AI 流式进度推送
- 时间范围标注加载

---

#### [首页](./page-首页.md)
**重要性**: ⭐⭐⭐ (重要页面)

**包含组件**:
- WelcomeCard - 欢迎卡片
- StatsOverview - 统计概览
- QuickActions - 快捷操作
- RecentProjects - 最近项目
- RecentAnnotations - 最近标注
- PendingTasks - 待办任务

**关键特性**:
- 工作概览展示
- 快速操作入口
- 待办任务提醒

---

#### [音频列表](./page-音频列表.md)
**重要性**: ⭐⭐⭐⭐ (重要页面)

**包含组件**:
- AudioToolbar - 音频工具栏
- FolderNavigation - 文件夹导航
- AudioList - 音频列表
- AudioCard - 音频卡片
- AudioTableRow - 音频表格行
- AudioUploadDialog - 音频上传对话框
- Pagination - 分页组件

**关键特性**:
- 搜索和过滤
- 批量操作
- 视图切换（列表/网格）
- 文件夹管理

---

## 组件分类

### 通用组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| Button | `src/components/common/Button.vue` | 按钮组件 |
| Input | `src/components/common/Input.vue` | 输入框组件 |
| Modal | `src/components/common/Modal.vue` | 对话框组件 |
| Pagination | `src/components/common/Pagination.vue` | 分页组件 |
| Select | `src/components/common/Select.vue` | 选择器组件 |
| TagSelector | `src/components/common/TagSelector.vue` | 标签选择器 |

---

### 布局组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| MainLayout | `src/layouts/MainLayout.vue` | 主页面布局 |
| AuthLayout | `src/layouts/AuthLayout.vue` | 认证页面布局 |

---

### 音频相关组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| AudioPlayer | `src/components/audio/AudioPlayer.vue` | 音频播放器 |
| WaveformView | `src/components/audio/WaveformView.vue` | 波形显示 |
| WaveformCanvas | `src/components/audio/WaveformCanvas.vue` | 波形 Canvas |
| PlaybackControls | `src/components/audio/PlaybackControls.vue` | 播放控制 |
| AudioToolbar | `src/components/audio/AudioToolbar.vue` | 音频工具栏 |
| AudioList | `src/components/audio/AudioList.vue` | 音频列表 |
| AudioCard | `src/components/audio/AudioCard.vue` | 音频卡片 |
| AudioTableRow | `src/components/audio/AudioTableRow.vue` | 音频表格行 |
| AudioUploadDialog | `src/components/audio/AudioUploadDialog.vue` | 音频上传对话框 |
| FolderNavigation | `src/components/audio/FolderNavigation.vue` | 文件夹导航 |

---

### 标注相关组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| AnnotationEditor | `src/components/annotation/AnnotationEditor.vue` | 标注编辑器 |
| AnnotationWorkspace | `src/components/annotation/AnnotationWorkspace.vue` | 标注工作区 |
| AnnotationList | `src/components/annotation/AnnotationList.vue` | 标注列表 |
| AnnotationPanel | `src/components/annotation/AnnotationPanel.vue` | 标注编辑面板 |
| AnnotationTimeline | `src/components/annotation/AnnotationTimeline.vue` | 标注时间轴 |
| LayerManager | `src/components/annotation/LayerManager.vue` | 层管理 |

---

### 协作相关组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| CollaboratorCursor | `src/components/collaboration/CollaboratorCursor.vue` | 协作者光标 |
| CommentPanel | `src/components/collaboration/CommentPanel.vue` | 评论面板 |
| OnlineUsers | `src/components/collaboration/OnlineUsers.vue` | 在线用户 |
| CollaborationPanel | `src/components/collaboration/CollaborationPanel.vue` | 协作面板 |

---

### AI相关组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| AIProgressPanel | `src/components/ai/AIProgressPanel.vue` | AI 进度面板 |
| AISegmentPreview | `src/components/ai/AISegmentPreview.vue` | AI 分段预览 |
| AIModelSelector | `src/components/ai/AIModelSelector.vue` | AI 模型选择器 |

---

### 仪表盘组件

| 组件名称 | 文件路径 | 用途 |
|---------|---------|------|
| WelcomeCard | `src/components/dashboard/WelcomeCard.vue` | 欢迎卡片 |
| StatsOverview | `src/components/dashboard/StatsOverview.vue` | 统计概览 |
| QuickActions | `src/components/dashboard/QuickActions.vue` | 快捷操作 |
| RecentProjects | `src/components/dashboard/RecentProjects.vue` | 最近项目 |
| RecentAnnotations | `src/components/dashboard/RecentAnnotations.vue` | 最近标注 |
| PendingTasks | `src/components/dashboard/PendingTasks.vue` | 待办任务 |

---

## 状态管理

| Store | 文件路径 | 用途 |
|-------|---------|------|
| audio.ts | `src/stores/audio.ts` | 音频播放状态 |
| annotation.ts | `src/stores/annotation.ts` | 标注数据状态 |
| collaboration.ts | `src/stores/collaboration.ts` | 协作状态 |
| user.ts | `src/stores/user.ts` | 用户状态 |
| project.ts | `src/stores/project.ts` | 项目状态 |

---

## API服务

| Service | 文件路径 | 用途 |
|---------|---------|------|
| audio.service.ts | `src/services/audio.service.ts` | 音频相关 API |
| annotation.service.ts | `src/services/annotation.service.ts` | 标注相关 API |
| segment.service.ts | `src/services/segment.service.ts` | 分段相关 API |
| speaker.service.ts | `src/services/speaker.service.ts` | 说话人相关 API |
| tag.service.ts | `src/services/tag.service.ts` | 标签相关 API |
| websocket.service.ts | `src/services/websocket.service.ts` | WebSocket 服务 |

---

## Composables

| Composable | 文件路径 | 用途 |
|-----------|---------|------|
| useAudioPlayer.ts | `src/composables/useAudioPlayer.ts` | 音频播放器逻辑 |
| useAnnotation.ts | `src/composables/useAnnotation.ts` | 标注操作逻辑 |
| useCollaboration.ts | `src/composables/useCollaboration.ts` | 协作功能逻辑 |
| useWebSocket.ts | `src/composables/useWebSocket.ts` | WebSocket 连接 |
| useSegmentLoader.ts | `src/composables/useSegmentLoader.ts` | 分段加载逻辑（长音频） |
| useWaveformTiles.ts | `src/composables/useWaveformTiles.ts` | 波形瓦片加载（长音频） |
| useAnnotationRange.ts | `src/composables/useAnnotationRange.ts` | 标注范围加载（长音频） |
| useAIStream.ts | `src/composables/useAIStream.ts` | AI 流式进度 |

---

## TypeScript类型定义

| 文件 | 用途 |
|------|------|
| types/audio.ts | 音频相关类型 |
| types/annotation.ts | 标注相关类型 |
| types/ai.ts | AI 相关类型 |
| types/collaboration.ts | 协作相关类型 |
| types/user.ts | 用户相关类型 |
| types/project.ts | 项目相关类型 |
| types/api.ts | API 响应类型 |

---

## 快速查找

### 按功能查找

**音频播放**:
- WaveformView
- AudioPlayer
- PlaybackControls

**标注编辑**:
- AnnotationWorkspace
- AnnotationPanel
- LayerManager
- AnnotationList

**实时协作**:
- CollaboratorCursor
- CommentPanel
- OnlineUsers
- CollaborationPanel

**AI 功能**:
- AIProgressPanel
- AISegmentPreview
- AIModelSelector

---

### 按页面查找

**标注界面**:
- [查看设计文档](./page-标注界面.md)

**首页**:
- [查看设计文档](./page-首页.md)

**音频列表**:
- [查看设计文档](./page-音频列表.md)

---

## 开发优先级

### 第一阶段（MVP）

必须实现的组件：
- ✅ Button
- ✅ Input
- ✅ Modal
- ✅ MainLayout
- ✅ AuthLayout
- ✅ WaveformView
- ✅ AudioPlayer
- ✅ AnnotationWorkspace
- ✅ AnnotationPanel
- ✅ AnnotationList
- ✅ AIProgressPanel

### 第二阶段

应该实现的组件：
- LayerManager
- CollaborationPanel
- CommentPanel
- OnlineUsers
- AISegmentPreview
- AIModelSelector
- AnnotationTimeline

### 第三阶段

可以优化的组件：
- WaveformCanvas 性能优化
- AudioCard/AudioTableRow 动画效果
- WelcomeCard 数据可视化增强

---

## 开发指南

### 1. 创建新组件

```bash
# 1. 创建组件文件
touch src/components/example/ExampleComponent.vue

# 2. 定义 Props 和 Events
interface ExampleComponentProps {
  prop1: string;
  prop2?: number;
}

interface ExampleComponentEmits {
  (e: 'change', value: string): void;
}

# 3. 实现组件逻辑
export default defineComponent({
  name: 'ExampleComponent',
  props: {
    prop1: { type: String, required: true },
    prop2: { type: Number, default: 0 },
  },
  emits: ['change'],
  setup(props, { emit }) {
    // 组件逻辑
    return {};
  },
});
```

### 2. 使用 Composable

```typescript
// 在组件中使用 Composable
import { useAudioPlayer } from '@/composables/useAudioPlayer';

export default defineComponent({
  setup() {
    const { play, pause, seek } = useAudioPlayer(audioId);
    
    return {
      play,
      pause,
      seek,
    };
  },
});
```

### 3. 使用 Store

```typescript
import { useAnnotationStore } from '@/stores/annotation';

export default defineComponent({
  setup() {
    const annotationStore = useAnnotationStore();
    
    const annotations = computed(() => annotationStore.annotations);
    
    return {
      annotations,
    };
  },
});
```

### 4. 使用 API 服务

```typescript
import { audioService } from '@/services/audio.service';

export default defineComponent({
  setup() {
    const loadAudio = async (audioId: string) => {
      try {
        const response = await audioService.getAudioDetail(audioId);
        return response.data;
      } catch (error) {
        console.error('加载音频失败:', error);
      }
    };
    
    return {
      loadAudio,
    };
  },
});
```

---

## 最佳实践

### 1. 组件命名

- 使用 PascalCase 命名组件
- 组件名称应该清晰表达其功能
- 避免过于简短或抽象的名称

**示例**:
- ✅ `AnnotationPanel`
- ✅ `WaveformView`
- ❌ `Panel`
- ❌ `View`

### 2. Props 命名

- 使用 camelCase 命名 Props
- 布尔值 Props 使用 `is` 或 `has` 前缀
- 事件处理函数使用 `on` 前缀

**示例**:
```typescript
interface ComponentProps {
  isVisible: boolean;  // ✅
  isLoading: boolean;  // ✅
  visible: boolean;   // ❌
  loading: boolean;   // ❌
}
```

### 3. Events 命名

- 事件名称使用 kebab-case
- 使用动词或动词短语
- 避免使用过于通用的事件名称

**示例**:
```typescript
interface ComponentEmits {
  (e: 'annotation-create', annotation: Annotation): void;  // ✅
  (e: 'annotation-delete', id: string): void;           // ✅
  (e: 'change', value: any): void;                        // ❌
  (e: 'delete', id: string): void;                        // ❌
}
```

### 4. 类型定义

- 所有 Props 和 Events 都必须定义类型
- 使用 interface 定义复杂类型
- 使用 type 定义简单类型

### 5. 性能优化

- 使用 `computed` 缓存计算结果
- 使用 `debounce` 和 `throttle` 优化高频操作
- 使用虚拟滚动优化长列表
- 使用懒加载优化图片加载

---

## 总结

本文档提供了完整的组件设计索引，帮助前端开发者快速查找所需的组件文档。所有组件都遵循统一的设计原则和开发规范，确保代码的一致性和可维护性。