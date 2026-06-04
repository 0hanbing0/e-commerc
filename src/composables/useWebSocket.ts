import { ref, onUnmounted } from 'vue'

export type WsStatus = 'connecting' | 'connected' | 'disconnected'

export interface WsMessage {
  type: 'data-update' | 'alert' | 'order'
  payload: Record<string, unknown>
}

/**
 * WebSocket 模拟连接 composable
 *
 * 当 import.meta.env.VITE_USE_MOCK !== 'false' 时，通过定时器模拟服务端推送。
 * 当真实 WebSocket 后端就绪时，替换 connect() 中的实现即可。
 */
export const useWebSocket = (onMessage?: (msg: WsMessage) => void) => {
  const status = ref<WsStatus>('disconnected')
  let timer: ReturnType<typeof setInterval> | undefined
  let seq = 0

  const connect = () => {
    if (status.value === 'connected') return
    status.value = 'connecting'

    // 模拟连接建立延迟
    setTimeout(() => {
      status.value = 'connected'

      // 模拟服务端推送：每 3-8 秒随机推送一条消息
      const schedule = () => {
        const delay = 3000 + Math.random() * 5000
        timer = setTimeout(() => {
          if (status.value !== 'connected') return
          seq++
          const messages: WsMessage[] = [
            { type: 'data-update', payload: { field: 'summary', seq } },
            { type: 'order', payload: { orderId: `WS${String(seq).padStart(4, '0')}`, amount: Math.floor(Math.random() * 5000 + 500) } },
            { type: 'alert', payload: { level: Math.random() > 0.7 ? 'warning' : 'info', message: `服务端推送事件 #${seq}` } },
          ]
          const msg = messages[Math.floor(Math.random() * messages.length)]
          onMessage?.(msg)
          schedule()
        }, delay)
      }
      schedule()
    }, 600)
  }

  const disconnect = () => {
    clearTimeout(timer)
    status.value = 'disconnected'
  }

  onUnmounted(disconnect)

  return { status, connect, disconnect }
}
