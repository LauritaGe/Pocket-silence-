import { useEffect, useRef, useState } from 'react'

/**
 * Sincroniza el estado de "mute" entre el control (celu) y la TV simulada a
 * traves del relay WebSocket. Si no hay servidor, degrada a estado local para
 * que la app siga funcionando en un hosting estatico.
 */
export function useSync(room = 'demo') {
  const wsRef = useRef(null)
  const [muted, setMutedState] = useState(false)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    let closed = false
    let retry

    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
      let ws
      try {
        ws = new WebSocket(`${proto}://${window.location.host}/sync?room=${encodeURIComponent(room)}`)
      } catch {
        return
      }
      wsRef.current = ws
      ws.onopen = () => {
        if (!closed) setConnected(true)
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'state') setMutedState(msg.muted)
        } catch {
          /* ignore malformed */
        }
      }
      ws.onclose = () => {
        if (closed) return
        setConnected(false)
        retry = window.setTimeout(connect, 1500)
      }
      ws.onerror = () => ws.close()
    }

    connect()
    return () => {
      closed = true
      window.clearTimeout(retry)
      wsRef.current?.close()
    }
  }, [room])

  function setMuted(next) {
    setMutedState(next)
    const ws = wsRef.current
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'set', muted: next }))
    }
  }

  return { muted, connected, setMuted }
}
