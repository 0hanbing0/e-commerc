<script setup lang="ts">
import DataHeader from './components/DataHeader.vue'
import SalesTrend from './components/SalesTrend.vue'
import CategoryPie from './components/CategoryPie.vue'
import OrderFlow from './components/OrderFlow.vue'
import UserRadar from './components/UserRadar.vue'
import TopProducts from './components/TopProducts.vue'
import ScrollingTable from './components/ScrollingTable.vue'
import { useDashboardStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { categorySubData } from '@/mock/dashboard'
import { useWebSocket } from '@/composables/useWebSocket'

// ===== WebSocket 模拟推送 =====
const ws = useWebSocket((msg) => {
  if (msg.type === 'data-update' || msg.type === 'order') {
    store.refresh()
  }
})

// 时间周期选项
const PERIOD_OPTIONS = ['today', 'week', 'month'] as const
const PERIOD_LABELS: Record<string, string> = { today: '今日', week: '本周', month: '本月' }

const store = useDashboardStore()
const { loading, error, lastUpdated, summary, salesTrend, categories, orderFlow, userProfile, topProducts, scrollingLogs, period } = storeToRefs(store)

let dataTimer: ReturnType<typeof setInterval> | undefined
let clockTimer: ReturnType<typeof setInterval> | undefined

const formatTime = (d: Date): string => {
  const year = d.getFullYear()
  const mon = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${mon}-${day} ${hh}:${mm}:${ss}`
}

const now = ref(new Date())

// ===== 多 Tab 切换 =====
const TABS = [
  { key: 'sales', label: '销售总览' },
  { key: 'users', label: '用户分析' },
  { key: 'products', label: '商品分析' },
]
const activeTab = ref('sales')

// ===== 自动轮播 =====
const autoRotate = ref(false)
let rotateTimer: ReturnType<typeof setInterval> | undefined

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
  if (autoRotate.value) {
    rotateTimer = setInterval(() => {
      const idx = TABS.findIndex((t) => t.key === activeTab.value)
      activeTab.value = TABS[(idx + 1) % TABS.length].key
    }, 15000)
  } else {
    clearInterval(rotateTimer)
  }
}

const pauseAutoRotate = () => {
  if (autoRotate.value) clearInterval(rotateTimer)
}
const resumeAutoRotate = () => {
  if (autoRotate.value) {
    rotateTimer = setInterval(() => {
      const idx = TABS.findIndex((t) => t.key === activeTab.value)
      activeTab.value = TABS[(idx + 1) % TABS.length].key
    }, 15000)
  }
}

const tabVisibility = computed(() => ({
  showSalesTrend: activeTab.value === 'sales' || activeTab.value === 'products',
  showOrderFlow: activeTab.value === 'sales' || activeTab.value === 'users',
  showCategoryPie: activeTab.value === 'sales' || activeTab.value === 'products',
  showScrollingTable: true,
  showUserRadar: activeTab.value === 'sales' || activeTab.value === 'users',
  showTopProducts: true,
}))

// ===== 天气/日期 =====
const weekday = computed(() => {
  const days = ['日', '一', '二', '三', '四', '五', '六']
  return `周${days[now.value.getDay()]}`
})

const weather = computed(() => {
  const h = now.value.getHours()
  // Mock 天气：根据时间段模拟
  if (h >= 6 && h < 18) return { icon: '☀', label: '晴', temp: 26 }
  if (h >= 18 && h < 20) return { icon: '🌅', label: '多云', temp: 22 }
  return { icon: '🌙', label: '晴', temp: 18 }
})

// ===== 大屏自适应缩放 =====
const presetOptions = [
  { label: '1080P', w: 1920, h: 1080, key: '1080p' as const },
  { label: '4K', w: 3840, h: 2160, key: '4k' as const },
  { label: '768P', w: 1366, h: 768, key: '768p' as const },
  { label: '自适应', w: 0, h: 0, key: 'auto' as const },
]

const currentPreset = ref<string>('1080p')
const designW = ref(1920)
const designH = ref(1080)
const scale = ref(1)
const mounted = ref(false)
let resizeRaf = 0

const handleResize = () => {
  cancelAnimationFrame(resizeRaf)
  resizeRaf = requestAnimationFrame(() => {
    if (currentPreset.value === 'auto') {
      designW.value = window.innerWidth
      designH.value = window.innerHeight
      scale.value = 1
    } else {
      scale.value = Math.min(window.innerWidth / designW.value, window.innerHeight / designH.value)
    }
  })
}

const applyPreset = (key: string) => {
  currentPreset.value = key
  const p = presetOptions.find((x) => x.key === key)!
  if (key === 'auto') {
    designW.value = window.innerWidth
    designH.value = window.innerHeight
    scale.value = 1
  } else {
    designW.value = p.w
    designH.value = p.h
    scale.value = Math.min(window.innerWidth / p.w, window.innerHeight / p.h)
  }
}

// ===== 全屏模式 =====
const isFullscreen = ref(false)

const syncFullscreenState = () => {
  isFullscreen.value = !!document.fullscreenElement
}

const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch {
    // 浏览器不支持全屏时静默忽略
  }
}

// ===== 屏幕常亮 =====
type WakeLockSentinel = { release: () => Promise<void>; addEventListener: (e: string, cb: () => void) => void }
let wakeLock: WakeLockSentinel | null = null

const requestWakeLock = async () => {
  try {
    const wl = navigator as { wakeLock?: { request: (type: string) => Promise<WakeLockSentinel> } }
    if (wl.wakeLock) {
      wakeLock = await wl.wakeLock.request('screen')
      wakeLock.addEventListener('release', () => { wakeLock = null })
    }
  } catch {
    // Wake Lock 不可用时静默忽略
  }
}

const releaseWakeLock = async () => {
  if (wakeLock) {
    await wakeLock.release()
    wakeLock = null
  }
}

const onFullscreenChange = () => {
  syncFullscreenState()
  if (document.fullscreenElement) {
    requestWakeLock()
  } else {
    releaseWakeLock()
  }
}

const onVisibilityChange = () => {
  if (document.visibilityState === 'visible' && document.fullscreenElement && !wakeLock) {
    requestWakeLock()
  }
}

// ===== 刷新频率可调 =====
const INTERVAL_OPTIONS = [
  { label: '5s', value: 5000 },
  { label: '10s', value: 10000 },
  { label: '30s', value: 30000 },
  { label: '暂停', value: 0 },
] as const

const refreshInterval = ref<number>(5000)
const isPaused = computed(() => refreshInterval.value === 0)

const restartDataTimer = () => {
  clearInterval(dataTimer)
  if (refreshInterval.value > 0) {
    dataTimer = setInterval(() => store.refresh(), refreshInterval.value)
  }
}

const setRefreshInterval = (ms: number) => {
  refreshInterval.value = ms
  restartDataTimer()
  if (ms > 0) store.refresh()
}

// ===== 数据下钻 =====
const drilldownCategory = ref<string | null>(null)
const drilldownData = computed(() => {
  if (!drilldownCategory.value) return []
  return categorySubData[drilldownCategory.value] ?? []
})

const onCategoryDrilldown = (name: string) => {
  drilldownCategory.value = name
}

const closeDrilldown = () => {
  drilldownCategory.value = null
}

// ===== 数据导出 CSV =====
const escapeCSV = (v: unknown): string => {
  const s = String(v ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
}

const downloadCSV = (filename: string, content: string) => {
  const bom = '﻿'
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const exportCSV = () => {
  const ts = formatTime(new Date()).replace(/ /g, '_').replace(/:/g, '-')
  const lines: string[] = []

  lines.push('=== 指标汇总 ===')
  lines.push('指标,数值,增长率(%)')
  lines.push(escapeCSV(['总销售额', summary.value.totalSales.toLocaleString(), summary.value.salesGrowth].join(',')))
  lines.push(escapeCSV(['订单量', summary.value.totalOrders.toLocaleString(), summary.value.orderGrowth].join(',')))
  lines.push(escapeCSV(['用户数', summary.value.totalUsers.toLocaleString(), summary.value.userGrowth].join(',')))
  lines.push(escapeCSV(['转化率', summary.value.conversionRate + '%', summary.value.conversionGrowth].join(',')))

  lines.push('')
  lines.push('=== 销售趋势 ===')
  lines.push('时间,销售额,订单量')
  salesTrend.value.forEach((item) => {
    lines.push([item.date, item.amount, item.orderCount].join(','))
  })

  lines.push('')
  lines.push('=== 品类占比 ===')
  lines.push('品类,占比,增长率(%)')
  categories.value.forEach((c) => {
    lines.push([c.name, c.value, c.growth].join(','))
  })

  lines.push('')
  lines.push('=== 实时订单 ===')
  lines.push('订单ID,商品,价格,渠道,城市,时间')
  orderFlow.value.forEach((o) => {
    lines.push([o.id, o.product, o.price, o.channel, o.city, o.time].join(','))
  })

  lines.push('')
  lines.push('=== 用户画像 ===')
  lines.push('维度,数值,满分')
  userProfile.value.forEach((d) => {
    lines.push([d.dimension, d.value, d.max].join(','))
  })

  lines.push('')
  lines.push('=== 热销TOP10 ===')
  lines.push('排名,商品,销售额,趋势(%)')
  topProducts.value.forEach((p) => {
    lines.push([p.rank, p.name, p.sales, p.trend].join(','))
  })

  lines.push('')
  lines.push('=== 实时事件 ===')
  lines.push('事件,详情,时间')
  scrollingLogs.value.forEach((l) => {
    lines.push([l.event, l.detail, l.time].join(','))
  })

  downloadCSV(`dashboard_${ts}.csv`, lines.join('\n'))
}

// ===== 键盘快捷键 =====
const showHelp = ref(false)
const showRefreshToast = ref(false)

const flashRefreshToast = () => {
  showRefreshToast.value = true
  setTimeout(() => { showRefreshToast.value = false }, 1200)
}

const onKeydown = (e: KeyboardEvent) => {
  if (document.activeElement?.tagName === 'INPUT') return

  if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    toggleFullscreen()
  } else if (e.key === 'r' || e.key === 'R') {
    e.preventDefault()
    store.refresh()
    flashRefreshToast()
  } else if (e.key === 'Escape') {
    if (showHelp.value) {
      showHelp.value = false
    } else if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  } else if (e.key === '?') {
    e.preventDefault()
    showHelp.value = !showHelp.value
  }
}

// ===== 生命周期 =====
onMounted(() => {
  scale.value = Math.min(window.innerWidth / designW.value, window.innerHeight / designH.value)
  mounted.value = true

  window.addEventListener('resize', handleResize)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('visibilitychange', onVisibilityChange)
  window.addEventListener('keydown', onKeydown)

  store.refresh()
  restartDataTimer()
  // 启动 WebSocket 模拟推送
  if (import.meta.env.VITE_USE_MOCK !== 'false') {
    ws.connect()
  }
  clockTimer = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(dataTimer)
  clearInterval(clockTimer)
  clearInterval(rotateTimer)
  cancelAnimationFrame(resizeRaf)
  releaseWakeLock()
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('visibilitychange', onVisibilityChange)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="scale-shell">
    <div class="dashboard" :style="{ width: `${designW}px`, height: `${designH}px`, transform: `scale(${scale})`, visibility: mounted ? 'visible' : 'hidden' }">
      <!-- 顶部标题栏 -->
      <header class="dash-header">
        <div class="header-left">
          <h1>电商实时数据大屏</h1>
          <span class="weather-widget">
            <span class="weather-icon">{{ weather.icon }}</span>
            <span class="weather-temp">{{ weather.temp }}°C</span>
            <span class="weather-label">{{ weather.label }}</span>
          </span>
          <span class="date-widget">{{ weekday }} {{ formatTime(now).slice(0, 10) }}</span>
        </div>
        <div class="header-center">
          <!-- 时间周期筛选 -->
          <span class="filter-label">周期</span>
          <button
            v-for="p in PERIOD_OPTIONS"
            :key="p"
            class="interval-btn"
            :class="{ active: period === p }"
            @click="store.setPeriod(p)"
          >
            {{ PERIOD_LABELS[p] }}
          </button>
          <span class="header-sep">|</span>
          <!-- 刷新频率 -->
          <span class="interval-label">刷新</span>
          <button
            v-for="opt in INTERVAL_OPTIONS"
            :key="opt.value"
            class="interval-btn"
            :class="{ active: refreshInterval === opt.value }"
            @click="setRefreshInterval(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
        <div class="header-right">
          <!-- 分辨率预设 -->
          <span class="interval-label">分辨率</span>
          <button
            v-for="po in presetOptions"
            :key="po.key"
            class="interval-btn"
            :class="{ active: currentPreset === po.key }"
            @click="applyPreset(po.key)"
          >
            {{ po.label }}
          </button>
          <span class="header-sep">|</span>
          <span v-if="loading" class="refresh-tag">刷新中...</span>
          <span v-else-if="lastUpdated && !isPaused" class="refresh-tag">
            更新于 {{ formatTime(lastUpdated) }}
          </span>
          <span v-else-if="isPaused" class="refresh-tag paused-tag">已暂停</span>
          <button class="header-btn" title="导出 CSV" @click="exportCSV">
            <span class="btn-icon">↓</span> 导出
          </button>
          <button class="header-btn" :title="isFullscreen ? '退出全屏 (F)' : '全屏 (F)'" @click="toggleFullscreen">
            <span class="btn-icon">{{ isFullscreen ? '✕' : '⛶' }}</span>
            {{ isFullscreen ? '退出' : '全屏' }}
          </button>
          <span class="time">{{ formatTime(now) }}</span>
        </div>
      </header>

      <!-- Tab 切换栏 -->
      <div class="tab-bar">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="tab-btn"
          :class="{ active: activeTab === t.key }"
          @click="activeTab = t.key"
        >
          {{ t.label }}
        </button>
        <button class="tab-btn auto-rotate-btn" :class="{ active: autoRotate }" @click="toggleAutoRotate" title="自动轮播 (15s)">
          {{ autoRotate ? '⏸ 轮播中' : '▶ 轮播' }}
        </button>
      </div>

      <!-- 错误横幅 -->
      <div v-if="error" class="error-banner">
        <span class="error-icon">!</span>
        <span class="error-msg">{{ error.message }}</span>
        <button class="error-retry" @click="store.clearError(); store.refresh()">重试</button>
        <button class="error-dismiss" @click="store.clearError()">×</button>
      </div>

      <!-- 四列指标卡片 -->
      <DataHeader />

      <!-- 主体三栏栅格 -->
      <div class="dash-body" @mouseenter="pauseAutoRotate" @mouseleave="resumeAutoRotate">
        <div class="col col-left">
          <SalesTrend v-if="tabVisibility.showSalesTrend" />
          <OrderFlow v-if="tabVisibility.showOrderFlow" />
        </div>
        <div class="col col-center">
          <CategoryPie v-if="tabVisibility.showCategoryPie" @drilldown="onCategoryDrilldown" />
          <ScrollingTable v-if="tabVisibility.showScrollingTable" />
        </div>
        <div class="col col-right">
          <UserRadar v-if="tabVisibility.showUserRadar" />
          <TopProducts v-if="tabVisibility.showTopProducts" />
        </div>
      </div>

      <!-- 刷新提示 Toast -->
      <Teleport to="body">
        <div v-if="showRefreshToast" class="refresh-toast">数据已刷新</div>
      </Teleport>

      <!-- 快捷键帮助浮层 -->
      <Teleport to="body">
        <div v-if="showHelp" class="help-overlay" @click.self="showHelp = false">
          <div class="help-panel">
            <div class="help-title">快捷键</div>
            <div class="help-list">
              <div class="help-row"><kbd>F</kbd> 全屏 / 退出全屏</div>
              <div class="help-row"><kbd>R</kbd> 手动刷新数据</div>
              <div class="help-row"><kbd>Esc</kbd> 退出全屏 / 关闭面板</div>
              <div class="help-row"><kbd>?</kbd> 显示 / 隐藏此帮助</div>
            </div>
            <button class="help-close" @click="showHelp = false">关闭</button>
          </div>
        </div>
      </Teleport>

      <!-- 下钻浮层 -->
      <Teleport to="body">
        <div v-if="drilldownCategory" class="drilldown-overlay" @click.self="closeDrilldown">
          <div class="drilldown-panel">
            <div class="drilldown-header">
              <span class="drilldown-title">{{ drilldownCategory }} — 子类目明细</span>
              <button class="drilldown-close" @click="closeDrilldown">×</button>
            </div>
            <div class="drilldown-body">
              <div
                v-for="(item, i) in drilldownData"
                :key="item.name"
                class="drilldown-row"
              >
                <span class="drilldown-rank" :style="{ background: i < 3 ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)' }">{{ i + 1 }}</span>
                <span class="drilldown-name">{{ item.name }}</span>
                <div class="drilldown-bar-wrap">
                  <div
                    class="drilldown-bar"
                    :style="{ width: `${(item.value / 50) * 100}%` }"
                  ></div>
                </div>
                <span class="drilldown-val">{{ item.value }}%</span>
                <span class="drilldown-growth" :class="item.growth >= 0 ? 'data-up' : 'data-down'">
                  {{ item.growth >= 0 ? '↑' : '↓' }}{{ Math.abs(item.growth) }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scale-shell {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.dashboard {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform-origin: center center;
}

.dash-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  flex-shrink: 0;
  gap: 16px;

  h1 {
    font-size: 24px;
    font-weight: 600;
    background: linear-gradient(90deg, #00d4ff, #00ff88);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    letter-spacing: 2px;
    white-space: nowrap;
  }

  .header-center {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .refresh-tag {
    font-size: 12px;
    color: var(--text-secondary);
    opacity: 0.7;
  }

  .paused-tag {
    color: var(--accent-yellow);
    opacity: 1;
  }

  .time {
    color: var(--text-secondary);
    font-size: 15px;
    white-space: nowrap;
  }

  .header-sep {
    color: rgba(255,255,255,0.08);
    margin: 0 6px;
    font-size: 14px;
  }
}

// 刷新频率按钮 & 周期 & 分辨率 共用
.interval-label,
.filter-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-right: 2px;
}

.interval-btn {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--border-active);
    color: var(--text-primary);
  }

  &.active {
    background: rgba(0, 212, 255, 0.12);
    border-color: rgba(0, 212, 255, 0.35);
    color: var(--accent-cyan);
  }
}

// 头部功能按钮
.header-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: var(--border-active);
    color: var(--text-primary);
  }

  .btn-icon {
    font-size: 13px;
  }
}

// 错误横幅
.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  margin-bottom: 4px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  flex-shrink: 0;
}

.error-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--accent-red);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.error-msg {
  flex: 1;
  font-size: 13px;
  color: var(--accent-red);
}

.error-retry {
  padding: 4px 14px;
  background: rgba(255, 107, 107, 0.2);
  border: 1px solid rgba(255, 107, 107, 0.4);
  border-radius: 3px;
  color: var(--accent-red);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 107, 107, 0.35);
  }
}

.error-dismiss {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
}

.dash-body {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
}

.col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.col-left  { flex: 3; }
.col-center { flex: 4; }
.col-right  { flex: 3; }

// ===== 下钻浮层 =====
.drilldown-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.drilldown-panel {
  width: 480px;
  max-height: 560px;
  background: var(--bg-card);
  border: 1px solid var(--border-active);
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}

.drilldown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-card);
}

.drilldown-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--accent-cyan);
}

.drilldown-close {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;

  &:hover { color: var(--text-primary); }
}

.drilldown-body {
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drilldown-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.drilldown-rank {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 11px;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.drilldown-name {
  width: 80px;
  font-size: 12px;
  color: var(--text-primary);
  flex-shrink: 0;
}

.drilldown-bar-wrap {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 4px;
  overflow: hidden;
}

.drilldown-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-cyan), var(--accent-green));
  border-radius: 4px;
  transition: width 0.4s ease;
}

.drilldown-val {
  width: 36px;
  text-align: right;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
}

.drilldown-growth {
  width: 52px;
  text-align: right;
  font-size: 11px;
}

// ===== 头部左侧：天气 & 日期 =====
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.weather-widget {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.weather-icon {
  font-size: 16px;
}

.weather-temp {
  color: var(--accent-green);
  font-weight: 600;
}

.date-widget {
  font-size: 11px;
  color: var(--text-secondary);
  opacity: 0.7;
}

// ===== Tab 切换栏 =====
.tab-bar {
  display: flex;
  gap: 0;
  margin-bottom: 6px;
  flex-shrink: 0;
}

.tab-btn {
  padding: 5px 24px;
  font-size: 12px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: var(--text-primary);
    border-bottom-color: rgba(0, 212, 255, 0.3);
  }

  &.active {
    color: var(--accent-cyan);
    border-bottom-color: var(--accent-cyan);
  }
}

// ===== 刷新 Toast =====
.refresh-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 24px;
  background: rgba(0, 255, 136, 0.15);
  border: 1px solid rgba(0, 255, 136, 0.35);
  border-radius: 4px;
  color: var(--accent-green);
  font-size: 13px;
  z-index: 99999;
  animation: toastIn 1.2s ease forwards;
}

@keyframes toastIn {
  0%   { opacity: 0; transform: translateX(-50%) translateY(-10px); }
  15%  { opacity: 1; transform: translateX(-50%) translateY(0); }
  70%  { opacity: 1; }
  100% { opacity: 0; }
}

// ===== 快捷键帮助浮层 =====
.help-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.help-panel {
  width: 360px;
  background: var(--bg-card);
  border: 1px solid var(--border-active);
  border-radius: 6px;
  padding: 24px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
}

.help-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--accent-cyan);
  margin-bottom: 16px;
}

.help-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.help-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-primary);

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 22px;
    padding: 0 6px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 3px;
    font-size: 11px;
    font-family: inherit;
    color: var(--accent-cyan);
  }
}

.help-close {
  display: block;
  width: 100%;
  padding: 6px 0;
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 3px;
  color: var(--accent-cyan);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover { background: rgba(0, 212, 255, 0.2); }
}
</style>
