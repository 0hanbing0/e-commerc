import request from '@/utils/request'
import type {
  DashboardSummary,
  SalesTrendItem,
  CategoryItem,
  OrderItem,
  UserProfileItem,
  TopProductItem,
  ScrollingItem,
} from '@/types'
import {
  summaryData,
  salesTrendData,
  categoryData,
  orderFlowData,
  userProfileData,
  topProductsData,
  scrollingData,
} from '@/mock/dashboard'

const useMock = (): boolean => import.meta.env.VITE_USE_MOCK !== 'false'

// 模拟延迟，模拟网络请求耗时
const delay = (ms = 200) => new Promise<void>((r) => setTimeout(r, ms))

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  if (useMock()) {
    await delay()
    return { ...summaryData }
  }
  return request.get<unknown, DashboardSummary>('/dashboard/summary')
}

export const getSalesTrend = async (params?: Record<string, string>): Promise<SalesTrendItem[]> => {
  if (useMock()) {
    await delay()
    return [...salesTrendData]
  }
  return request.get<unknown, SalesTrendItem[]>('/dashboard/sales-trend', { params })
}

export const getCategoryData = async (): Promise<CategoryItem[]> => {
  if (useMock()) {
    await delay()
    return [...categoryData]
  }
  return request.get<unknown, CategoryItem[]>('/dashboard/category')
}

export const getOrderFlow = async (params?: Record<string, string>): Promise<OrderItem[]> => {
  if (useMock()) {
    await delay(150)
    return [...orderFlowData]
  }
  return request.get<unknown, OrderItem[]>('/dashboard/order-flow', { params })
}

export const getUserProfile = async (): Promise<UserProfileItem[]> => {
  if (useMock()) {
    await delay()
    return [...userProfileData]
  }
  return request.get<unknown, UserProfileItem[]>('/dashboard/user-profile')
}

export const getTopProducts = async (params?: Record<string, string>): Promise<TopProductItem[]> => {
  if (useMock()) {
    await delay()
    return [...topProductsData]
  }
  return request.get<unknown, TopProductItem[]>('/dashboard/top-products', { params })
}

export const getScrollingLogs = async (): Promise<ScrollingItem[]> => {
  if (useMock()) {
    await delay(150)
    return [...scrollingData]
  }
  return request.get<unknown, ScrollingItem[]>('/dashboard/scrolling-logs')
}
