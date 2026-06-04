<script setup lang="ts">
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ref, computed } from 'vue'

const store = useDashboardStore()
const { scrollingLogs, loading, error, lastUpdated } = storeToRefs(store)
const isPaused = ref(false)

const isEmpty = computed(() => !loading.value && scrollingLogs.value.length === 0 && !error.value)

const pauseScroll = () => { isPaused.value = true }
const resumeScroll = () => { isPaused.value = false }
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">实时事件</div>

    <!-- 加载骨架 -->
    <div v-if="loading && !lastUpdated" class="scroll-container static">
      <div v-for="i in 4" :key="i" class="scroll-item">
        <div class="skel-line" style="width:90%"></div>
      </div>
    </div>

    <!-- 加载错误 -->
    <div v-else-if="error" class="empty-state error-text">数据加载失败</div>

    <!-- 空数据 -->
    <div v-else-if="isEmpty" class="empty-state">暂无实时事件</div>

    <!-- 正常滚动 -->
    <div
      v-else
      class="scroll-container"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div class="scroll-track" :class="{ paused: isPaused }">
        <div v-for="log in scrollingLogs" :key="log.id" class="scroll-item">
          <span class="scroll-event">{{ log.event }}</span>
          <span class="scroll-detail">{{ log.detail }}</span>
          <span class="scroll-time">{{ log.time }}</span>
        </div>
        <div v-for="log in scrollingLogs" :key="`dup-${log.id}`" class="scroll-item">
          <span class="scroll-event">{{ log.event }}</span>
          <span class="scroll-detail">{{ log.detail }}</span>
          <span class="scroll-time">{{ log.time }}</span>
        </div>
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

.scroll-container {
  flex: 1;
  overflow-y: hidden;
  min-height: 0;

  &.static {
    overflow-y: visible;
  }
}

.scroll-track {
  animation: scrollUp 25s linear infinite;

  &.paused {
    animation-play-state: paused;
  }
}

@keyframes scrollUp {
  0%   { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.scroll-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  font-size: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.scroll-event {
  color: var(--accent-yellow);
  min-width: 56px;
  font-weight: 500;
}

.scroll-detail {
  flex: 1;
  color: var(--text-primary);
}

.scroll-time {
  color: var(--text-secondary);
  font-family: monospace;
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
