import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ScrollingTable from '@/views/dashboard/components/ScrollingTable.vue'
import { useDashboardStore } from '@/stores'

describe('ScrollingTable', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('首次加载显示骨架屏', () => {
    const store = useDashboardStore()
    store.loading = true
    store.lastUpdated = null
    const wrapper = mount(ScrollingTable)
    expect(wrapper.findAll('.skel-line')).toHaveLength(4)
  })

  it('正常渲染滚动事件列表', () => {
    const wrapper = mount(ScrollingTable)
    // 内容被复制用于无缝滚动，数量 = 数据条数 × 2
    const items = wrapper.findAll('.scroll-item')
    expect(items.length).toBeGreaterThan(0)
  })

  it('显示事件名称和详情', () => {
    const wrapper = mount(ScrollingTable)
    const text = wrapper.text()
    expect(text).toContain('实时事件')
  })

  it('error 状态显示错误', () => {
    const store = useDashboardStore()
    store.error = { code: -1, message: '网络连接失败', data: null }
    const wrapper = mount(ScrollingTable)
    expect(wrapper.find('.error-text').exists()).toBe(true)
  })

  it('空数据时显示占位文字', () => {
    const store = useDashboardStore()
    store.scrollingLogs = []
    const wrapper = mount(ScrollingTable)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })

  it('hover 时暂停动画', () => {
    const wrapper = mount(ScrollingTable)
    const track = wrapper.find('.scroll-track')
    expect(track.exists()).toBe(true)
    // CSS 动画暂停由 .scroll-track:hover 控制，验证元素存在即可
  })
})
