<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { AudioFile } from '../types/audio'

interface Props {
  audioFiles: AudioFile[]      // 所有音频文件
  currentPath: string          // 当前选中的路径
}

interface Emits {
  (e: 'folder-select', path: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 文件夹节点接口
interface FolderNode {
  name: string
  path: string
  children: Record<string, FolderNode>
  fileCount: number
}

// 构建文件夹树
function buildFolderTree(audioFiles: AudioFile[]): FolderNode {
  const tree: FolderNode = {
    name: 'root',
    path: '',
    children: {},
    fileCount: 0,
  }
  
  audioFiles.forEach(file => {
    const path = file.storagePath || ''
    if (!path) {
      tree.fileCount++
      return
    }
    
    const parts = path.split('/')
    let current = tree
    
    parts.forEach(part => {
      if (!part) return
      
      if (!current.children[part]) {
        const currentPath = current.path ? `${current.path}/${part}` : part
        current.children[part] = {
          name: part,
          path: currentPath,
          children: {},
          fileCount: 0,
        }
      }
      current = current.children[part]
    })
    
    current.fileCount++
  })
  
  return tree
}

// 将树转换为扁平数组（用于渲染）
function flattenTree(node: FolderNode, level = 0): Array<{name: string, path: string, fileCount: number, level: number}> {
  const result: Array<{name: string, path: string, fileCount: number, level: number}> = []
  
  if (node.path !== '') {
    result.push({
      name: node.name,
      path: node.path,
      fileCount: node.fileCount,
      level,
    })
  }
  
  Object.keys(node.children)
    .sort() // 按名称排序
    .forEach(childName => {
      const child = node.children[childName]
      result.push(...flattenTree(child, level + 1))
    })
  
  return result
}

// 计算文件夹树和扁平列表
const folderTree = computed(() => buildFolderTree(props.audioFiles))
const folderList = computed(() => flattenTree(folderTree.value))

// 计算面包屑
const breadcrumbs = computed(() => {
  if (!props.currentPath) {
    return [{ name: '全部文件', path: '' }]
  }
  
  const parts = props.currentPath.split('/')
  return [
    { name: '全部文件', path: '' },
    ...parts.map((part, index) => ({
      name: part,
      path: parts.slice(0, index + 1).join('/'),
    }))
  ]
})

// 选择文件夹
function selectFolder(path: string) {
  emit('folder-select', path)
}

// 导航到面包屑位置
function navigateTo(path: string) {
  emit('folder-select', path)
}

// 获取当前文件列表（根据选中的路径）
const currentFiles = computed(() => {
  if (!props.currentPath) return props.audioFiles
  
  return props.audioFiles.filter(file => {
    if (!props.currentPath) {
      // 显示根目录下的文件（无路径）
      return !file.storagePath || file.storagePath === ''
    }
    // 显示选中路径下的文件
    return file.storagePath === props.currentPath
  })
})

// 获取根目录文件数量（storagePath 为空或未定义的文件）
const rootFileCount = computed(() => {
  return props.audioFiles.filter(file => !file.storagePath || file.storagePath === '').length
})
</script>

<template>
  <div class="virtual-folder-tree">
    <!-- 面包屑导航 -->
    <div class="breadcrumb" v-if="breadcrumbs.length > 0">
      <span 
        v-for="(crumb, index) in breadcrumbs" 
        :key="index"
        class="breadcrumb-item"
        :class="{ 'is-current': index === breadcrumbs.length - 1 }"
        @click="navigateTo(crumb.path)"
      >
        {{ crumb.name }}
        <span v-if="index === 0 && rootFileCount > 0 && !currentPath" class="file-count-badge">
          ({{ rootFileCount }})
        </span>
      </span>
    </div>
    
    <!-- 文件夹树 -->
    <div class="folder-tree" v-if="folderList.length > 0">
      <div 
        v-for="folder in folderList" 
        :key="folder.path"
        class="folder-item"
        :class="{ active: folder.path === currentPath }"
        :style="{ paddingLeft: `${folder.level * 20 + 12}px` }"
        @click="selectFolder(folder.path)"
      >
        <span class="folder-icon">📁</span>
        <span class="folder-name">{{ folder.name }}</span>
        <span class="folder-count" v-if="folder.fileCount > 0">({{ folder.fileCount }})</span>
      </div>
    </div>
    
    <!-- 无文件夹时显示提示 -->
    <div class="empty-state" v-if="folderList.length === 0">
      <p v-if="rootFileCount > 0">全部文件 ({{ rootFileCount }})</p>
      <p v-else>暂无文件夹</p>
      <p class="text-small" v-if="rootFileCount === 0">上传文件时会自动创建文件夹</p>
    </div>
    
    <!-- 当前路径文件统计 -->
    <div class="file-count" v-if="currentPath">
      <span class="count-label">当前文件夹:</span>
      <span class="count-value">{{ currentFiles.length }} 个文件</span>
    </div>
    
    <!-- 根目录文件统计（当没有选择路径且没有文件夹时显示） -->
    <div class="file-count" v-if="!currentPath && folderList.length === 0 && rootFileCount > 0">
      <span class="count-label">根目录:</span>
      <span class="count-value">{{ rootFileCount }} 个文件</span>
    </div>
  </div>
</template>

<style scoped>
.virtual-folder-tree {
  width: 280px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.breadcrumb-item {
  cursor: pointer;
  color: #666;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: #059669;
}

.breadcrumb-item::after {
  content: '/';
  margin-left: 4px;
  margin-right: 4px;
  color: #d1d5db;
}

.breadcrumb-item:last-child::after {
  content: '';
}

.breadcrumb-item.is-current {
  color: #333;
  font-weight: 500;
  cursor: default;
}

.file-count-badge {
  color: #9ca3af;
  font-size: 11px;
  margin-left: 2px;
}

.folder-tree {
  max-height: 200px;
  overflow-y: auto;
}

.folder-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.folder-item:hover {
  background: #f9fafb;
}

.folder-item.active {
  background: #ecfdf5;
  border-left: 3px solid #059669;
}

.folder-icon {
  margin-right: 6px;
  font-size: 14px;
}

.folder-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.folder-count {
  font-size: 11px;
  color: #9ca3af;
  margin-left: 6px;
}

.empty-state {
  padding: 16px 12px;
  text-align: center;
  color: #9ca3af;
}

.empty-state .text-small {
  font-size: 11px;
  margin-top: 4px;
}

.file-count {
  padding: 8px 12px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
}

.count-label {
  color: #6b7280;
  margin-right: 4px;
}

.count-value {
  color: #059669;
  font-weight: 500;
}
</style>