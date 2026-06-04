// 测试全局 setup —— ECharts DOM 尺寸 mock
// ECharts 依赖 DOM 测量 API（getBoundingClientRect 等），jsdom 默认返回 0
import { vi } from 'vitest'

// Mock ECharts init 返回值，避免测试中实际渲染图表
vi.mock('echarts/core', () => {
  const mockChart = {
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    getOption: vi.fn(() => ({})),
    getWidth: vi.fn(() => 600),
    getHeight: vi.fn(() => 400),
    getDom: vi.fn(() => document.createElement('div')),
  }

  return {
    echarts: undefined,
    init: vi.fn(() => mockChart),
    use: vi.fn(),
    LineChart: {},
    PieChart: {},
    RadarChart: {},
    TooltipComponent: {},
    LegendComponent: {},
    GridComponent: {},
    CanvasRenderer: {},
    EChartsCoreOption: {},
    default: {
      init: vi.fn(() => mockChart),
      use: vi.fn(),
    },
  }
})
