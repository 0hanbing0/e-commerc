import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type {
  SalesTrendItem,
  CategoryItem,
  OrderItem,
  UserProfileItem,
  TopProductItem,
  DashboardSummary,
  ScrollingItem,
  RequestError,
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

export type TimePeriod = 'today' | 'week' | 'month'

export const useDashboardStore = defineStore('dashboard', () => {
  let eventSeq = 100
  const nextEventId = () => eventSeq++

  // ===== 数据状态 =====
  const summary = ref<DashboardSummary>({ ...summaryData })
  const salesTrend = ref<SalesTrendItem[]>([...salesTrendData])
  const categories = ref<CategoryItem[]>([...categoryData])
  const orderFlow = ref<OrderItem[]>([...orderFlowData])
  const userProfile = ref<UserProfileItem[]>([...userProfileData])
  const topProducts = ref<TopProductItem[]>([...topProductsData])
  const scrollingLogs = ref<ScrollingItem[]>([...scrollingData])

  // ===== UI 状态 =====
  const loading = ref(false)
  const error = ref<RequestError | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const period = ref<TimePeriod>('today')

  // ===== 数据对比模式 =====
  const comparisonMode = ref(false)
  const comparisonSnapshot = ref<DashboardSummary | null>(null)

  const toggleComparison = () => {
    comparisonMode.value = !comparisonMode.value
    if (comparisonMode.value) {
      comparisonSnapshot.value = { ...summary.value }
    } else {
      comparisonSnapshot.value = null
    }
  }

  const comparisonDelta = computed(() => {
    if (!comparisonSnapshot.value) return null
    const snap = comparisonSnapshot.value
    const cur = summary.value
    return {
      totalSales: cur.totalSales - snap.totalSales,
      totalOrders: cur.totalOrders - snap.totalOrders,
      totalUsers: cur.totalUsers - snap.totalUsers,
      conversionRate: Number((cur.conversionRate - snap.conversionRate).toFixed(2)),
    }
  })

  // ===== 时间范围切换 =====
  const periodMultiplier = computed(() => {
    switch (period.value) {
      case 'today': return 1
      case 'week': return 7
      case 'month': return 30
      default: return 1
    }
  })

  const generateTrendData = (p: TimePeriod): SalesTrendItem[] => {
    switch (p) {
      case 'today':
        return Array.from({ length: 24 }, (_, i) => ({
          date: `${String(i).padStart(2, '0')}:00`,
          amount: Math.floor(50000 + Math.random() * 80000),
          orderCount: Math.floor(200 + Math.random() * 600),
        }))
      case 'week': {
        const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
        return dayNames.map((d) => ({
          date: d,
          amount: Math.floor(350000 + Math.random() * 560000),
          orderCount: Math.floor(1400 + Math.random() * 4200),
        }))
      }
      case 'month':
        return Array.from({ length: 30 }, (_, i) => ({
          date: `${i + 1}日`,
          amount: Math.floor(150000 + Math.random() * 240000),
          orderCount: Math.floor(600 + Math.random() * 1800),
        }))
    }
  }

  const setPeriod = (p: TimePeriod) => {
    period.value = p
    // 切换周期时重新生成对应粒度的趋势数据
    salesTrend.value = generateTrendData(p)
    // 重置汇总数据锚点
    const mult = periodMultiplier.value
    summary.value = {
      ...summaryData,
      totalSales: Math.floor(summaryData.totalSales * mult * (0.85 + Math.random() * 0.3)),
      totalOrders: Math.floor(summaryData.totalOrders * mult * (0.85 + Math.random() * 0.3)),
      totalUsers: Math.floor(summaryData.totalUsers * mult * (0.85 + Math.random() * 0.3)),
    }
  }

  // ===== 刷新 =====
  const refresh = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      // --- Mock 路径：模拟延迟 + 随机波动 ---
      await new Promise((r) => setTimeout(r, 400))

      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

      // 1. 指标卡数据波动（基础值 × 时间周期倍数）
      const mult = periodMultiplier.value
      const baseSales = summaryData.totalSales * mult
      const baseOrders = summaryData.totalOrders * mult
      const baseUsers = summaryData.totalUsers * mult
      summary.value.totalSales = Math.max(0, summary.value.totalSales + Math.floor(Math.random() * 12000 - 5000))
      summary.value.totalOrders = Math.max(0, summary.value.totalOrders + Math.floor(Math.random() * 20 - 8))
      summary.value.totalUsers = Math.max(0, summary.value.totalUsers + Math.floor(Math.random() * 12 - 4))
      // 时间周期切换时重新以基数为锚点收敛
      if (Math.abs(summary.value.totalSales - baseSales) > baseSales * 0.5) {
        summary.value.totalSales = Math.floor(baseSales * (0.85 + Math.random() * 0.3))
      }
      if (Math.abs(summary.value.totalOrders - baseOrders) > baseOrders * 0.5) {
        summary.value.totalOrders = Math.floor(baseOrders * (0.85 + Math.random() * 0.3))
      }
      if (Math.abs(summary.value.totalUsers - baseUsers) > baseUsers * 0.5) {
        summary.value.totalUsers = Math.floor(baseUsers * (0.85 + Math.random() * 0.3))
      }
      summary.value.conversionRate = Number(
        clamp(summary.value.conversionRate + (Math.random() - 0.5) * 0.15, 0.5, 30).toFixed(2),
      )
      summary.value.salesGrowth = Number(clamp(summary.value.salesGrowth + (Math.random() - 0.5) * 0.8, -30, 30).toFixed(1))
      summary.value.orderGrowth = Number(clamp(summary.value.orderGrowth + (Math.random() - 0.5) * 0.6, -30, 30).toFixed(1))
      summary.value.userGrowth = Number(clamp(summary.value.userGrowth + (Math.random() - 0.5) * 0.5, -30, 30).toFixed(1))
      summary.value.conversionGrowth = Number(clamp(summary.value.conversionGrowth + (Math.random() - 0.5) * 0.3, -30, 30).toFixed(1))

      // 2. 销售趋势 —— 根据周期模式更新
      if (period.value === 'today') {
        // 小时模式：推进一个时间点
        const shifted = [...salesTrend.value.slice(1)]
        const lastDate = shifted[shifted.length - 1].date
        const nextHour = String((parseInt(lastDate, 10) + 1) % 24).padStart(2, '0')
        shifted.push({
          date: `${nextHour}:00`,
          amount: Math.max(0, salesTrend.value[salesTrend.value.length - 1].amount + Math.floor(Math.random() * 8000 - 4000)),
          orderCount: Math.max(0, salesTrend.value[salesTrend.value.length - 1].orderCount + Math.floor(Math.random() * 50 - 25)),
        })
        salesTrend.value = shifted.map((item, i, arr) => {
          if (i < arr.length - 3) return item
          return {
            ...item,
            amount: Math.max(0, item.amount + Math.floor(Math.random() * 6000 - 3000)),
            orderCount: Math.max(0, item.orderCount + Math.floor(Math.random() * 40 - 20)),
          }
        })
      } else {
        // 周/月模式：随机扰动所有数据点
        salesTrend.value = salesTrend.value.map((item) => ({
          ...item,
          amount: Math.max(0, item.amount + Math.floor(Math.random() * 20000 - 10000)),
          orderCount: Math.max(0, item.orderCount + Math.floor(Math.random() * 120 - 60)),
        }))
      }

      // 3. 品类占比微调
      categories.value = categories.value.map((c) => ({
        ...c,
        value: Math.max(2, c.value + Math.floor(Math.random() * 5 - 2)),
        growth: Number(clamp(c.growth + (Math.random() - 0.5) * 0.6, -30, 30).toFixed(1)),
      }))

      // 4. 用户画像微调
      userProfile.value = userProfile.value.map((d) => ({
        ...d,
        value: Math.min(d.max, Math.max(5, d.value + Math.floor(Math.random() * 6 - 3))),
      }))

      // 5. 热销排行微调
      topProducts.value = topProducts.value.map((p) => ({
        ...p,
        sales: Math.max(0, p.sales + Math.floor(Math.random() * 300 - 150)),
        trend: Number(clamp(p.trend + (Math.random() - 0.5) * 1.2, -30, 30).toFixed(1)),
      }))

      // 6. 随机刷新订单流中的一条记录（仅更新时间，保留 ID 以维持 Vue key 稳定）
      if (orderFlow.value.length > 0) {
        const idx = Math.floor(Math.random() * orderFlow.value.length)
        const now = new Date()
        orderFlow.value[idx] = {
          ...orderFlow.value[idx],
          time: now.toTimeString().slice(0, 8),
        }
      }

      // 7. 随机追加一条滚动事件
      const now = new Date()
      const nowStr = now.toTimeString().slice(0, 8)
      const events: ScrollingItem[] = [
        { id: nextEventId(), event: '新订单', detail: '用户下单完成，金额 ¥1,299', time: nowStr },
        { id: nextEventId(), event: '支付成功', detail: '微信支付回调确认', time: nowStr },
        { id: nextEventId(), event: '库存更新', detail: 'SKU-23891 库存补充 200 件', time: nowStr },
      ]
      const newEvent = events[Math.floor(Math.random() * events.length)]
      scrollingLogs.value = [newEvent, ...scrollingLogs.value.slice(0, 7)]

      lastUpdated.value = new Date()
    } catch (err) {
      error.value = {
        code: (err as RequestError).code ?? -1,
        message: (err as RequestError).message ?? '数据刷新失败',
        data: null,
      }
    } finally {
      loading.value = false
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    summary.value = { ...summaryData }
    salesTrend.value = [...salesTrendData]
    categories.value = [...categoryData]
    orderFlow.value = [...orderFlowData]
    userProfile.value = [...userProfileData]
    topProducts.value = [...topProductsData]
    scrollingLogs.value = [...scrollingData]
    loading.value = false
    error.value = null
    lastUpdated.value = null
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
    error,
    lastUpdated,
    period,
    periodMultiplier,
    comparisonMode,
    comparisonSnapshot,
    comparisonDelta,
    toggleComparison,
    refresh,
    clearError,
    reset,
    setPeriod,
  }
})
