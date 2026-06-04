import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './assets/styles/global.scss'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// 设置页面标题
document.title = import.meta.env.VITE_APP_TITLE || '电商实时数据大屏'

// ===== 全局 Vue 错误捕获 =====
app.config.errorHandler = (err, _instance, info) => {
  console.error(`[Vue Error] ${info}:`, err)
  // 生产环境可接入 Sentry / 日志上报
  // if (import.meta.env.PROD) { reportError(err, info) }
}

// ===== 全局 unhandled promise 错误 =====
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise]', event.reason)
  // 仅在生产环境抑制默认错误输出，开发环境保留完整堆栈
  if (import.meta.env.PROD) {
    event.preventDefault()
  }
})

app.mount('#app')

// 页面加载成功后清除 chunk-retry 标志，确保后续 chunk 失败仍可重试
sessionStorage.removeItem('chunk-retry')
