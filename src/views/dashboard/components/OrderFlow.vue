<script setup lang="ts">
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const store = useDashboardStore()
const { orderFlow, loading, error, lastUpdated } = storeToRefs(store)

const isEmpty = computed(() => !loading.value && orderFlow.value.length === 0 && !error.value)
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">实时订单流</div>

    <!-- 加载骨架 -->
    <div v-if="loading && !lastUpdated" class="flow-list">
      <div v-for="i in 5" :key="i" class="flow-item">
        <div class="skel-line" style="width:60%"></div>
      </div>
    </div>

    <!-- 加载错误 -->
    <div v-else-if="error" class="empty-state error-text">数据加载失败</div>

    <!-- 空数据 -->
    <div v-else-if="isEmpty" class="empty-state">暂无订单数据</div>

    <!-- 正常列表 -->
    <div v-else class="flow-list">
      <div v-for="o in orderFlow" :key="o.id" class="flow-item">
        <span class="flow-id">{{ o.id }}</span>
        <span class="flow-product">{{ o.product }}</span>
        <span class="flow-price">¥{{ o.price.toLocaleString() }}</span>
        <span class="flow-channel">{{ o.channel }}</span>
        <span class="flow-city">{{ o.city }}</span>
        <span class="flow-time">{{ o.time }}</span>
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

.flow-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.flow-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 2px;
  background: rgba(0, 212, 255, 0.03);
  transition: background 0.2s;

  &:hover {
    background: rgba(0, 212, 255, 0.08);
  }
}

.flow-id {
  color: var(--accent-cyan);
  font-family: monospace;
  min-width: 130px;
}

.flow-product {
  flex: 1;
  color: var(--text-primary);
}

.flow-price {
  color: var(--accent-green);
  font-weight: 600;
  min-width: 80px;
  text-align: right;
}

.flow-channel {
  color: var(--accent-purple);
  min-width: 50px;
  text-align: center;
}

.flow-city {
  color: var(--text-secondary);
  min-width: 40px;
  text-align: center;
}

.flow-time {
  color: var(--text-secondary);
  font-family: monospace;
  min-width: 64px;
  text-align: right;
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
