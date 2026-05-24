<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { echarts, baseChartColors } from '@/composables/useChart'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { userProfile } = storeToRefs(store)
const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

const handleResize = () => chart?.resize()

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)

  chart.setOption({
    tooltip: {
      backgroundColor: 'rgba(12,22,46,0.95)',
      borderColor: 'rgba(0,212,255,0.3)',
      textStyle: { color: '#e0e8f0', fontSize: 12 },
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#8899b4', fontSize: 11 },
    },
    radar: {
      center: ['50%', '45%'],
      radius: '60%',
      axisName: { color: '#8899b4', fontSize: 10 },
      // 雷达图指标由 Store 数据动态生成
      indicator: userProfile.value.map((d) => ({ name: d.dimension, max: d.max })),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      splitArea: { areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.04)'] } },
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: userProfile.value.map((d) => d.value),
            name: '用户画像',
            areaStyle: { color: 'rgba(0,212,255,0.15)' },
            lineStyle: { color: baseChartColors[0], width: 2 },
            itemStyle: { color: baseChartColors[0] },
          },
        ],
      },
    ],
  })

  window.addEventListener('resize', handleResize)
})

// 监听数据变化，增量更新雷达图
watch(userProfile, () => {
  if (chart) {
    chart.setOption({
      radar: {
        indicator: userProfile.value.map((d) => ({ name: d.dimension, max: d.max })),
      },
      series: [{
        data: [{
          value: userProfile.value.map((d) => d.value),
          name: '用户画像',
        }],
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
    <div class="card-title">用户画像</div>
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
