import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'
import type { ApiResponse, RequestError } from '@/types'

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 15000,
})

// ===== 请求去重 =====
const pendingMap = new Map<string, AbortController>()

const getRequestKey = (config: InternalAxiosRequestConfig): string =>
  `${config.method}:${config.url}:${JSON.stringify(config.params ?? {})}`

const addPending = (config: InternalAxiosRequestConfig) => {
  const key = getRequestKey(config)
  if (pendingMap.has(key)) {
    pendingMap.get(key)!.abort()
  }
  const ctrl = new AbortController()
  // Axios v1.x InternalAxiosRequestConfig.signal 接受 AbortSignal
  config.signal = ctrl.signal
  pendingMap.set(key, ctrl)
}

const removePending = (config: InternalAxiosRequestConfig) => {
  const key = getRequestKey(config)
  pendingMap.delete(key)
}

// ===== 请求拦截器 =====
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.method?.toLowerCase() === 'get') {
      addPending(config)
    }

    return config
  },
  (err: AxiosError) => {
    if (err.config) removePending(err.config as InternalAxiosRequestConfig)
    return Promise.reject(err)
  },
)

// 检查响应是否为 ApiResponse 结构
const isApiResponse = (data: unknown): data is ApiResponse<unknown> =>
  typeof data === 'object' && data !== null && 'code' in data

// ===== 响应拦截器 =====
instance.interceptors.response.use(
  (res: AxiosResponse) => {
    removePending(res.config as InternalAxiosRequestConfig)

    const data = res.data

    if (!isApiResponse(data)) {
      // 响应格式不符合约定，直接返回原始数据
      return data
    }

    if (data.code === 0) {
      return data.data
    }

    // 业务错误码
    switch (data.code) {
      case 401:
        localStorage.removeItem('token')
        console.warn('[Request] 登录已过期，请重新登录')
        break
      case 403:
        console.warn('[Request] 权限不足:', data.message)
        break
      default:
        console.warn(`[Request] 业务异常 code=${data.code}:`, data.message)
    }

    return Promise.reject(data)
  },
  (err: AxiosError) => {
    // 请求被取消
    if (axios.isCancel(err)) {
      return Promise.reject(err)
    }

    // 网络异常 / 超时 / CORS（请求已发出但无响应）
    if (!err.response) {
      const networkError: RequestError = {
        code: -1,
        message:
          err.code === 'ECONNABORTED'
            ? '请求超时，请检查网络'
            : '网络连接失败，请检查网络',
        data: null,
      }
      return Promise.reject(networkError)
    }

    // HTTP 状态码异常
    const { status, data } = err.response
    const serverMsg =
      typeof data === 'object' && data !== null && 'message' in data
        ? (data as Record<string, unknown>).message as string
        : ''

    const statusText: Record<number, string> = {
      400: '请求参数有误',
      401: '登录已过期，请重新登录',
      403: '没有访问权限',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关异常',
      503: '服务暂不可用',
    }

    if (status === 401) {
      localStorage.removeItem('token')
      console.warn('[Request] HTTP 401 — 登录已过期')
    }

    const appError: RequestError = {
      code: status,
      message: serverMsg || statusText[status] || `请求失败(${status})`,
      data: null,
    }

    return Promise.reject(appError)
  },
)

export default instance
