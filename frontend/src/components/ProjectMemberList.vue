<template>
  <div class="project-member-list">
    <div class="list-header">
      <h3 class="list-title">项目成员</h3>
      <el-button type="primary" size="small" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加成员
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="members"
      stripe
      style="width: 100%"
    >
      <el-table-column label="成员" min-width="200">
        <template #default="{ row }">
          <div class="member-info">
            <el-avatar :size="32" :src="row.user?.avatarUrl">
              {{ row.user?.username?.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="member-details">
              <div class="member-name">{{ row.user?.username }}</div>
              <div class="member-email">{{ row.user?.email }}</div>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="角色" width="120">
        <template #default="{ row }">
          <el-tag :type="getRoleType(row.role)" size="small">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="加入时间" width="150">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click="handleEditRole(row)"
          >
            编辑角色
          </el-button>
          <el-button
            type="danger"
            link
            size="small"
            @click="handleRemove(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- Add Member Dialog -->
    <el-dialog
      v-model="showAddDialog"
      title="添加成员"
      width="500px"
      @close="resetAddForm"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        label-width="100px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="addForm.userId"
            placeholder="请输入用户ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="addForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAddMember">
          添加
        </el-button>
      </template>
    </el-dialog>

    <!-- Edit Role Dialog -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑成员角色"
      width="400px"
      @close="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editFormRules"
        label-width="80px"
      >
        <el-form-item label="角色" prop="role">
          <el-select v-model="editForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleUpdateRole">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { projectService } from '@/services/project.service'
import type { ProjectMember, AddProjectMemberRequest, UpdateProjectMemberRequest } from '@/types/project'

interface Props {
  projectId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  refresh: []
}>()

// 状态
const loading = ref(false)
const submitting = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const currentMember = ref<ProjectMember | null>(null)

// 数据
const members = ref<ProjectMember[]>([])

// 添加成员表单
const addFormRef = ref<FormInstance>()
const addForm = reactive({
  userId: '',
  role: 'member',
})

const addFormRules: FormRules = {
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
}

// 编辑角色表单
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  role: 'member',
})

const editFormRules: FormRules = {
  role: [
    { required: true, message: '请选择角色', trigger: 'change' },
  ],
}

// 方法
const loadMembers = async () => {
  loading.value = true
  try {
    const response = await projectService.getProjectMembers(props.projectId)
    members.value = response.data || response
  } catch (error: any) {
    ElMessage.error(error.message || '加载成员列表失败')
  } finally {
    loading.value = false
  }
}

const handleAddMember = async () => {
  if (!addFormRef.value) return

  try {
    await addFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data: AddProjectMemberRequest = {
      userId: addForm.userId,
      role: addForm.role as any,
    }
    
    await projectService.addProjectMember(props.projectId, data)
    ElMessage.success('添加成功')
    showAddDialog.value = false
    loadMembers()
    emit('refresh')
  } catch (error: any) {
    ElMessage.error(error.message || '添加失败')
  } finally {
    submitting.value = false
  }
}

const handleEditRole = (member: ProjectMember) => {
  currentMember.value = member
  editForm.role = member.role
  showEditDialog.value = true
}

const handleUpdateRole = async () => {
  if (!editFormRef.value || !currentMember.value) return

  try {
    await editFormRef.value.validate()
  } catch {
    return
  }

  submitting.value = true
  try {
    const data: UpdateProjectMemberRequest = {
      role: editForm.role as any,
    }
    
    await projectService.updateProjectMemberRole(
      props.projectId,
      currentMember.value.userId,
      data,
    )
    ElMessage.success('更新成功')
    showEditDialog.value = false
    loadMembers()
    emit('refresh')
  } catch (error: any) {
    ElMessage.error(error.message || '更新失败')
  } finally {
    submitting.value = false
  }
}

const handleRemove = async (member: ProjectMember) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 "${member.user?.username}" 吗？`,
      '确认移除',
      {
        type: 'warning',
      },
    )

    await projectService.removeProjectMember(props.projectId, member.userId)
    ElMessage.success('移除成功')
    loadMembers()
    emit('refresh')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '移除失败')
    }
  }
}

const resetAddForm = () => {
  addForm.userId = ''
  addForm.role = 'member'
  addFormRef.value?.resetFields()
}

const resetEditForm = () => {
  editForm.role = 'member'
  currentMember.value = null
  editFormRef.value?.resetFields()
}

const getRoleType = (role: string) => {
  switch (role) {
    case 'admin':
      return 'danger'
    case 'member':
      return 'info'
    default:
      return 'info'
  }
}

const getRoleText = (role: string) => {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'member':
      return '成员'
    default:
      return role
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 生命周期
onMounted(() => {
  loadMembers()
})
</script>

<style scoped lang="scss">
.project-member-list {
  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .list-title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
  }

  .member-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .member-details {
    flex: 1;
  }

  .member-name {
    font-size: 14px;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 2px;
  }

  .member-email {
    font-size: 12px;
    color: #9ca3af;
  }
}
</style>