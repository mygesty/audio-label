# 音频列表组件设计

音频列表页面是用户管理和浏览音频文件的主要页面，支持搜索、过滤、排序、批量操作等功能。

## 页面结构

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header (导航栏)                                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Main Content                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  工具栏                                                         │ │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │ │
│  │  │  搜索框     │  过滤器     │  排序器     │  视图切换   │    │ │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘    │ │
│  │  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │ │
│  │  │  上传按钮   │  批量操作   │  刷新       │  导出       │    │ │
│  │  └─────────────┴─────────────┴─────────────┴─────────────┘    │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  文件夹导航                                                     │ │
│  │  📁 项目根目录                                                 │ │
│  │    📁 会议录音                                                 │ │
│  │    📁 客服通话                                                 │ │
│  │    📁 培训课程                                                 │ │
│  └───────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  音频列表                                                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐    │ │
│  │  │  ☑  文件名    │  时长    │  状态    │  AI状态   │  操作    │    │ │
│  │  ├─────────────────────────────────────────────────────────┤    │ │
│  │  │  ☑  meeting-001.mp3 │ 1:23:45 │ 已完成  │  已处理   │ 查看 标注 │    │ │
│  │  │  ☐  call-002.wav    │ 0:45:32 │ 进行中  │  处理中   │ 查看 标注 │    │ │
│  │  │  ☐  lecture-003.flac │ 2:15:18 │ 待处理  │  待处理   │ 查看 标注 │    │ │
│  │  └─────────────────────────────────────────────────────────┘    │ │
│  │  分页: 上一页 1 2 3 4 5 ... 下一页  共 256 条                   │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 核心组件详解

### 1. AudioToolbar 组件

**文件路径**: `src/components/audio/AudioToolbar.vue`

**功能**: 音频工具栏，包含搜索、过滤、排序、批量操作等。

#### Props

```typescript
interface AudioToolbarProps {
  searchQuery?: string;
  filters?: AudioFilters;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  viewMode?: 'list' | 'grid';
  selectedCount?: number;
  loading?: boolean;
}
```

#### Events

```typescript
interface AudioToolbarEmits {
  (e: 'search-change', query: string): void;
  (e: 'filter-change', filters: AudioFilters): void;
  (e: 'sort-change', sortBy: string, order: 'asc' | 'desc'): void;
  (e: 'view-change', viewMode: 'list' | 'grid'): void;
  (e: 'upload-click'): void;
  (e: 'batch-delete'): void;
  (e: 'batch-export'): void;
  (e: 'refresh'): void;
}
```

#### 过滤器配置

```typescript
interface AudioFilters {
  status?: 'uploading' | 'completed' | 'failed';
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  format?: 'mp3' | 'wav' | 'flac' | 'ogg' | 'm4a';
  durationRange?: { min: number; max: number };
  dateRange?: { start: Date; end: Date };
  tags?: string[];
}
```

---

### 2. FolderNavigation 组件

**文件路径**: `src/components/audio/FolderNavigation.vue`

**功能**: 文件夹导航，显示文件夹树结构。

#### Props

```typescript
interface FolderNavigationProps {
  folders: AudioFolder[];
  currentFolderId?: string;
  loading?: boolean;
}
```

#### Events

```typescript
interface FolderNavigationEmits {
  (e: 'folder-select', folderId: string): void;
  (e: 'folder-create', parentId?: string): void;
  (e: 'folder-rename', folderId: string): void;
  (e: 'folder-delete', folderId: string): void;
  (e: 'folder-move', folderId: string, targetFolderId: string): void;
}
```

#### 文件夹数据结构

```typescript
interface AudioFolder {
  id: string;
  projectId: string;
  parentId?: string;
  name: string;
  path: string;
  audioCount: number;
  children?: AudioFolder[];
  createdAt: string;
}
```

---

### 3. AudioList 组件

**文件路径**: `src/components/audio/AudioList.vue`

**功能**: 音频列表，显示所有音频文件。

#### Props

```typescript
interface AudioListProps {
  audios: Audio[];
  selectedIds?: string[];
  viewMode?: 'list' | 'grid';
  loading?: boolean;
}
```

#### Events

```typescript
interface AudioListEmits {
  (e: 'audio-click', audioId: string): void;
  (e: 'audio-select', audioId: string, selected: boolean): void;
  (e: 'audio-select-all', selected: boolean): void;
  (e: 'audio-delete', audioId: string): void;
  (e: 'audio-export', audioId: string): void;
  (e: 'audio-ai-process', audioId: string): void;
}
```

#### 音频数据结构

```typescript
interface Audio {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  format: string;
  duration: number;
  sampleRate: number;
  channels: number;
  uploadStatus: 'uploading' | 'completed' | 'failed';
  aiStatus: 'pending' | 'processing' | 'completed' | 'failed';
  annotationCount?: number;
  createdAt: string;
  updatedAt: string;
}
```

---

### 4. AudioCard 组件

**文件路径**: `src/components/audio/AudioCard.vue`

**功能**: 音频卡片，网格视图下显示单个音频。

#### Props

```typescript
interface AudioCardProps {
  audio: Audio;
  selected?: boolean;
  showCheckbox?: boolean;
}
```

#### Events

```typescript
interface AudioCardEmits {
  (e: 'click'): void;
  (e: 'select-change', selected: boolean): void;
  (e: 'delete'): void;
  (e: 'export'): void;
  (e: 'ai-process'): void;
}
```

---

### 5. AudioTableRow 组件

**文件路径**: `src/components/audio/AudioTableRow.vue`

**功能**: 音频表格行，列表视图下显示单个音频。

#### Props

```typescript
interface AudioTableRowProps {
  audio: Audio;
  selected?: boolean;
  showCheckbox?: boolean;
}
```

#### Events

```typescript
interface AudioTableRowEmits {
  (e: 'click'): void;
  (e: 'select-change', selected: boolean): void;
  (e: 'delete'): void;
  (e: 'export'): void;
  (e: 'ai-process'): void;
}
```

---

### 6. AudioUploadDialog 组件

**文件路径**: `src/components/audio/AudioUploadDialog.vue`

**功能**: 音频上传对话框，支持拖拽上传和批量上传。

#### Props

```typescript
interface AudioUploadDialogProps {
  visible: boolean;
  projectId?: string;
  folderId?: string;
}
```

#### Events

```typescript
interface AudioUploadDialogEmits {
  (e: 'update:visible', visible: boolean): void;
  (e: 'upload', files: File[]): void;
  (e: 'cancel'): void;
}
```

#### 上传状态

```typescript
interface UploadState {
  files: UploadFile[];
  uploading: boolean;
  completed: number;
  failed: number;
}

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  progress: number;
  error?: string;
  audioId?: string;
}
```

---

### 7. Pagination 组件

**文件路径**: `src/components/common/Pagination.vue`

**功能**: 分页组件。

#### Props

```typescript
interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}
```

#### Events

```typescript
interface PaginationEmits {
  (e: 'change', page: number): void;
  (e: 'size-change', pageSize: number): void;
}
```

---

## 页面组件

### AudioList 页面

**文件路径**: `src/pages/audio/AudioList.vue`

**功能**: 音频列表主页面。

#### Props

```typescript
interface AudioListProps {
  // 无 Props
}
```

#### 内部状态

```typescript
interface AudioListState {
  searchQuery: string;
  filters: AudioFilters;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'list' | 'grid';
  selectedIds: Set<string>;
  currentPage: number;
  pageSize: number;
  currentFolderId: string | null;
  uploadDialogVisible: boolean;
}
```

#### 数据加载

```typescript
const { data: audios, isLoading, refetch } = useQuery({
  queryKey: ['audio-list', searchQuery, filters, sortBy, sortOrder, currentPage, pageSize, currentFolderId],
  queryFn: () => audioService.getAudioList({
    search: searchQuery,
    filters,
    sortBy,
    sortOrder,
    page: currentPage,
    limit: pageSize,
    folderId: currentFolderId,
  }),
});
```

#### 批量操作

```typescript
const handleBatchDelete = async () => {
  if (selectedIds.value.size === 0) {
    return;
  }
  
  const confirmed = await Modal.confirm({
    title: '确认删除',
    content: `确定要删除选中的 ${selectedIds.value.size} 个音频吗？`,
  });
  
  if (confirmed) {
    try {
      await Promise.all(
        Array.from(selectedIds.value).map(id => audioService.deleteAudio(id))
      );
      Message.success('删除成功');
      selectedIds.value.clear();
      refetch();
    } catch (error) {
      Message.error('删除失败');
    }
  }
};
```

---

## 长音频场景优化

### 1. 分页加载

长音频列表使用分页加载，避免一次性加载过多数据：

```typescript
const PAGE_SIZE = 20;

const loadAudios = async (page: number) => {
  const response = await audioService.getAudioList({
    page,
    limit: PAGE_SIZE,
    folderId: currentFolderId.value,
  });
  
  return response.data;
};
```

### 2. 虚拟滚动

列表视图使用虚拟滚动优化性能：

```vue
<RecycleScroller
  v-if="viewMode === 'list'"
  :items="audios"
  :item-size="80"
  key-field="id"
>
  <template #default="{ item: audio }">
    <AudioTableRow
      :audio="audio"
      :selected="selectedIds.has(audio.id)"
      @select-change="handleSelect"
      @click="handleClick"
    />
  </template>
</RecycleScroller>
```

### 3. 懒加载

音频预览图使用懒加载：

```vue
<template>
  <AudioCard
    v-for="audio in audios"
    :key="audio.id"
    :audio="audio"
    :selected="selectedIds.has(audio.id)"
  >
    <template #preview>
      <img
        :src="getWaveformThumbnail(audio.id)"
        loading="lazy"
        alt="waveform"
      />
    </template>
  </AudioCard>
</template>
```

---

## 性能优化

### 1. 搜索防抖

搜索输入使用防抖，避免频繁请求：

```typescript
import { debounce } from 'lodash-es';

const handleSearchChange = debounce((query: string) => {
  searchQuery.value = query;
  currentPage.value = 1;
}, 300);
```

### 2. 数据缓存

使用 TanStack Query 缓存数据：

```typescript
const { data: audios } = useQuery({
  queryKey: ['audio-list', currentPage, pageSize],
  queryFn: () => audioService.getAudioList({ page: currentPage, limit: pageSize }),
  staleTime: 2 * 60 * 1000, // 2分钟
  gcTime: 10 * 60 * 1000, // 10分钟
});
```

### 3. 选择状态优化

使用 Set 存储选中的 ID，提高查找效率：

```typescript
const selectedIds = ref<Set<string>>(new Set());

const toggleSelect = (id: string) => {
  if (selectedIds.value.has(id)) {
    selectedIds.value.delete(id);
  } else {
    selectedIds.value.add(id);
  }
};

const isAllSelected = computed(() => {
  return audios.value?.length > 0 && 
    audios.value.every(audio => selectedIds.value.has(audio.id));
});
```

---

## 响应式设计

```vue
<template>
  <div class="audio-list-page">
    <!-- 工具栏 -->
    <AudioToolbar
      :search-query="searchQuery"
      :filters="filters"
      :sort-by="sortBy"
      :sort-order="sortOrder"
      :view-mode="viewMode"
      :selected-count="selectedIds.size"
      @search-change="handleSearchChange"
      @filter-change="handleFilterChange"
      @sort-change="handleSortChange"
      @view-change="handleViewChange"
      @upload-click="handleUploadClick"
      @batch-delete="handleBatchDelete"
      @batch-export="handleBatchExport"
      @refresh="handleRefresh"
    />
    
    <!-- 主内容区域 -->
    <div class="content-area">
      <!-- 侧边栏：文件夹导航 -->
      <aside v-if="!isMobile" class="folder-sidebar">
        <FolderNavigation
          :folders="folders"
          :current-folder-id="currentFolderId"
          @folder-select="handleFolderSelect"
        />
      </aside>
      
      <!-- 音频列表 -->
      <main class="audio-list-main">
        <!-- 列表视图 -->
        <div v-if="viewMode === 'list'" class="list-view">
          <AudioList
            :audios="audios"
            :selected-ids="Array.from(selectedIds)"
            :loading="loading"
            @audio-click="handleAudioClick"
            @audio-select="handleSelect"
            @audio-delete="handleDelete"
            @audio-export="handleExport"
            @audio-ai-process="handleAIProcess"
          />
        </div>
        
        <!-- 网格视图 -->
        <div v-else class="grid-view">
          <AudioCard
            v-for="audio in audios"
            :key="audio.id"
            :audio="audio"
            :selected="selectedIds.has(audio.id)"
            @click="handleAudioClick"
            @select-change="handleSelect"
            @delete="handleDelete"
            @export="handleExport"
            @ai-process="handleAIProcess"
          />
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container">
          <Pagination
            :current="currentPage"
            :total="total"
            :page-size="pageSize"
            @change="handlePageChange"
          />
        </div>
      </main>
    </div>
    
    <!-- 上传对话框 -->
    <AudioUploadDialog
      :visible="uploadDialogVisible"
      :project-id="currentProjectId"
      :folder-id="currentFolderId"
      @upload="handleUpload"
      @cancel="handleUploadCancel"
    />
  </div>
</template>

<style scoped>
.content-area {
  display: flex;
  gap: 24px;
  margin-top: 24px;
}

.folder-sidebar {
  width: 280px;
  flex-shrink: 0;
}

.audio-list-main {
  flex: 1;
  min-width: 0;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

@media (max-width: 1024px) {
  .folder-sidebar {
    width: 220px;
  }
}

@media (max-width: 768px) {
  .folder-sidebar {
    display: none;
  }
  
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
```

---

## 总结

音频列表页面是用户管理和浏览音频文件的主要页面，包含以下关键组件：

1. **AudioToolbar**: 音频工具栏
2. **FolderNavigation**: 文件夹导航
3. **AudioList**: 音频列表
4. **AudioCard**: 音频卡片
5. **AudioTableRow**: 音频表格行
6. **AudioUploadDialog**: 音频上传对话框
7. **Pagination**: 分页组件

所有组件都使用 TypeScript 定义类型，支持列表和网格两种视图模式，使用虚拟滚动和懒加载优化性能，支持响应式布局。