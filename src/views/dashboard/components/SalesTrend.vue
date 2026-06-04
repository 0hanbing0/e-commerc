<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { echarts, darkTooltip, baseChartColors, useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { salesTrend } = storeToRefs(store)
const { chartRef, status, init, setOption, showError, showEmpty, getInstance } = useChart()

const buildOption = (): echarts.EChartsCoreOption => {
  const dates = salesTrend.value.map((i) => i.date)
  const amounts = salesTrend.value.map((i) => i.amount)
  const orders = salesTrend.value.map((i) => i.orderCount)

  return {
    tooltip: { ...darkTooltip, trigger: 'axis' },
    legend: {
      data: ['销售额', '订单量'],
      right: 0,
      textStyle: { color: '#8899b4', fontSize: 12 },
    },
    grid: { left: 50, right: 20, top: 44, bottom: 24 },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      axisLabel: { color: '#8899b4', fontSize: 10 },
      boundaryGap: false,
    },
    yAxis: [
      {
        type: 'value', name: '元',
        nameTextStyle: { color: '#8899b4', fontSize: 10 },
        axisLabel: {
          color: '#8899b4', fontSize: 10,
          formatter: (v: number) => `${(v / 10000).toFixed(0)}万`,
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      {
        type: 'value', name: '单',
        nameTextStyle: { color: '#8899b4', fontSize: 10 },
        axisLabel: { color: '#8899b4', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '销售额', type: 'line', data: amounts,
        smooth: true, symbol: 'none',
        lineStyle: { color: baseChartColors[0], width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,255,0.25)' },
              { offset: 1, color: 'rgba(0,212,255,0.02)' },
            ],
          },
        },
      },
      {
        name: '订单量', type: 'line', yAxisIndex: 1, data: orders,
        smooth: true, symbol: 'none',
        lineStyle: { color: baseChartColors[1], width: 2 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,255,136,0.2)' },
              { offset: 1, color: 'rgba(0,255,136,0.02)' },
            ],
          },
        },
      },
    ],
  }
}

const loadChart = async () => {
  const chart = init()
  if (!chart) { showError(); return }
  if (salesTrend.value.length === 0) { showEmpty(); return }
  setOption(buildOption())
  await nextTick()
  chart?.resize()
}

onMounted(loadChart)

watch(salesTrend, async () => {
  const chart = getInstance()
  if (!chart) return
  if (salesTrend.value.length === 0) { showEmpty(); return }
  setOption({
    xAxis: { data: salesTrend.value.map((i) => i.date) },
    series: [
      { data: salesTrend.value.map((i) => i.amount) },
      { data: salesTrend.value.map((i) => i.orderCount) },
    ],
  })
  await nextTick()
  chart?.resize()
})
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">销售趋势</div>
    <div class="chart-wrapper">
      <!-- 始终渲染，让 ECharts 初始化时拿到真实尺寸 -->
      <div ref="chartRef" class="chart-body"></div>

      <!-- 加载/错误/空数据覆盖层 -->
      <div v-if="status === 'loading'" class="chart-overlay">
        <span class="spinner"></span>
      </div>
      <div v-else-if="status === 'error'" class="chart-overlay">
        <span class="placeholder-text">图表加载失败</span>
        <button class="btn-retry" @click="loadChart">重试</button>
      </div>
      <div v-else-if="status === 'empty'" class="chart-overlay">
        <span class="placeholder-text">暂无销售数据</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-box { flex: 1; display: flex; flex-direction: column; }

.chart-wrapper {
  flex: 1;
  min-height: 0;
  position: relative;
}

.chart-body {
  width: 100%;
  height: 100%;
}
</style>
