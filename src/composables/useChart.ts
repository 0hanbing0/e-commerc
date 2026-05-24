import * as echarts from 'echarts/core'
// 按需引入图表类型 —— 不用的类型不会打进包
import { LineChart, PieChart, BarChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// 手动注册：只打包实际使用的图表和组件
// 对比全量 import * as echarts from 'echarts' 可减少约 60% 体积
echarts.use([
  LineChart,
  PieChart,
  BarChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  CanvasRenderer,
])

export { echarts }

// 全局图表配色方案 —— 所有图表组件共享，修改一处全部生效
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
