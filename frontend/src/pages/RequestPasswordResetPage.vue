<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="reset-header">
        <h1 class="reset-title">忘记密码</h1>
        <p class="reset-subtitle">输入您的邮箱地址，我们将发送重置密码的链接</p>
      </div>

      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        class="reset-form"
        @submit.prevent="handleRequestReset"
      >
        <el-form-item prop="email">
          <el-input
            v-model="resetForm.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleRequestReset"
            style="width: 100%"
          >
            {{ loading ? '发送中...' : '发送重置链接' }}
          </el-button>
        </el-form-item>

        <div class="reset-footer">
          <router-link to="/login">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { authService } from '@/services'

const router = useRouter()

const resetFormRef = ref<FormInstance>()
const loading = ref(false)

const resetForm = reactive({
  email: '',
})

const resetRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
}

const handleRequestReset = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    loading.value = true

    await authService.requestPasswordReset({
      email: resetForm.email,
    })

    ElMessage.success('如果该邮箱已注册，重置链接已发送到您的邮箱')
  } catch (error: any) {
    console.error('Password reset request error:', error)
    const errorMessage = error.response?.data?.message || '请求失败，请稍后重试'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.reset-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--background-color) 0%, #d1fae5 100%);
}

.reset-card {
  width: 100%;
  max-width: 420px;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.reset-header {
  text-align: center;
  margin-bottom: 40px;
}

.reset-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 12px 0;
}

.reset-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

.reset-form {
  margin-top: 32px;
}

.reset-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: #6b7280;

  .el-link {
    margin-left: 4px;
  }
}
</style>