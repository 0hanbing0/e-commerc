<script setup lang="ts">
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const store = useDashboardStore()
const { topProducts, loading, error, lastUpdated } = storeToRefs(store)

const isEmpty = computed(() => !loading.value && topProducts.value.length === 0 && !error.value)
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">热销 TOP10</div>

    <!-- 加载骨架 -->
    <div v-if="loading && !lastUpdated" class="rank-list">
      <div v-for="i in 5" :key="i" class="rank-item">
        <div class="skel-line" style="width:80%"></div>
      </div>
    </div>

    <!-- 加载错误 -->
    <div v-else-if="error" class="empty-state error-text">数据加载失败</div>

    <!-- 空数据 -->
    <div v-else-if="isEmpty" class="empty-state">暂无排行数据</div>

    <!-- 正常列表 -->
    <div v-else class="rank-list">
      <div v-for="p in topProducts" :key="p.rank" class="rank-item">
        <span class="rank-num" :class="{ top3: p.rank <= 3 }">{{ p.rank }}</span>
        <span class="rank-name">{{ p.name }}</span>
        <span class="rank-sales">¥{{ (p.sales / 10000).toFixed(1) }}万</span>
        <span class="rank-trend" :class="p.trend >= 0 ? 'data-up' : 'data-down'">
          {{ p.trend >= 0 ? '↑' : '↓' }}{{ Math.abs(p.trend) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-box {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.rank-list {
  flex: 1;
  overflow-y: auto;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 8px;
  font-size: 12px;
  border-radius: 2px;
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 212, 255, 0.06);
  }
}

.rank-num {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  font-size: 11px;
  color: var(--text-secondary);
  flex-shrink: 0;

  &.top3 {
    background: rgba(0, 212, 255, 0.15);
    color: var(--accent-cyan);
    font-weight: 700;
  }
}

.rank-name {
  flex: 1;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-sales {
  color: var(--accent-green);
  font-weight: 600;
  min-width: 68px;
  text-align: right;
}

.rank-trend {
  min-width: 52px;
  text-align: right;
  font-size: 11px;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-size: 13px;
}

.error-text {
  color: var(--accent-red);
}

.skel-line {
  height: 12px;
}
</style>
