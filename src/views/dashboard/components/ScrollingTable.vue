<script setup lang="ts">
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { ref, onMounted, onUnmounted } from 'vue'

const store = useDashboardStore()
const { scrollingLogs } = storeToRefs(store)
const containerRef = ref<HTMLDivElement>()
let scrollTimer: number
let isPaused = false

const pauseScroll = () => {
  isPaused = true
}
const resumeScroll = () => {
  isPaused = false
}

// 定时器驱动 scrollTop 自增实现自动滚动
// 滚动到底部时归零，配合数据副本实现视觉"无缝"
onMounted(() => {
  const step = () => {
    if (!containerRef.value || isPaused) return
    const el = containerRef.value
    el.scrollTop += 0.5
    if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
      el.scrollTop = 0
    }
  }
  // 40ms 间隔 ≈ 25fps，兼顾流畅度和性能
  scrollTimer = window.setInterval(step, 40)
})

onUnmounted(() => clearInterval(scrollTimer))
</script>

<template>
  <div class="dash-card chart-box">
    <div class="card-title">实时事件</div>
    <!-- 鼠标悬停暂停滚动，离开恢复 -->
    <div
      ref="containerRef"
      class="scroll-container"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div v-for="log in scrollingLogs" :key="log.id" class="scroll-item">
        <span class="scroll-event">{{ log.event }}</span>
        <span class="scroll-detail">{{ log.detail }}</span>
        <span class="scroll-time">{{ log.time }}</span>
      </div>
      <!-- 数据副本：原数据滚完时无缝衔接，消除视觉跳跃 -->
      <div v-for="log in scrollingLogs" :key="`dup-${log.id}`" class="scroll-item">
        <span class="scroll-event">{{ log.event }}</span>
        <span class="scroll-detail">{{ log.detail }}</span>
        <span class="scroll-time">{{ log.time }}</span>
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
  overflow-y: hidden; // 隐藏滚动条，由 JS 控制滚动
  min-height: 0;
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
</style>
