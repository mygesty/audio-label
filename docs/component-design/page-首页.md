# 首页组件设计

首页是用户登录后的第一个页面，显示项目概览、快捷操作和最近访问的音频。

## 页面结构

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header (导航栏)                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Main Content                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  欢迎卡片                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐    │ │
│  │  │  欢迎，[用户名]！                                       │    │ │
│  │  │  今天已完成 [X] 个标注任务                               │    │ │
│  │  └─────────────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  统计概览                                                       │ │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │ │
│  │  │ 总项目数    │ 总音频数    │ 总标注数    │ 待审核数    │    │ │
│  │  │    12       │    256      │    3,420    │     85      │    │ │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  快捷操作                                                       │ │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │ │
│  │  │  上传音频   │  新建项目   │  创建任务   │  查看统计   │    │ │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  最近项目                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐    │ │
│  │  │  项目名称    │ 音频数    │ 标注数    │ 更新时间    │    │ │
│  │  ├─────────────────────────────────────────────────────────┤    │ │
│  │  │  会议录音A    │   45      │   1,230    │  2小时前    │    │ │
│  │  │  客服通话B    │   128     │   2,850    │  1天前     │    │ │
│  │  │  培训课程C    │   67      │   1,520    │  3天前     │    │ │
│  │  └─────────────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  最近标注                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐    │ │
│  │  │  音频名称    │ 标注数量    │ 最后修改    │ 操作         │    │ │
│  │  ├─────────────────────────────────────────────────────────┤    │ │
│  │  │  meeting-001 │  23        │  30分钟前    │ 继续  查看  │    │ │
│  │  │  call-002     │  18        │  1小时前     │ 继续  查看  │    │ │
│  │  │  lecture-003  │  45        │  2小时前     │ 继续  查看  │    │ │
│  │  └─────────────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  待办任务                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐    │ │
│  │  │  任务名称      │ 截止时间    │ 优先级      │ 状态        │    │ │
│  │  ├─────────────────────────────────────────────────────────┤    │ │
│  │  │  会议录音标注  │  2026-02-15 │  高         │ 进行中      │    │ │
│  │  │  客服通话审核  │  2026-02-14 │  中         │ 待审核      │    │ │
│  │  │  培训课程整理  │  2026-02-16 │  低         │ 待处理      │    │ │
│  │  └─────────────────────────────────────────────────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件详解

### 1. WelcomeCard 组件

**文件路径**: `src/components/dashboard/WelcomeCard.vue`

**功能**: 欢迎卡片，显示用户信息和今日工作概览。

#### Props

```typescript
interface WelcomeCardProps {
  userName: string;
  userAvatar?: string;
  todayStats: {
    completedAnnotations: number;
    completedTasks: number;
    reviewedAnnotations: number;
  };
}
```

#### Events

```typescript
interface WelcomeCardEmits {
  // 无 Events
}
```

---

### 2. StatsOverview 组件

**文件路径**: `src/components/dashboard/StatsOverview.vue`

**功能**: 统计概览，显示关键指标。

#### Props

```typescript
interface StatsOverviewProps {
  stats: {
    totalProjects: number;
    totalAudio: number;
    totalAnnotations: number;
    pendingReview: number;
  };
}
```

#### Events

```typescript
interface StatsOverviewEmits {
  (e: 'stat-click', statType: string): void;
}
```

---

### 3. QuickActions 组件

**文件路径**: `src/components/dashboard/QuickActions.vue`

**功能**: 快捷操作，提供常用操作的快速入口。

#### Props

```typescript
interface QuickActionsProps {
  actions: QuickAction[];
}
```

#### Events

```typescript
interface QuickActionsEmits {
  (e: 'action-click', action: QuickAction): void;
}
```

#### 动作配置

```typescript
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color?: string;
}
```

```typescript
const DEFAULT_ACTIONS: QuickAction[] = [
  {
    id: 'upload',
    title: '上传音频',
    description: '上传新的音频文件',
    icon: 'upload',
    route: '/audio/upload',
    color: '#10B981',
  },
  {
    id: 'create-project',
    title: '新建项目',
    description: '创建新的标注项目',
    icon: 'folder-plus',
    route: '/projects/create',
    color: '#3B82F6',
  },
  {
    id: 'create-task',
    title: '创建任务',
    description: '分配标注任务',
    icon: 'check-square',
    route: '/tasks/create',
    color: '#F97316',
  },
  {
    id: 'view-stats',
    title: '查看统计',
    description: '查看详细统计数据',
    icon: 'bar-chart',
    route: '/stats',
    color: '#8B5CF6',
  },
];
```

---

### 4. RecentProjects 组件

**文件路径**: `src/components/dashboard/RecentProjects.vue`

**功能**: 最近项目列表，显示用户最近访问的项目。

#### Props

```typescript
interface RecentProjectsProps {
  projects: Project[];
  loading?: boolean;
}
```

#### Events

```typescript
interface RecentProjectsEmits {
  (e: 'project-click', projectId: string): void;
}
```

#### 项目数据结构

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  audioCount: number;
  annotationCount: number;
  lastUpdatedAt: string;
  status: 'active' | 'archived';
}
```

---

### 5. RecentAnnotations 组件

**文件路径**: `src/components/dashboard/RecentAnnotations.vue`

**功能**: 最近标注列表，显示用户最近编辑的标注。

#### Props

```typescript
interface RecentAnnotationsProps {
  annotations: RecentAnnotation[];
  loading?: boolean;
}
```

#### Events

```typescript
interface RecentAnnotationsEmits {
  (e: 'annotation-continue', annotationId: string): void;
  (e: 'annotation-view', annotationId: string): void;
}
```

#### 最近标注数据结构

```typescript
interface RecentAnnotation {
  id: string;
  audioId: string;
  audioName: string;
  annotationCount: number;
  lastModifiedAt: string;
}
```

---

### 6. PendingTasks 组件

**文件路径**: `src/components/dashboard/PendingTasks.vue`

**功能**: 待办任务列表，显示用户的待办任务。

#### Props

```typescript
interface PendingTasksProps {
  tasks: Task[];
  loading?: boolean;
}
```

#### Events

```typescript
interface PendingTasksEmits {
  (e: 'task-click', taskId: string): void;
}
```

#### 任务数据结构

```typescript
interface Task {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'submitted' | 'reviewing';
  audioIds: string[];
  assignedTo?: string;
}
```

---

## 页面组件

### Dashboard 页面

**文件路径**: `src/pages/dashboard/Dashboard.vue`

**功能**: 首页主组件，整合所有子组件。

#### Props

```typescript
interface DashboardProps {
  // 无 Props
}
```

#### 内部状态

```typescript
interface DashboardState {
  userName: string;
  userAvatar?: string;
  todayStats: TodayStats;
  overallStats: OverallStats;
  recentProjects: Project[];
  recentAnnotations: RecentAnnotation[];
  pendingTasks: Task[];
  loading: boolean;
}
```

#### 加载数据

```typescript
const loadData = async () => {
  loading.value = true;
  try {
    const [
      statsResponse,
      projectsResponse,
      annotationsResponse,
      tasksResponse,
    ] = await Promise.all([
      dashboardService.getStats(),
      projectService.getRecentProjects(),
      annotationService.getRecentAnnotations(),
      taskService.getPendingTasks(),
    ]);
    
    overallStats.value = statsResponse.data;
    recentProjects.value = projectsResponse.data;
    recentAnnotations.value = annotationsResponse.data;
    pendingTasks.value = tasksResponse.data;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
};
```

---

## 性能优化

### 1. 并行请求

多个独立的数据请求使用 Promise.all 并行加载：

```typescript
const [stats, projects, annotations, tasks] = await Promise.all([
  getStats(),
  getRecentProjects(),
  getRecentAnnotations(),
  getPendingTasks(),
]);
```

### 2. 数据缓存

使用 TanStack Query 缓存数据：

```typescript
const { data: stats } = useQuery({
  queryKey: ['dashboard-stats'],
  queryFn: dashboardService.getStats,
  staleTime: 5 * 60 * 1000, // 5分钟
});
```

### 3. 虚拟滚动

列表数据使用虚拟滚动：

```vue
<RecycleScroller
  :items="recentProjects"
  :item-size="80"
  key-field="id"
>
  <!-- 项目卡片 -->
</RecycleScroller>
```

---

## 响应式设计

```vue
<template>
  <div class="dashboard">
    <!-- 大屏幕布局 -->
    <div v-if="isLargeScreen" class="dashboard-grid">
      <WelcomeCard :user-name="userName" :today-stats="todayStats" />
      <StatsOverview :stats="overallStats" />
      <QuickActions :actions="actions" />
      <RecentProjects :projects="recentProjects" />
      <RecentAnnotations :annotations="recentAnnotations" />
      <PendingTasks :tasks="pendingTasks" />
    </div>
    
    <!-- 小屏幕布局 -->
    <div v-else class="dashboard-stack">
      <WelcomeCard :user-name="userName" :today-stats="todayStats" />
      <StatsOverview :stats="overallStats" />
      <QuickActions :actions="actions" />
      <RecentProjects :projects="recentProjects" />
      <RecentAnnotations :annotations="recentAnnotations" />
      <PendingTasks :tasks="pendingTasks" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.dashboard-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

## 总结

首页是用户登录后的第一个页面，包含以下关键组件：

1. **WelcomeCard**: 欢迎卡片
2. **StatsOverview**: 统计概览
3. **QuickActions**: 快捷操作
4. **RecentProjects**: 最近项目
5. **RecentAnnotations**: 最近标注
6. **PendingTasks**: 待办任务

所有组件都使用 TypeScript 定义类型，支持响应式布局，使用并行请求和缓存优化性能。