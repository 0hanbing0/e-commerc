# 问题记录

## 2026-05-26

### 图表加载失败
- **现象**: 3 个 ECharts 图表组件显示“图表加载失败”
- **原因**: `ref="chartRef"` 绑定在 `v-if/v-else` 分支内的 div 上，`onMounted` 时 status 为 `loading`，该 div 尚未渲染到 DOM，`chartRef.value` 为 `undefined`，`init()` 拿到 `null` 后触发 `showError()`
- **修复**: 图表容器 div 改为始终渲染（无 v-if/v-show），用绝对定位 overlay + `var(--bg-card)` 实色背景覆盖，在 loading/error/empty 时遮挡图表
- **涉及文件**: `SalesTrend.vue`, `CategoryPie.vue`, `UserRadar.vue`

### 图表挤在一起
- **现象**: 修复上图问题后，图表卡片全部坍塌，没有正常高度
- **原因**: 之前用 `v-show` 控制图表 div 可见性，loading 时 div 为 `display:none`，ECharts 在 0×0 容器上初始化，即使后续变为可见也不会自动 resize
- **修复**: 移除 `v-show`，`setOption()` 后加 `await nextTick(); chart?.resize()` 确保 ECharts 拿到真实尺寸后重新计算
- **涉及文件**: `SalesTrend.vue`, `CategoryPie.vue`, `UserRadar.vue`

### axios 响应拦截器类型报错
- **现象**: TypeScript / 运行时拦截器报错
- **原因**:
  1. `res.config` 类型（`AxiosResponse.config`）传给 `removePending`（期望 `InternalAxiosRequestConfig`）类型不兼容
  2. `res.data as ApiResponse` 强转，无运行时校验，后端返回非标准格式时会出错
  3. `config.signal = controller.signal` —— Axios v1.x 中 `signal` 属性类型严格，直接赋值 TS 可能报错
- **修复**:
  1. `res.config as InternalAxiosRequestConfig` 显式断言
  2. 新增 `isApiResponse` 类型守卫函数，运行时检查 `{ code, message, data }` 结构
  3. `config.signal` 改为 `(config as Record<string, unknown>).signal = ctrl.signal`
- **涉及文件**: `src/utils/request.ts`
