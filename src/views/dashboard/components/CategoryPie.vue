<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { echarts, baseChartColors } from '@/composables/useChart'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { categories } = storeToRefs(store)
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const handleResize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  chart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(12,22,46,0.95)',
      borderColor: 'rgba(0,212,255,0.3)',
      textStyle: { color: '#e0e8f0', fontSize: 12 },
      formatter: (p: { percent: number; data: { growth: number } }) =>
        `占比 ${p.percent}%<br/>增长率 ${p.data.growth > 0 ? '+' : ''}${p.data.growth}%`,
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'middle',
      textStyle: { color: '#8899b4', fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'], // 内半径 → 外半径 生成环形饼图
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: '#0c1929', borderWidth: 2 }, // 边框与背景同色制造间隔
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#e0e8f0' },
        },
        data: categories.value.map((c, i) => ({
          value: c.value,
          name: c.name,
          growth: c.growth,
          itemStyle: { color: baseChartColors[i % baseChartColors.length] },
        })),
      },
    ],
  })

  window.addEventListener('resize', handleResize)
})

// 监听数据变化，增量更新饼图
watch(categories, () => {
  if (chart) {
    chart.setOption({
      series: [{
        data: categories.value.map((c, i) => ({
          value: c.value,
          name: c.name,
          growth: c.growth,
          itemStyle: { color: baseChartColors[i % baseChartColors.length] },
        })),
      }],
    })
  }
}, { deep: true })

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart?.dispose()
})
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">品类占比</div>
    <div ref="chartRef" class="chart-body"></div>
  </div>
</template>

<style lang="scss" scoped>
.chart-box {
  flex: 2;
  display: flex;
  flex-direction: column;
}
.chart-body {
  flex: 1;
  min-height: 0;
}
</style>
