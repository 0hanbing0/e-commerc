// 仪表盘所有数据结构的类型定义
// 作用：组件、Store、Mock 数据全部引用这些接口，改一个字段 TS 全链路报错

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

/** 统一 API 响应格式，T 为具体数据类型 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}
