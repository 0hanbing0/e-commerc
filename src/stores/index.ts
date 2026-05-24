import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  SalesTrendItem,
  CategoryItem,
  OrderItem,
  UserProfileItem,
  TopProductItem,
  DashboardSummary,
  ScrollingItem,
} from '@/types'
import {
  salesTrendData,
  categoryData,
  orderFlowData,
  userProfileData,
  topProductsData,
  summaryData,
  scrollingData,
} from '@/mock/dashboard'

// 仪表盘数据中心 —— 所有图表组件共享这一份数据源
// 每个图表的数据独立 ref，组件通过 storeToRefs 解构保持响应性
// 未来接入真实 API 时，只需修改 refresh 内部的调用，组件层零改动

export const useDashboardStore = defineStore('dashboard', () => {
  // ===== 状态 =====
  const summary = ref<DashboardSummary>(summaryData)
  const salesTrend = ref<SalesTrendItem[]>(salesTrendData)
  const categories = ref<CategoryItem[]>(categoryData)
  const orderFlow = ref<OrderItem[]>(orderFlowData)
  const userProfile = ref<UserProfileItem[]>(userProfileData)
  const topProducts = ref<TopProductItem[]>(topProductsData)
  const scrollingLogs = ref<ScrollingItem[]>(scrollingData)

  const loading = ref(false)

  // 模拟实时刷新 —— 仅微调销售额和订单量制造"实时感"
  const refresh = async () => {
    loading.value = true
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 600))
    // 数据做 ±5000 的随机波动
    summary.value.totalSales += Math.floor(Math.random() * 10000 - 5000)
    summary.value.totalOrders += Math.floor(Math.random() * 20 - 10)
    loading.value = false
  }

  return {
    summary,
    salesTrend,
    categories,
    orderFlow,
    userProfile,
    topProducts,
    scrollingLogs,
    loading,
    refresh,
  }
})
