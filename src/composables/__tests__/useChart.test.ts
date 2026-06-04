import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick } from 'vue'
import { useChart } from '@/composables/useChart'

const ChartComponent = defineComponent({
  setup() {
    const { chartRef, status, init, setOption, showError, showEmpty, getInstance } = useChart()
    return { chartRef, status, init, setOption, showError, showEmpty, getInstance }
  },
  render() {
    return h('div', { ref: 'chartRef' })
  },
})

describe('useChart', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('初始 status 为 loading', async () => {
    const wrapper = mount(ChartComponent)
    await nextTick()
    expect(wrapper.vm.status).toBe('loading')
  })

  it('init() + setOption() 后 status 变为 success', async () => {
    const wrapper = mount(ChartComponent)
    await nextTick()
    wrapper.vm.init()
    wrapper.vm.setOption({})
    await nextTick()
    expect(wrapper.vm.status).toBe('success')
  })

  it('showError() 将 status 设为 error', async () => {
    const wrapper = mount(ChartComponent)
    await nextTick()
    wrapper.vm.showError()
    await nextTick()
    expect(wrapper.vm.status).toBe('error')
  })

  it('showEmpty() 将 status 设为 empty', async () => {
    const wrapper = mount(ChartComponent)
    await nextTick()
    wrapper.vm.showEmpty()
    await nextTick()
    expect(wrapper.vm.status).toBe('empty')
  })

  it('init() 前 getInstance() 返回 null', async () => {
    const wrapper = mount(ChartComponent)
    await nextTick()
    expect(wrapper.vm.getInstance()).toBeNull()
  })

  it('init() 后 getInstance() 返回 chart 实例', async () => {
    const wrapper = mount(ChartComponent)
    await nextTick()
    wrapper.vm.init()
    const inst = wrapper.vm.getInstance()
    expect(inst).not.toBeNull()
    expect(inst).toHaveProperty('setOption')
    expect(inst).toHaveProperty('resize')
  })
})
