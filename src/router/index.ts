import { createRouter, createWebHistory } from 'vue-router'

const HISTORY = createWebHistory(import.meta.env.BASE_URL)

const router = createRouter({
  history: HISTORY,
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      // 子路由预留给后续扩展页面
    },
  ],
})

// ===== 全局前置守卫 =====
router.beforeEach((to, _from, next) => {
  // 页面标题
  document.title = (to.meta.title as string) ?? '电商数据大屏'
  next()
})

// ===== 懒加载 chunk 失败重试 =====
// 部署新版本后旧 hash chunk 404 时, 刷新页面重新拉取
router.onError((error) => {
  const chunkFailed = /Loading chunk .* failed/i
  if (chunkFailed.test(error.message)) {
    const isFirstRetry = !sessionStorage.getItem('chunk-retry')
    if (isFirstRetry) {
      sessionStorage.setItem('chunk-retry', '1')
      window.location.reload()
      return
    }
    sessionStorage.removeItem('chunk-retry')
  }
  console.error('[Router] 路由异常:', error)
})

export default router
