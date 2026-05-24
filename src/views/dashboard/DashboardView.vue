<script setup lang="ts">
import DataHeader from './components/DataHeader.vue'
import SalesTrend from './components/SalesTrend.vue'
import CategoryPie from './components/CategoryPie.vue'
import OrderFlow from './components/OrderFlow.vue'
import UserRadar from './components/UserRadar.vue'
import TopProducts from './components/TopProducts.vue'
import ScrollingTable from './components/ScrollingTable.vue'
import { useDashboardStore } from '@/stores'
import { onMounted, onUnmounted, ref } from 'vue'

const store = useDashboardStore()
let dataTimer: ReturnType<typeof setInterval>
let clockTimer: ReturnType<typeof setInterval>

// 当前时间 —— 每秒更新一次
const now = ref(new Date())

onMounted(() => {
  // 每 5 秒刷新仪表盘数据
  dataTimer = setInterval(() => store.refresh(), 5000)
  // 每秒更新时间显示
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(dataTimer)
  clearInterval(clockTimer)
})
</script>

<template>
  <div class="dashboard">
    <!-- 顶部标题栏 -->
    <header class="dash-header">
      <h1>电商实时数据大屏</h1>
      <span class="time">{{ now.toLocaleString('zh-CN') }}</span>
    </header>

    <!-- 四列指标卡片 -->
    <DataHeader />

    <!-- 主体三栏栅格：左(3) 中(4) 右(3) -->
    <div class="dash-body">
      <div class="col col-left">
        <SalesTrend />
        <OrderFlow />
      </div>
      <div class="col col-center">
        <CategoryPie />
        <ScrollingTable />
      </div>
      <div class="col col-right">
        <UserRadar />
        <TopProducts />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 大屏整体占满视口
.dashboard {
  width: 100%;
  height: 100vh;
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 顶部标题 —— 渐变色文字
.dash-header {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  flex-shrink: 0;

  h1 {
    font-size: 22px;
    font-weight: 600;
    background: linear-gradient(90deg, #00d4ff, #00ff88);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
  }

  .time {
    color: var(--text-secondary);
    font-size: 14px;
  }
}

// 三栏弹性布局
.dash-body {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0; // flex 子项默认 min-height:auto 会导致溢出，重置后 flex 比例生效
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-left {
  flex: 3;
}
.col-center {
  flex: 4;
}
.col-right {
  flex: 3;
}
</style>
