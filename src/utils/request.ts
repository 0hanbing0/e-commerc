import axios from 'axios'

// Axios 实例 —— 统一配置 baseURL 和超时时间
const instance = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// 请求拦截器：可在此处注入 Token 等公共请求头
instance.interceptors.request.use(
  (config) => config,
  (err) => Promise.reject(err),
)

// 响应拦截器：统一解包 —— code=0 返回 data，否则 reject
instance.interceptors.response.use(
  (res) => {
    if (res.data.code === 0) {
      return res.data
    }
    return Promise.reject(res.data)
  },
  (err) => {
    if (err.response) {
      return Promise.reject(err.response.data)
    }
    return Promise.reject(err)
  },
)

export default instance
