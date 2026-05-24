<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { echarts, baseChartColors } from '@/composables/useChart'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { salesTrend } = storeToRefs(store)
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const initChart = () => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  // 从 Store 数据中提取 X 轴和两条 Y 轴数据
  const dates = salesTrend.value.map((i) => i.date)
  const amounts = salesTrend.value.map((i) => i.amount)
  const orders = salesTrend.value.map((i) => i.orderCount)

  chart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(12,22,46,0.95)',
      borderColor: 'rgba(0,212,255,0.3)',
      textStyle: { color: '#e0e8f0', fontSize: 12 },
    },
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
    // 双 Y 轴：左轴金额，右轴订单量
    yAxis: [
      {
        type: 'value',
        name: '元',
        nameTextStyle: { color: '#8899b4', fontSize: 10 },
        axisLabel: {
          color: '#8899b4',
          fontSize: 10,
          formatter: (v: number) => `${(v / 10000).toFixed(0)}万`,
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      },
      {
        type: 'value',
        name: '单',
        nameTextStyle: { color: '#8899b4', fontSize: 10 },
        axisLabel: { color: '#8899b4', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: amounts,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: baseChartColors[0], width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,212,255,0.25)' },
              { offset: 1, color: 'rgba(0,212,255,0.02)' },
            ],
          },
        },
      },
      {
        name: '订单量',
        type: 'line',
        yAxisIndex: 1,
        data: orders,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: baseChartColors[1], width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0,255,136,0.2)' },
              { offset: 1, color: 'rgba(0,255,136,0.02)' },
            ],
          },
        },
      },
    ],
  })
}

// 窗口大小变化时 ECharts 重新计算尺寸
const handleResize = () => chart?.resize()

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose() // 销毁实例释放内存
})

// 监听数据变化，增量更新图表（不重新 init）
watch(salesTrend, () => {
  if (chart) {
    chart.setOption({
      xAxis: { data: salesTrend.value.map((i) => i.date) },
      series: [
        { data: salesTrend.value.map((i) => i.amount) },
        { data: salesTrend.value.map((i) => i.orderCount) },
      ],
    })
  }
}, { deep: true })
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">销售趋势</div>
    <div ref="chartRef" class="chart-body"></div>
  </div>
</template>

<style lang="scss" scoped>
.chart-box {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.chart-body {
  flex: 1;
  min-height: 0;
}
</style>
