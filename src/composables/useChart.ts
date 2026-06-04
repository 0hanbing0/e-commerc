import * as echarts from 'echarts/core'
import { LineChart, PieChart, RadarChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { ref, onUnmounted } from 'vue'
import type { ChartStatus } from '@/types'

echarts.use([
  LineChart,
  PieChart,
  RadarChart,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer,
])

export { echarts }

// 全局图表配色方案
export const baseChartColors = [
  '#00d4ff',
  '#00ff88',
  '#ff6b6b',
  '#ffd93d',
  '#a78bfa',
  '#2dd4bf',
  '#f472b6',
  '#60a5fa',
]

// 通用 tooltip 暗色主题
export const darkTooltip = {
  backgroundColor: 'rgba(12,22,46,0.95)',
  borderColor: 'rgba(0,212,255,0.3)',
  textStyle: { color: '#e0e8f0', fontSize: 12 },
}

// ===== 图表管理 composable =====
// 封装 init / setOption / resize / dispose 生命周期
export const useChart = () => {
  const chartRef = ref<HTMLDivElement>()
  const status = ref<ChartStatus>('loading')
  let chart: echarts.ECharts | null = null
  let resizeHandler: (() => void) | null = null

  const init = (): echarts.ECharts | null => {
    if (!chartRef.value) return null

    // 移除旧监听器，避免内存泄漏
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
    if (chart) chart.dispose()

    chart = echarts.init(chartRef.value)
    resizeHandler = () => chart?.resize()
    window.addEventListener('resize', resizeHandler)
    return chart
  }

  const setOption = (option: echarts.EChartsCoreOption) => {
    if (!chart) return
    chart.setOption(option, { notMerge: false })
    status.value = 'success'
  }

  const showError = () => {
    status.value = 'error'
  }

  const showEmpty = () => {
    status.value = 'empty'
  }

  onUnmounted(() => {
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
    chart?.dispose()
    chart = null
  })

  return {
    chartRef,
    status,
    init,
    setOption,
    showError,
    showEmpty,
    getInstance: () => chart,
  }
}
