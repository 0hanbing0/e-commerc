<script setup lang="ts">
import { onMounted, watch, nextTick } from 'vue'
import { echarts, darkTooltip, baseChartColors, useChart } from '@/composables/useChart'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { categories } = storeToRefs(store)
const { chartRef, status, init, setOption, showError, showEmpty, getInstance } = useChart()

const emit = defineEmits<{ drilldown: [name: string] }>()

const buildOption = (): echarts.EChartsCoreOption => ({
  tooltip: {
    ...darkTooltip, trigger: 'item',
    formatter: (p: { percent: number; data: { growth: number } }) =>
      `占比 ${p.percent}%<br/>增长率 ${p.data.growth > 0 ? '+' : ''}${p.data.growth}%`,
  },
  legend: {
    orient: 'vertical', right: 0, top: 'middle',
    textStyle: { color: '#8899b4', fontSize: 11 },
  },
  series: [{
    type: 'pie',
    radius: ['55%', '78%'],
    center: ['40%', '50%'],
    avoidLabelOverlap: false,
    itemStyle: { borderColor: '#0c1929', borderWidth: 2 },
    label: { show: false },
    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#e0e8f0' } },
    data: categories.value.map((c, i) => ({
      value: c.value, name: c.name, growth: c.growth,
      itemStyle: { color: baseChartColors[i % baseChartColors.length] },
    })),
  }],
})

const loadChart = async () => {
  const chart = init()
  if (!chart) { showError(); return }
  if (categories.value.length === 0) { showEmpty(); return }
  // 绑定点击事件用于下钻
  chart.off('click')
  chart.on('click', (params: { name?: string }) => {
    if (params.name) emit('drilldown', params.name)
  })
  setOption(buildOption())
  await nextTick()
  chart?.resize()
}

onMounted(loadChart)

watch(categories, async () => {
  const chart = getInstance()
  if (!chart) return
  if (categories.value.length === 0) { showEmpty(); return }
  setOption({
    series: [{
      data: categories.value.map((c, i) => ({
        value: c.value, name: c.name, growth: c.growth,
        itemStyle: { color: baseChartColors[i % baseChartColors.length] },
      })),
    }],
  })
  await nextTick()
  chart?.resize()
})
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">品类占比</div>
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
        <span class="placeholder-text">暂无品类数据</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-box { flex: 2; display: flex; flex-direction: column; }

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
