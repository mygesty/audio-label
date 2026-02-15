<template>
  <el-card class="project-card" shadow="hover" @click="handleClick">
    <div class="card-header">
      <div class="project-info">
        <h3 class="project-name">{{ project.name }}</h3>
        <p class="project-description" v-if="project.description">
          {{ project.description }}
        </p>
      </div>
      <el-tag :type="getStatusType(project.status)" size="small">
        {{ getStatusText(project.status) }}
      </el-tag>
    </div>

    <div class="card-body">
      <div class="project-meta">
        <div class="meta-item" v-if="project.team">
          <el-icon><Office /></el-icon>
          <span>{{ project.team.name }}</span>
        </div>
        <div class="meta-item" v-if="project.creator">
          <el-icon><User /></el-icon>
          <span>{{ project.creator.username }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Clock /></el-icon>
          <span>{{ formatDate(project.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div class="card-footer">
      <el-button type="primary" link size="small" @click.stop="handleView">
        查看
      </el-button>
      <el-button type="primary" link size="small" @click.stop="handleEdit">
        编辑
      </el-button>
      <el-button type="danger" link size="small" @click.stop="handleDelete">
        删除
      </el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Office, User, Clock } from '@element-plus/icons-vue'
import type { Project } from '@/types/project'
import { ProjectStatus } from '@/types/project'

interface Props {
  project: Project
}

const props = defineProps<Props>()

const emit = defineEmits<{
  view: [project: Project]
  edit: [project: Project]
  delete: [project: Project]
}>()

const handleClick = () => {
  emit('view', props.project)
}

const handleView = () => {
  emit('view', props.project)
}

const handleEdit = () => {
  emit('edit', props.project)
}

const handleDelete = () => {
  emit('delete', props.project)
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'active':
      return 'success'
    case 'archived':
      return 'info'
    default:
      return 'info'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return '活跃'
    case 'archived':
      return '已归档'
    default:
      return status
  }
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return '今天'
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return `${days}天前`
  } else if (days < 30) {
    return `${Math.floor(days / 7)}周前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}
</script>

<style scoped lang="scss">
.project-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}

.project-info {
  flex: 1;
  margin-right: 12px;
}

.project-name {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.project-description {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-body {
  margin-bottom: 16px;
}

.project-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;

  .el-icon {
    font-size: 14px;
  }
}

.card-footer {
  display: flex;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>