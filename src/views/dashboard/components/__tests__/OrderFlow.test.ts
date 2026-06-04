import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import OrderFlow from '@/views/dashboard/components/OrderFlow.vue'
import { useDashboardStore } from '@/stores'

describe('OrderFlow', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('首次加载显示骨架屏', () => {
    const store = useDashboardStore()
    store.loading = true
    store.lastUpdated = null
    const wrapper = mount(OrderFlow)
    expect(wrapper.findAll('.skel-line')).toHaveLength(5)
  })

  it('正常渲染订单列表', () => {
    const wrapper = mount(OrderFlow)
    expect(wrapper.findAll('.flow-item').length).toBeGreaterThan(0)
  })

  it('显示订单 ID 和商品名称', () => {
    const wrapper = mount(OrderFlow)
    const text = wrapper.text()
    expect(text).toContain('DD')
    expect(text).toContain('¥')
  })

  it('error 状态显示错误文字', () => {
    const store = useDashboardStore()
    store.error = { code: 500, message: '服务器错误', data: null }
    const wrapper = mount(OrderFlow)
    expect(wrapper.find('.error-text').exists()).toBe(true)
    expect(wrapper.text()).toContain('数据加载失败')
  })

  it('空数据时显示占位文字', () => {
    const store = useDashboardStore()
    store.orderFlow = []
    const wrapper = mount(OrderFlow)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})
