<template>
  <div class="team-member-list">
    <div class="member-list-header">
      <h3>团队成员 ({{ members.length }})</h3>
      <el-button type="primary" size="small" @click="showInviteDialog = true">
        <el-icon><Plus /></el-icon>
        邀请成员
      </el-button>
    </div>

    <el-table :data="members" stripe style="width: 100%">
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
          <el-tag :type="getRoleColor(row.role)" size="small">
            {{ getRoleLabel(row.role) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="加入时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.joinedAt) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="150" align="right">
        <template #default="{ row }">
          <el-button
            v-if="canManageMember(row)"
            type="primary"
            size="small"
            text
            @click="handleUpdateRole(row)"
          >
            更新角色
          </el-button>
          <el-button
            v-if="canRemoveMember(row)"
            type="danger"
            size="small"
            text
            @click="handleRemoveMember(row)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 邀请成员对话框 -->
    <el-dialog
      v-model="showInviteDialog"
      title="邀请成员"
      width="500px"
      @close="resetInviteForm"
    >
      <el-form :model="inviteForm" :rules="inviteRules" ref="inviteFormRef" label-width="80px">
        <el-form-item label="邮箱" prop="emails">
          <el-select
            v-model="inviteForm.emails"
            multiple
            filterable
            allow-create
            placeholder="请输入邮箱地址"
            style="width: 100%"
          >
            <el-option
              v-for="email in inviteForm.emails"
              :key="email"
              :label="email"
              :value="email"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="inviteForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showInviteDialog = false">取消</el-button>
        <el-button type="primary" @click="handleInvite" :loading="inviting">
          邀请
        </el-button>
      </template>
    </el-dialog>

    <!-- 更新角色对话框 -->
    <el-dialog
      v-model="showRoleDialog"
      title="更新成员角色"
      width="400px"
    >
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="成员">
          <span>{{ currentMember?.user?.username }}</span>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="roleForm.role" style="width: 100%">
            <el-option label="成员" value="member" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showRoleDialog = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmUpdateRole" :loading="updating">
          更新
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { type TeamMember, TeamMemberRole, TeamMemberRoleLabels, TeamMemberRoleColors } from '../types/team';
import teamService from '../services/team.service';
import { useUserStore } from '../stores/user';

interface Props {
  teamId: string;
  ownerId: string;
  members: TeamMember[];
}

interface Emits {
  (e: 'update:members', members: TeamMember[]): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const userStore = useUserStore();
const currentUserId = computed(() => userStore.user?.id);

// 邀请成员相关
const showInviteDialog = ref(false);
const inviteFormRef = ref();
const inviting = ref(false);
const inviteForm = ref({
  emails: [] as string[],
  role: TeamMemberRole.MEMBER,
});

const inviteRules = {
  emails: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'array', min: 1, message: '至少选择一个邮箱', trigger: 'change' },
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
};

// 更新角色相关
const showRoleDialog = ref(false);
const currentMember = ref<TeamMember | null>(null);
const updating = ref(false);
const roleForm = ref({
  role: TeamMemberRole.MEMBER,
});

// 获取角色标签
const getRoleLabel = (role: TeamMemberRole): string => {
  return TeamMemberRoleLabels[role];
};

// 获取角色颜色
const getRoleColor = (role: TeamMemberRole): string => {
  return TeamMemberRoleColors[role];
};

// 格式化日期
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN');
};

// 检查是否可以管理成员
const canManageMember = (member: TeamMember): boolean => {
  return props.ownerId === currentUserId.value && member.userId !== props.ownerId;
};

// 检查是否可以移除成员
const canRemoveMember = (member: TeamMember): boolean => {
  return props.ownerId === currentUserId.value && member.userId !== props.ownerId;
};

// 重置邀请表单
const resetInviteForm = () => {
  inviteForm.value = {
    emails: [],
    role: TeamMemberRole.MEMBER,
  };
  inviteFormRef.value?.clearValidate();
};

// 邀请成员
const handleInvite = async () => {
  const valid = await inviteFormRef.value?.validate().catch(() => false);
  if (!valid) return;

  inviting.value = true;
  try {
    const newMembers = await teamService.inviteMembers(props.teamId, inviteForm.value);
    emit('update:members', [...props.members, ...newMembers]);
    ElMessage.success('邀请成功');
    showInviteDialog.value = false;
    resetInviteForm();
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '邀请失败');
  } finally {
    inviting.value = false;
  }
};

// 更新成员角色
const handleUpdateRole = (member: TeamMember) => {
  currentMember.value = member;
  roleForm.value.role = member.role;
  showRoleDialog.value = true;
};

// 确认更新角色
const handleConfirmUpdateRole = async () => {
  if (!currentMember.value) return;

  updating.value = true;
  try {
    const updatedMember = await teamService.updateMemberRole(
      props.teamId,
      currentMember.value.userId,
      roleForm.value
    );
    const index = props.members.findIndex(m => m.id === currentMember.value?.id);
    if (index !== -1) {
      const updatedMembers = [...props.members];
      updatedMembers[index] = updatedMember;
      emit('update:members', updatedMembers);
    }
    ElMessage.success('角色更新成功');
    showRoleDialog.value = false;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新失败');
  } finally {
    updating.value = false;
  }
};

// 移除成员
const handleRemoveMember = async (member: TeamMember) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 ${member.user?.username} 吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await teamService.removeMember(props.teamId, member.userId);
    const updatedMembers = props.members.filter(m => m.id !== member.id);
    emit('update:members', updatedMembers);
    ElMessage.success('移除成功');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '移除失败');
    }
  }
};
</script>

<style scoped>
.team-member-list {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.member-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.member-list-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-details {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.member-email {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}
</style>