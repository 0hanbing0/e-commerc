<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'

const store = useDashboardStore()
const { summary, loading, lastUpdated, period, comparisonMode, comparisonDelta } = storeToRefs(store)

const formatDelta = (v: number, prefix = ''): string => {
  if (v === 0) return '--'
  const sign = v >= 0 ? '+' : ''
  return `${sign}${prefix}${v.toLocaleString()}`
}

const cards = computed(() => {
  if (loading.value && !lastUpdated.value) return []
  const isLoading = loading.value
  const delta = comparisonDelta.value
  const isComparing = comparisonMode.value && delta !== null
  return [
    {
      label: '总销售额',
      value: `¥${(summary.value.totalSales / 10000).toFixed(0)}万`,
      growth: summary.value.salesGrowth,
      delta: isComparing ? `¥${(delta.totalSales / 10000).toFixed(1)}万` : undefined,
      deltaSign: delta ? Math.sign(delta.totalSales) : 0,
      loading: isLoading,
    },
    {
      label: '订单量',
      value: summary.value.totalOrders.toLocaleString(),
      growth: summary.value.orderGrowth,
      delta: isComparing ? formatDelta(delta.totalOrders) : undefined,
      deltaSign: delta ? Math.sign(delta.totalOrders) : 0,
      loading: isLoading,
    },
    {
      label: '用户数',
      value: summary.value.totalUsers.toLocaleString(),
      growth: summary.value.userGrowth,
      delta: isComparing ? formatDelta(delta.totalUsers) : undefined,
      deltaSign: delta ? Math.sign(delta.totalUsers) : 0,
      loading: isLoading,
    },
    {
      label: '转化率',
      value: `${summary.value.conversionRate}%`,
      growth: summary.value.conversionGrowth,
      delta: isComparing ? `${formatDelta(delta.conversionRate)}%` : undefined,
      deltaSign: delta ? Math.sign(delta.conversionRate) : 0,
      loading: isLoading,
    },
  ]
})
</script>

<template>
  <div class="data-header">
    <!-- 骨架屏：首次加载中 -->
    <template v-if="loading && cards.length === 0">
      <div v-for="i in 4" :key="i" class="stat-card skeleton">
        <div class="skel-line w-60"></div>
        <div class="skel-line w-80"></div>
        <div class="skel-line w-40"></div>
      </div>
    </template>

    <!-- 正常数据 -->
    <div
      v-for="c in cards"
      :key="c.label"
      class="stat-card"
      :class="{ refreshing: c.loading }"
    >
      <div class="stat-label">
        {{ c.label }}
        <span v-if="period !== 'today'" class="period-tag">{{ { week: '本周', month: '本月' }[period] }}</span>
        <button class="compare-toggle" :class="{ active: comparisonMode }" @click="store.toggleComparison()" title="数据对比">
          {{ comparisonMode ? '对比中' : '对比' }}
        </button>
      </div>
      <div class="stat-value">
        {{ c.value }}
        <span v-if="c.loading" class="refresh-dot"></span>
      </div>
      <div class="stat-growth" :class="c.growth >= 0 ? 'data-up' : 'data-down'">
        {{ c.growth >= 0 ? '↑' : '↓' }} {{ Math.abs(c.growth) }}%
        <span class="stat-compare">同比</span>
      </div>
      <div v-if="c.delta !== undefined" class="stat-delta" :class="c.deltaSign >= 0 ? 'data-up' : 'data-down'">
        较基准 {{ c.delta }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.data-header {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
  flex-shrink: 0;
}

.stat-card {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 4px;
  padding: 16px 20px;
  position: relative;
  transition: all 0.3s;

  &::after {
    content: '';
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid rgba(0, 212, 255, 0.15);
  }

  &:hover {
    border-color: var(--border-active);
    transform: translateY(-2px);
  }
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.period-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 2px;
  background: rgba(0, 212, 255, 0.12);
  color: var(--accent-cyan);
}

.compare-toggle {
  font-size: 10px;
  padding: 1px 8px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: var(--border-active); color: var(--text-primary); }

  &.active {
    background: rgba(255, 217, 61, 0.12);
    border-color: rgba(255, 217, 61, 0.35);
    color: var(--accent-yellow);
  }
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.refresh-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-cyan);
  animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50%      { opacity: 1; }
}

.stat-card.refreshing {
  opacity: 0.85;
}

.stat-growth {
  font-size: 13px;
  font-weight: 500;
}

.stat-compare {
  color: var(--text-secondary);
  margin-left: 4px;
  font-weight: 400;
}

.stat-delta {
  font-size: 11px;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

// 骨架屏
.skeleton {
  pointer-events: none;
}

.skel-line {
  height: 14px;
  margin-bottom: 8px;
}

.w-60 { width: 60%; }
.w-80 { width: 80%; }
.w-40 { width: 40%; }
</style>
