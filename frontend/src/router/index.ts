import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/HomePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/LoginPage.vue'),
    meta: { public: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/RegisterPage.vue'),
    meta: { public: true },
  },
  {
    path: '/request-password-reset',
    name: 'RequestPasswordReset',
    component: () => import('@/pages/RequestPasswordResetPage.vue'),
    meta: { public: true },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/pages/ResetPasswordPage.vue'),
    meta: { public: true },
  },
  {
    path: '/audio-list',
    name: 'AudioList',
    component: () => import('@/pages/AudioListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/annotation/:audioId',
    name: 'Annotation',
    component: () => import('@/pages/AnnotationPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/review/:audioId',
    name: 'Review',
    component: () => import('@/pages/ReviewPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: () => import('@/pages/TaskListPage.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard for authentication
router.beforeEach(async (to, _from, next) => {
  // 初始化 userStore
  const userStore = (await import('@/stores/user')).useUserStore()
  userStore.initFromStorage()

  const isPublic = to.meta.public === true
  const isAuthenticated = userStore.isAuthenticated

  if (!isPublic && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router