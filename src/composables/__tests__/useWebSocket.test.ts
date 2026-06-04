import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useWebSocket } from '@/composables/useWebSocket'

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初始 status 为 disconnected', () => {
    const { status } = useWebSocket()
    expect(status.value).toBe('disconnected')
  })

  it('connect() 后 status 变为 connected', async () => {
    const { status, connect } = useWebSocket()
    connect()
    // 模拟 600ms 连接建立延迟
    await vi.advanceTimersByTimeAsync(700)
    expect(status.value).toBe('connected')
  })

  it('connect() 后收到 onMessage 回调', async () => {
    const messages: unknown[] = []
    const { connect } = useWebSocket((msg) => messages.push(msg))
    connect()
    await vi.advanceTimersByTimeAsync(700) // 连接
    await vi.advanceTimersByTimeAsync(9000) // 等待第一次推送
    expect(messages.length).toBeGreaterThanOrEqual(1)
    expect(messages[0]).toHaveProperty('type')
    expect(messages[0]).toHaveProperty('payload')
  })

  it('disconnect() 后 status 变为 disconnected', async () => {
    const { status, connect, disconnect } = useWebSocket()
    connect()
    await vi.advanceTimersByTimeAsync(700)
    expect(status.value).toBe('connected')
    disconnect()
    expect(status.value).toBe('disconnected')
  })

  it('重复 connect() 不重复连接', async () => {
    const { status, connect } = useWebSocket()
    connect()
    await vi.advanceTimersByTimeAsync(700)
    expect(status.value).toBe('connected')
    connect() // 第二次
    expect(status.value).toBe('connected')
  })

  it('新消息 seq 递增', async () => {
    const messages: { payload: { seq?: number } }[] = []
    const { connect } = useWebSocket((msg) => {
      if (msg.type === 'data-update') messages.push(msg as { payload: { seq?: number } })
    })
    connect()
    await vi.advanceTimersByTimeAsync(700)
    // 快进足够长的时间等多个消息
    await vi.advanceTimersByTimeAsync(30000)
    const dataMsgs = messages.filter((m) => m.payload.seq !== undefined)
    for (let i = 1; i < dataMsgs.length; i++) {
      expect(dataMsgs[i].payload.seq!).toBeGreaterThan(dataMsgs[i - 1].payload.seq!)
    }
  })
})
