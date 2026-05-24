import type {
  SalesTrendItem,
  CategoryItem,
  OrderItem,
  UserProfileItem,
  TopProductItem,
  DashboardSummary,
  ScrollingItem,
} from '@/types'

// 所有模拟数据集中管理，方便后续替换为真实接口
// 数据格式由 @/types 接口约束，写错字段编译时报错

/** 销售趋势 - 生成 30 个时间点模拟 24h 数据 */
export const salesTrendData: SalesTrendItem[] = Array.from({ length: 30 }, (_, i) => ({
  date: `${String(i + 1).padStart(2, '0')}:00`,
  amount: Math.floor(50000 + Math.random() * 80000),
  orderCount: Math.floor(200 + Math.random() * 600),
}))

/** 分类占比 - 电商五大类目 */
export const categoryData: CategoryItem[] = [
  { name: '数码电子', value: 38, growth: 12.5 },
  { name: '服饰鞋包', value: 25, growth: -3.2 },
  { name: '美妆个护', value: 18, growth: 8.7 },
  { name: '食品生鲜', value: 12, growth: 15.3 },
  { name: '家居家装', value: 7, growth: -1.8 },
]

/** 实时订单流 - 模拟最近 10 笔订单 */
export const orderFlowData: OrderItem[] = [
  { id: 'DD20240523001', product: 'iPhone 15 Pro Max', price: 9999, channel: 'APP', city: '北京', time: '14:23:05' },
  { id: 'DD20240523002', product: 'MacBook Pro 14', price: 14999, channel: 'PC', city: '上海', time: '14:23:12' },
  { id: 'DD20240523003', product: 'AirPods Pro', price: 1899, channel: 'APP', city: '深圳', time: '14:23:18' },
  { id: 'DD20240523004', product: 'Nike Air Max', price: 899, channel: '小程序', city: '广州', time: '14:23:25' },
  { id: 'DD20240523005', product: 'SK-II 神仙水', price: 1540, channel: 'APP', city: '杭州', time: '14:23:31' },
  { id: 'DD20240523006', product: '戴森吸尘器 V15', price: 4990, channel: 'PC', city: '成都', time: '14:23:38' },
  { id: 'DD20240523007', product: 'iPad Air', price: 4799, channel: 'APP', city: '武汉', time: '14:23:42' },
  { id: 'DD20240523008', product: 'Huawei Mate 60', price: 6999, channel: '小程序', city: '南京', time: '14:23:50' },
  { id: 'DD20240523009', product: '兰蔻小黑瓶', price: 1100, channel: 'APP', city: '重庆', time: '14:23:57' },
  { id: 'DD20240523010', product: 'Sony WH-1000XM5', price: 2299, channel: 'PC', city: '西安', time: '14:24:03' },
]

/** 用户画像 - 雷达图六个维度 */
export const userProfileData: UserProfileItem[] = [
  { dimension: '消费力', value: 82, max: 100 },
  { dimension: '活跃度', value: 76, max: 100 },
  { dimension: '品牌偏好', value: 65, max: 100 },
  { dimension: '价格敏感', value: 43, max: 100 },
  { dimension: '复购率', value: 58, max: 100 },
  { dimension: '社交分享', value: 71, max: 100 },
]

/** 热销商品 TOP10 - 含环比趋势 */
export const topProductsData: TopProductItem[] = [
  { rank: 1, name: 'iPhone 15 Pro Max 256GB', sales: 28965, trend: 12.5 },
  { rank: 2, name: 'MacBook Pro 14 M3 Pro', sales: 18432, trend: 8.3 },
  { rank: 3, name: 'AirPods Pro 第二代', sales: 15678, trend: -2.1 },
  { rank: 4, name: '戴森 V15 无绳吸尘器', sales: 12450, trend: 5.7 },
  { rank: 5, name: '华为 Mate 60 Pro', sales: 11230, trend: 15.2 },
  { rank: 6, name: 'Nike Dunk Low', sales: 9876, trend: -5.8 },
  { rank: 7, name: '兰蔻极光精华', sales: 8654, trend: 22.1 },
  { rank: 8, name: 'iPad Air M2', sales: 7432, trend: 3.4 },
  { rank: 9, name: 'Sony WH-1000XM5', sales: 6210, trend: -1.2 },
  { rank: 10, name: 'SK-II 神仙水 230ml', sales: 5890, trend: 18.6 },
]

/** 顶部指标卡汇总 */
export const summaryData: DashboardSummary = {
  totalSales: 12867980,
  totalOrders: 45623,
  totalUsers: 893456,
  conversionRate: 3.82,
  salesGrowth: 23.5,
  orderGrowth: 18.7,
  userGrowth: 12.3,
  conversionGrowth: -1.2,
}

/** 实时滚动事件日志 */
export const scrollingData: ScrollingItem[] = [
  { id: 1, event: '大额订单', detail: '用户 138****6789 下单 ¥12,999', time: '14:23:05' },
  { id: 2, event: '支付成功', detail: '订单 DD20240523005 支付成功', time: '14:23:18' },
  { id: 3, event: '库存预警', detail: 'iPhone 15 Pro 深色版 库存不足 50 件', time: '14:23:32' },
  { id: 4, event: '退款申请', detail: '订单 DD20240522098 申请退款', time: '14:23:45' },
  { id: 5, event: '新注册', detail: '新用户 185****4321 注册成功', time: '14:24:01' },
  { id: 6, event: '活动触发', detail: '"618 开门红" 优惠券领取量突破 10 万', time: '14:24:15' },
  { id: 7, event: '物流异常', detail: '订单 DD20240521056 物流超时 48h', time: '14:24:28' },
  { id: 8, event: '好评', detail: '商品 MacBook Pro 14 获 100 字好评', time: '14:24:42' },
]
