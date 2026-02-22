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
    path: '/teams',
    name: 'Teams',
    component: () => import('@/pages/TeamListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/teams/create',
    name: 'TeamCreate',
    component: () => import('@/pages/TeamCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/teams/:id',
    name: 'TeamDetail',
    component: () => import('@/pages/TeamDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects',
    name: 'Projects',
    component: () => import('@/pages/ProjectListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/create',
    name: 'ProjectCreate',
    component: () => import('@/pages/ProjectCreatePage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/projects/:id',
    name: 'ProjectDetail',
    component: () => import('@/pages/ProjectDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/audio-list',
    name: 'AudioList',
    component: () => import('@/pages/AudioListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/annotation',
    name: 'Annotation',
    component: () => import('@/pages/AnnotationPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/review',
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

import { useUserStore } from '@/stores/user'

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  // 初始化 userStore
  const userStore = useUserStore()
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