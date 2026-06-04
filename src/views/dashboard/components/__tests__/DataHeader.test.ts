import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { nextTick } from 'vue'
import DataHeader from '@/views/dashboard/components/DataHeader.vue'
import { useDashboardStore } from '@/stores'

describe('DataHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('首次加载显示骨架屏', async () => {
    const store = useDashboardStore()
    store.loading = true
    store.lastUpdated = null
    const wrapper = mount(DataHeader)
    await nextTick()
    expect(wrapper.findAll('.skeleton')).toHaveLength(4)
  })

  it('正常渲染 4 个指标卡', () => {
    const wrapper = mount(DataHeader)
    const cards = wrapper.findAll('.stat-card')
    // 骨架屏为 template v-if，正常模式不应该有 skeleton
    expect(cards.length).toBeGreaterThanOrEqual(4)
  })

  it('显示总销售额', () => {
    const wrapper = mount(DataHeader)
    const text = wrapper.text()
    expect(text).toContain('总销售额')
    expect(text).toContain('万')
  })

  it('显示同比增长类名', () => {
    const store = useDashboardStore()
    // 所有增长值设为正数，确保只有 data-up 没有 data-down
    store.summary.salesGrowth = 15
    store.summary.orderGrowth = 10
    store.summary.userGrowth = 5
    store.summary.conversionGrowth = 2
    const wrapper = mount(DataHeader)
    expect(wrapper.find('.data-up').exists()).toBe(true)
    expect(wrapper.find('.data-down').exists()).toBe(false)
  })

  it('负增长显示 data-down', () => {
    const store = useDashboardStore()
    store.summary.salesGrowth = -5
    const wrapper = mount(DataHeader)
    expect(wrapper.find('.data-down').exists()).toBe(true)
  })

  it('非今日周期显示 period-tag', () => {
    const store = useDashboardStore()
    store.setPeriod('week')
    const wrapper = mount(DataHeader)
    expect(wrapper.find('.period-tag').exists()).toBe(true)
    expect(wrapper.find('.period-tag').text()).toBe('本周')
  })

  it('点击对比按钮触发 toggleComparison', async () => {
    const store = useDashboardStore()
    const wrapper = mount(DataHeader)
    const btn = wrapper.find('.compare-toggle')
    await btn.trigger('click')
    expect(store.comparisonMode).toBe(true)
    await btn.trigger('click')
    expect(store.comparisonMode).toBe(false)
  })

  it('对比模式下显示差值行', async () => {
    const store = useDashboardStore()
    store.toggleComparison()
    const wrapper = mount(DataHeader)
    await nextTick()
    expect(wrapper.find('.stat-delta').exists()).toBe(true)
  })
})
