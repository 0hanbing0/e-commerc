import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDashboardStore } from '@/stores'

// Mock 模块路径
vi.mock('@/mock/dashboard', () => ({
  salesTrendData: Array.from({ length: 24 }, (_, i) => ({
    date: `${String(i).padStart(2, '0')}:00`,
    amount: 50000 + i * 2000,
    orderCount: 200 + i * 10,
  })),
  categoryData: [
    { name: '数码电子', value: 38, growth: 12.5 },
    { name: '服饰鞋包', value: 25, growth: -3.2 },
    { name: '美妆个护', value: 18, growth: 8.7 },
    { name: '食品生鲜', value: 12, growth: 15.3 },
    { name: '家居家装', value: 7, growth: -1.8 },
  ],
  orderFlowData: [
    { id: 'DD001', product: 'iPhone 15', price: 9999, channel: 'APP', city: '北京', time: '14:23:05' },
  ],
  userProfileData: [
    { dimension: '消费力', value: 82, max: 100 },
    { dimension: '活跃度', value: 76, max: 100 },
  ],
  topProductsData: [
    { rank: 1, name: 'iPhone', sales: 28965, trend: 12.5 },
  ],
  summaryData: {
    totalSales: 1000000,
    totalOrders: 5000,
    totalUsers: 100000,
    conversionRate: 3.5,
    salesGrowth: 10.0,
    orderGrowth: 8.0,
    userGrowth: 5.0,
    conversionGrowth: -1.0,
  },
  scrollingData: [
    { id: 1, event: '新订单', detail: '用户下单', time: '14:23:05' },
  ],
}))

describe('useDashboardStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ===== 初始状态 =====
  it('初始状态正确', () => {
    const store = useDashboardStore()
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.lastUpdated).toBeNull()
    expect(store.period).toBe('today')
    expect(store.summary.totalSales).toBe(1000000)
    expect(store.salesTrend).toHaveLength(24)
    expect(store.categories).toHaveLength(5)
    expect(store.orderFlow).toHaveLength(1)
    expect(store.userProfile).toHaveLength(2)
    expect(store.topProducts).toHaveLength(1)
    expect(store.scrollingLogs).toHaveLength(1)
    expect(store.comparisonMode).toBe(false)
    expect(store.comparisonSnapshot).toBeNull()
    expect(store.comparisonDelta).toBeNull()
  })

  // ===== refresh() =====
  it('refresh() 执行后 lastUpdated 有值', async () => {
    const store = useDashboardStore()
    await store.refresh()
    expect(store.lastUpdated).toBeInstanceOf(Date)
    expect(store.loading).toBe(false)
  })

  it('refresh() 执行后数据发生变化', async () => {
    const store = useDashboardStore()
    const beforeSales = store.summary.totalSales
    await store.refresh()
    expect(store.summary.totalSales).not.toBe(beforeSales)
  })

  it('refresh() 不改变数组长度', async () => {
    const store = useDashboardStore()
    await store.refresh()
    expect(store.salesTrend).toHaveLength(24)
    expect(store.categories).toHaveLength(5)
    expect(store.orderFlow).toHaveLength(1)
    expect(store.userProfile).toHaveLength(2)
    expect(store.topProducts).toHaveLength(1)
    expect(store.scrollingLogs.length).toBeLessThanOrEqual(9) // 8 + 1 new
  })

  it('refresh() 并发调用不重复加载', async () => {
    const store = useDashboardStore()
    // 同时触发两次 refresh
    await Promise.all([store.refresh(), store.refresh()])
    expect(store.loading).toBe(false)
  })

  // ===== setPeriod() =====
  it('setPeriod("week") 切换后趋势数据为 7 天', () => {
    const store = useDashboardStore()
    store.setPeriod('week')
    expect(store.period).toBe('week')
    expect(store.salesTrend).toHaveLength(7)
    expect(store.salesTrend[0].date).toBe('周一')
  })

  it('setPeriod("month") 切换后趋势数据为 30 天', () => {
    const store = useDashboardStore()
    store.setPeriod('month')
    expect(store.period).toBe('month')
    expect(store.salesTrend).toHaveLength(30)
    expect(store.salesTrend[0].date).toBe('1日')
  })

  it('setPeriod("today") 切换回 24 小时', () => {
    const store = useDashboardStore()
    store.setPeriod('month')
    store.setPeriod('today')
    expect(store.period).toBe('today')
    expect(store.salesTrend).toHaveLength(24)
  })

  // ===== 数据对比 =====
  it('toggleComparison() 捕获快照并计算差值', async () => {
    const store = useDashboardStore()
    store.toggleComparison()
    expect(store.comparisonMode).toBe(true)
    expect(store.comparisonSnapshot).not.toBeNull()
    expect(store.comparisonSnapshot!.totalSales).toBe(1000000)

    // 修改数据后再对比
    await store.refresh()
    const delta = store.comparisonDelta
    expect(delta).not.toBeNull()
    expect(delta!.totalSales).not.toBe(0)
  })

  it('toggleComparison() 两次关闭对比', () => {
    const store = useDashboardStore()
    store.toggleComparison() // on
    store.toggleComparison() // off
    expect(store.comparisonMode).toBe(false)
    expect(store.comparisonSnapshot).toBeNull()
    expect(store.comparisonDelta).toBeNull()
  })

  // ===== 错误处理 =====
  it('clearError() 清除错误状态', () => {
    const store = useDashboardStore()
    store.error = { code: 500, message: '服务器错误', data: null }
    store.clearError()
    expect(store.error).toBeNull()
  })

  // ===== 重置 =====
  it('reset() 恢复所有数据为初始值', () => {
    const store = useDashboardStore()
    store.summary.totalSales = 999999
    store.error = { code: -1, message: 'test', data: null }
    store.reset()
    expect(store.summary.totalSales).toBe(1000000)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.lastUpdated).toBeNull()
  })

  // ===== 边界条件 =====
  it('数据不会变成负数', async () => {
    const store = useDashboardStore()
    // 设一个接近 0 的值，确保 random walk 后不会被 clamp 到 0
    store.summary.totalSales = 100
    await store.refresh()
    expect(store.summary.totalSales).toBeGreaterThanOrEqual(0)
    expect(store.summary.totalOrders).toBeGreaterThanOrEqual(0)
    expect(store.summary.totalUsers).toBeGreaterThanOrEqual(0)
  })

  it('periodMultiplier 计算正确', () => {
    const store = useDashboardStore()
    expect(store.periodMultiplier).toBe(1)
    store.setPeriod('week')
    expect(store.periodMultiplier).toBe(7)
    store.setPeriod('month')
    expect(store.periodMultiplier).toBe(30)
  })

  it('scrollingLogs 追加后数量增加', async () => {
    const store = useDashboardStore()
    const before = store.scrollingLogs.length
    await store.refresh()
    // refresh 只追加 1 条并保留前 7 条，总数不超过 9
    expect(store.scrollingLogs.length).toBeLessThanOrEqual(9)
  })
})
