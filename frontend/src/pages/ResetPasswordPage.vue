<template>
  <div class="reset-container">
    <div class="reset-card">
      <div class="reset-header">
        <h1 class="reset-title">重置密码</h1>
        <p class="reset-subtitle">请输入您的新密码</p>
      </div>

      <el-form
        ref="resetFormRef"
        :model="resetForm"
        :rules="resetRules"
        class="reset-form"
        @submit.prevent="handleResetPassword"
      >
        <el-form-item prop="password">
          <el-input
            v-model="resetForm.password"
            type="password"
            placeholder="请输入新密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="resetForm.confirmPassword"
            type="password"
            placeholder="请确认新密码"
            prefix-icon="Lock"
            size="large"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleResetPassword"
            style="width: 100%"
          >
            {{ loading ? '重置中...' : '重置密码' }}
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
import { reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { authService } from '@/services'

const router = useRouter()
const route = useRoute()

const resetFormRef = ref<FormInstance>()
const loading = ref(false)
const resetToken = ref('')

const resetForm = reactive({
  password: '',
  confirmPassword: '',
})

const resetRules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: '密码必须包含至少一个大写字母、一个小写字母和一个数字',
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== resetForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

onMounted(() => {
  // Get token from URL query parameters
  const token = route.query.token as string
  if (!token) {
    ElMessage.error('重置链接无效或已过期')
    router.push('/login')
  } else {
    resetToken.value = token
  }
})

const handleResetPassword = async () => {
  if (!resetFormRef.value || !resetToken.value) return

  try {
    // 先验证表单
    const isValid = await resetFormRef.value.validate().catch(() => false)
    if (!isValid) {
      ElMessage.warning('请检查输入的密码格式')
      return
    }

    loading.value = true

    await authService.resetPassword({
      token: resetToken.value,
      password: resetForm.password,
    })

    ElMessage.success('密码重置成功，请使用新密码登录')
    // 清空表单
    resetForm.password = ''
    resetForm.confirmPassword = ''
    router.push('/login')
  } catch (error: any) {
    console.error('Password reset error:', error)
    console.error('Error response:', error.response)
    console.error('Error data:', error.response?.data)
    
    // 获取错误消息
    let errorMessage = '重置失败，请稍后重试'
    
    if (error.response) {
      // 服务器返回的错误
      if (error.response.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error
      } else if (error.response.statusText) {
        errorMessage = `服务器错误: ${error.response.statusText}`
      }
    } else if (error.message) {
      // 网络或其他错误
      errorMessage = error.message
    }
    
    ElMessage.error(errorMessage)
    
    // 不要清空表单，让用户可以修改后重试
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