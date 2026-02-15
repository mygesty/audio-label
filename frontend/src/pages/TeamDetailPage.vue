<template>
  <div class="team-detail-page">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Audio Label Pro</h1>
        </div>
        <nav class="nav">
          <router-link to="/" class="nav-link">首页</router-link>
          <router-link to="/teams" class="nav-link active">团队管理</router-link>
          <router-link to="/projects" class="nav-link">项目管理</router-link>
          <router-link to="/audio-list" class="nav-link">音频列表</router-link>
          <router-link to="/tasks" class="nav-link">任务管理</router-link>
        </nav>
        <div class="user-actions">
          <el-dropdown trigger="click">
            <div class="user-avatar">
              <el-avatar :size="40" :src="userStore.user?.avatarUrl">
                {{ userStore.user?.username?.charAt(0).toUpperCase() }}
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人设置</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" v-loading="loading">
      <div class="page-header">
        <el-button text @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <div class="header-actions" v-if="team && canEditTeam">
          <el-button @click="showEditDialog = true">编辑团队</el-button>
          <el-button type="danger" @click="handleDeleteTeam">删除团队</el-button>
        </div>
      </div>

    <template v-if="team">
      <el-card class="team-info-card">
        <div class="team-info-header">
          <h1 class="team-name">{{ team.name }}</h1>
          <el-tag v-if="team.ownerId === currentUserId" type="warning">所有者</el-tag>
        </div>
        <p class="team-description">{{ team.description || '暂无描述' }}</p>
        <div class="team-meta">
          <div class="meta-item">
            <el-icon><User /></el-icon>
            <span>所有者：{{ team.owner?.username }}</span>
          </div>
          <div class="meta-item">
            <el-icon><Calendar /></el-icon>
            <span>创建时间：{{ formatDate(team.createdAt) }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="members-card">
        <TeamMemberList
          :team-id="team.id"
          :owner-id="team.ownerId"
          :members="team.teamMembers || []"
          @update:members="handleUpdateMembers"
        />
      </el-card>
    </template>

    <!-- 编辑团队对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑团队"
      width="500px"
      @close="resetEditForm"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item label="团队名称" prop="name">
          <el-input
            v-model="editForm.name"
            placeholder="请输入团队名称"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="团队描述" prop="description">
          <el-input
            v-model="editForm.description"
            type="textarea"
            placeholder="请输入团队描述（可选）"
            :rows="4"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateTeam" :loading="updating">
          保存
        </el-button>
      </template>
    </el-dialog>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowLeft, User, Calendar } from '@element-plus/icons-vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { Team, TeamMember, UpdateTeamRequest } from '../types/team';
import teamService from '../services/team.service';
import { useUserStore } from '../stores/user';
import TeamMemberList from '../components/TeamMemberList.vue';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const currentUserId = computed(() => userStore.user?.id);

const loading = ref(false);
const team = ref<Team | null>(null);
const showEditDialog = ref(false);
const updating = ref(false);
const editFormRef = ref<FormInstance>();

const editForm = reactive<UpdateTeamRequest>({
  name: '',
  description: '',
});

const editRules: FormRules = {
  name: [
    { required: true, message: '请输入团队名称', trigger: 'blur' },
    { min: 2, max: 255, message: '团队名称长度在 2 到 255 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 1000, message: '团队描述不能超过 1000 个字符', trigger: 'blur' },
  ],
};

// 检查是否可以编辑团队
const canEditTeam = computed(() => {
  return team.value?.ownerId === currentUserId.value;
});

// 格式化日期
const formatDate = (date: string): string => {
  return new Date(date).toLocaleString('zh-CN');
};

// 加载团队详情
const loadTeamDetail = async () => {
  const teamId = route.params.id as string;
  if (!teamId) {
    ElMessage.error('团队 ID 不存在');
    router.push('/teams');
    return;
  }

  loading.value = true;
  try {
    team.value = await teamService.getTeamDetail(teamId);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '加载团队详情失败');
    router.push('/teams');
  } finally {
    loading.value = false;
  }
};

// 重置编辑表单
const resetEditForm = () => {
  if (team.value) {
    editForm.name = team.value.name;
    editForm.description = team.value.description || '';
  }
  editFormRef.value?.clearValidate();
};

// 更新团队
const handleUpdateTeam = async () => {
  if (!editFormRef.value || !team.value) return;

  const valid = await editFormRef.value.validate().catch(() => false);
  if (!valid) return;

  updating.value = true;
  try {
    const updatedTeam = await teamService.updateTeam(team.value.id, editForm);
    team.value = updatedTeam;
    ElMessage.success('团队信息更新成功');
    showEditDialog.value = false;
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新团队失败');
  } finally {
    updating.value = false;
  }
};

// 删除团队
const handleDeleteTeam = async () => {
  if (!team.value) return;

  try {
    await ElMessageBox.confirm(
      `确定要删除团队 "${team.value.name}" 吗？删除后无法恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );

    await teamService.deleteTeam(team.value.id);
    ElMessage.success('团队删除成功');
    router.push('/teams');
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除团队失败');
    }
  }
};

// 更新成员列表
const handleUpdateMembers = (members: TeamMember[]) => {
  if (team.value) {
    team.value.teamMembers = members;
  }
};

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  ElMessage.success('已退出登录')
}

onMounted(() => {
  loadTeamDetail();
});
</script>

<style scoped>
.team-detail-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.header {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.nav {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
  padding: 8px 0;

  &:hover,
  &.active {
    color: var(--primary-color);
  }
}

.user-avatar {
  cursor: pointer;
}

.main-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 48px 32px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.team-info-card,
.members-card {
  margin-bottom: 24px;
}

.team-info-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.team-name {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.team-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.team-meta {
  display: flex;
  gap: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #999;
}

.meta-item .el-icon {
  font-size: 16px;
}
</style>