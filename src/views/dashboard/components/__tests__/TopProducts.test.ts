import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TopProducts from '@/views/dashboard/components/TopProducts.vue'
import { useDashboardStore } from '@/stores'

describe('TopProducts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('首次加载显示骨架屏', () => {
    const store = useDashboardStore()
    store.loading = true
    store.lastUpdated = null
    const wrapper = mount(TopProducts)
    expect(wrapper.findAll('.skel-line')).toHaveLength(5)
  })

  it('正常渲染排行列表', () => {
    const wrapper = mount(TopProducts)
    expect(wrapper.findAll('.rank-item').length).toBeGreaterThan(0)
  })

  it('TOP3 有特殊样式', () => {
    const wrapper = mount(TopProducts)
    const top3Els = wrapper.findAll('.rank-num.top3')
    expect(top3Els.length).toBe(3)
    expect(top3Els[0].text()).toBe('1')
    expect(top3Els[1].text()).toBe('2')
    expect(top3Els[2].text()).toBe('3')
  })

  it('正趋势显示 data-up', () => {
    const store = useDashboardStore()
    store.topProducts[0].trend = 20
    const wrapper = mount(TopProducts)
    expect(wrapper.findAll('.data-up').length).toBeGreaterThan(0)
  })

  it('error 状态显示错误', () => {
    const store = useDashboardStore()
    store.error = { code: 500, message: '服务器错误', data: null }
    const wrapper = mount(TopProducts)
    expect(wrapper.find('.error-text').exists()).toBe(true)
  })

  it('空数据时显示占位文字', () => {
    const store = useDashboardStore()
    store.topProducts = []
    const wrapper = mount(TopProducts)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})
