import request from '@/utils/request'
import type { ApiResponse, DashboardSummary } from '@/types'

// API 层 —— 目前仅定义结构，实际数据走 mock
// 后端就绪后，在 Store 的 refresh 中调用这些方法替换 mock 即可

export const getDashboardSummary = () =>
  request.get<ApiResponse<DashboardSummary>>('/dashboard/summary')

export const getSalesTrend = () => request.get<ApiResponse>('/dashboard/sales-trend')

export const getCategoryData = () => request.get<ApiResponse>('/dashboard/category')

export const getOrderFlow = () => request.get<ApiResponse>('/dashboard/order-flow')

export const getUserProfile = () => request.get<ApiResponse>('/dashboard/user-profile')

export const getTopProducts = () => request.get<ApiResponse>('/dashboard/top-products')
