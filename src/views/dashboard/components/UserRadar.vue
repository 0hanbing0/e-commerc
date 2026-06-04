<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { echarts, darkTooltip, baseChartColors, useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { userProfile } = storeToRefs(store)
const { chartRef, status, init, setOption, showError, showEmpty, getInstance } = useChart()

const buildOption = (): echarts.EChartsCoreOption => ({
  tooltip: darkTooltip,
  legend: { bottom: 0, textStyle: { color: '#8899b4', fontSize: 11 } },
  radar: {
    center: ['50%', '45%'],
    radius: '60%',
    axisName: { color: '#8899b4', fontSize: 10 },
    indicator: userProfile.value.map((d) => ({ name: d.dimension, max: d.max })),
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    splitArea: { areaStyle: { color: ['rgba(0,212,255,0.02)', 'rgba(0,212,255,0.04)'] } },
  },
  series: [{
    type: 'radar',
    data: [{
      value: userProfile.value.map((d) => d.value),
      name: '用户画像',
      areaStyle: { color: 'rgba(0,212,255,0.15)' },
      lineStyle: { color: baseChartColors[0], width: 2 },
      itemStyle: { color: baseChartColors[0] },
    }],
  }],
})

const loadChart = async () => {
  const chart = init()
  if (!chart) { showError(); return }
  if (userProfile.value.length === 0) { showEmpty(); return }
  setOption(buildOption())
  await nextTick()
  chart?.resize()
}

onMounted(loadChart)

watch(userProfile, async () => {
  const chart = getInstance()
  if (!chart) return
  if (userProfile.value.length === 0) { showEmpty(); return }
  setOption({
    radar: { indicator: userProfile.value.map((d) => ({ name: d.dimension, max: d.max })) },
    series: [{ data: [{ value: userProfile.value.map((d) => d.value), name: '用户画像' }] }],
  })
  await nextTick()
  chart?.resize()
})
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">用户画像</div>
    <div class="chart-wrapper">
      <div ref="chartRef" class="chart-body"></div>

      <div v-if="status === 'loading'" class="chart-overlay">
        <span class="spinner"></span>
      </div>
      <div v-else-if="status === 'error'" class="chart-overlay">
        <span class="placeholder-text">图表加载失败</span>
        <button class="btn-retry" @click="loadChart">重试</button>
      </div>
      <div v-else-if="status === 'empty'" class="chart-overlay">
        <span class="placeholder-text">暂无用户画像数据</span>
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
