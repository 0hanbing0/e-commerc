import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/dashboard/DashboardView.vue'),
      // 子路由预留给后续扩展页面（如 /detail、/settings 等）
    },
  ],
})

export default router
