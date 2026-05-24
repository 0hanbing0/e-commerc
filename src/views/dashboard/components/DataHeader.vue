<script setup lang="ts">
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const store = useDashboardStore()
// storeToRefs 解构保持响应性 —— 普通解构会使 ref 丢失响应
const { summary } = storeToRefs(store)

// computed 将 Store 中的原始数据转为展示格式
// computed 将 Store 中的原始数据转为展示格式
const cards = computed(() => [
  {
    label: '总销售额',
    value: `¥${(summary.value.totalSales / 10000).toFixed(0)}万`,
    growth: summary.value.salesGrowth,
  },
  {
    label: '订单量',
    value: summary.value.totalOrders.toLocaleString(),
    growth: summary.value.orderGrowth,
  },
  {
    label: '用户数',
    value: summary.value.totalUsers.toLocaleString(),
    growth: summary.value.userGrowth,
  },
  {
    label: '转化率',
    value: `${summary.value.conversionRate}%`,
    growth: summary.value.conversionGrowth,
  },
])
</script>

<template>
  <div class="data-header">
    <div v-for="c in cards" :key="c.label" class="stat-card">
      <div class="stat-label">{{ c.label }}</div>
      <div class="stat-value">{{ c.value }}</div>
      <div class="stat-growth" :class="c.growth >= 0 ? 'data-up' : 'data-down'">
        {{ c.growth >= 0 ? '↑' : '↓' }} {{ Math.abs(c.growth) }}%
        <span class="stat-compare">同比</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 四列指标卡片横向排列
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

  // 右侧装饰圆形
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
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent-cyan);
  margin-bottom: 4px;
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
</style>
