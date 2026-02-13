import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '../services'

export interface User {
  id: string
  email: string
  username: string
  role: 'annotator' | 'reviewer' | 'project_admin' | 'system_admin'
  avatarUrl?: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value)
    const isAdmin = computed(() => user.value?.role === 'system_admin' || user.value?.role === 'project_admin')
    const isReviewer = computed(() => user.value?.role === 'reviewer' || isAdmin.value)
    const isAnnotator = computed(() => user.value?.role === 'annotator')

    // 初始化时从 localStorage 加载用户信息
    function initFromStorage() {
      const storedUser = authService.getStoredUser()
      if (storedUser) {
        user.value = storedUser
      }
      token.value = localStorage.getItem('access_token')
    }

    function setUser(userData: User) {
      user.value = userData
    }

    function setToken(newToken: string) {
      token.value = newToken
    }

    function logout() {
      user.value = null
      token.value = null
      authService.logout()
    }

    // 调用初始化
    initFromStorage()

    return {
      user,
      token,
      isAuthenticated,
      isAdmin,
      isReviewer,
      isAnnotator,
      initFromStorage,
      setUser,
      setToken,
      logout,
    }
  }
)