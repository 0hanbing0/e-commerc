// 仪表盘所有数据结构的类型定义

// ===== 业务数据类型 =====

/** 销售趋势 - 折线图 */
export interface SalesTrendItem {
  date: string
  amount: number
  orderCount: number
}

/** 分类占比 - 饼图 */
export interface CategoryItem {
  name: string
  value: number
  growth: number
}

/** 实时订单 - 订单流列表 */
export interface OrderItem {
  id: string
  product: string
  price: number
  channel: string
  city: string
  time: string
}

/** 用户画像 - 雷达图 */
export interface UserProfileItem {
  dimension: string
  value: number
  max: number
}

/** 热销商品 - 排行榜 */
export interface TopProductItem {
  rank: number
  name: string
  sales: number
  trend: number
}

/** 顶部指标卡 - 汇总数据 */
export interface DashboardSummary {
  totalSales: number
  totalOrders: number
  totalUsers: number
  conversionRate: number
  salesGrowth: number
  orderGrowth: number
  userGrowth: number
  conversionGrowth: number
}

/** 实时滚动日志 */
export interface ScrollingItem {
  id: number
  event: string
  detail: string
  time: string
}

// ===== API 类型 =====

/** 统一 API 响应格式 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// ===== 错误类型 =====

/** 请求错误 —— 拦截器统一包装后抛出 */
export interface RequestError {
  code: number
  message: string
  data: unknown
}

/** 图表组件状态 */
export type ChartStatus = 'loading' | 'success' | 'error' | 'empty'
