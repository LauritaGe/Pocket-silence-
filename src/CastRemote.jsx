import { useEffect, useState } from 'react'
import { SpeakerOff, SpeakerOn } from './icons'

// App id del Default Media Receiver de Google Cast (no requiere registro).
const DEFAULT_RECEIVER = 'CC1AD845'
const SDK_SRC = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'

/**
 * Control real vía Google Cast: desde Chrome de Android, en la misma WiFi que
 * la TV, vincula una sesión de Cast y mutea el volumen del dispositivo.
 * Solo funciona con TVs Android TV / Chromecast integrado y navegadores con
 * soporte de Cast. No hace jamming ni interferencia: usa la API oficial.
 */
export function CastRemote() {
  const [status, setStatus] = useState('loading') // loading | unavailable | ready | connecting | connected
  const [device, setDevice] = useState('')
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) initCast()
      else setStatus('unavailable')
    }

    if (window.cast?.framework) {
      initCast()
    } else if (!document.getElementById('cast-sdk')) {
      const s = document.createElement('script')
      s.id = 'cast-sdk'
      s.src = SDK_SRC
      s.onerror = () => setStatus('unavailable')
      document.head.appendChild(s)
    }

    const timeout = window.setTimeout(() => {
      setStatus((prev) => (prev === 'loading' ? 'unavailable' : prev))
    }, 5000)
    return () => window.clearTimeout(timeout)
  }, [])

  function initCast() {
    const { cast, chrome } = window
    if (!cast?.framework || !chrome?.cast) {
      setStatus('unavailable')
      return
    }
    const context = cast.framework.CastContext.getInstance()
    context.setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID || DEFAULT_RECEIVER,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    })

    context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
      const s = event.sessionState
      const session = context.getCurrentSession()
      const S = cast.framework.SessionState
      if (s === S.SESSION_STARTED || s === S.SESSION_RESUMED) {
        setDevice(session?.getCastDevice?.()?.friendlyName || 'TV')
        setMuted(Boolean(session?.isMute?.()))
        setStatus('connected')
      } else if (s === S.SESSION_ENDED) {
        setDevice('')
        setStatus('ready')
      }
    })

    setStatus('ready')
  }

  function connect() {
    const { cast } = window
    if (!cast?.framework) return
    setStatus('connecting')
    cast.framework.CastContext.getInstance()
      .requestSession()
      .catch(() => setStatus('ready'))
  }

  function toggleMute() {
    const { cast } = window
    const session = cast?.framework?.CastContext?.getInstance()?.getCurrentSession()
    if (!session) {
      connect()
      return
    }
    const next = !muted
    setMuted(next)
    try {
      session.setMute(next).catch(() => {})
    } catch {
      /* algunos receptores no exponen setMute */
    }
  }

  const connected = status === 'connected'

  return (
    <main className="mono">
      <h1 className="mono__title">El salvador de los oídos</h1>

      {status === 'unavailable' ? (
        <p className="mono__notice">
          Cast no disponible en este navegador. Abrí esta página en <strong>Chrome de Android</strong>,
          en la misma WiFi que tu Android TV / Chromecast.
        </p>
      ) : connected ? (
        <button
          type="button"
          className={`mono__cta ${muted ? 'is-muted' : 'is-audible'}`}
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Restaurar volumen de la TV' : 'Silenciar la TV'}
        >
          {muted ? <SpeakerOff /> : <SpeakerOn />}
        </button>
      ) : (
        <button
          type="button"
          className="mono__connect"
          onClick={connect}
          disabled={status === 'loading' || status === 'connecting'}
        >
          {status === 'connecting'
            ? 'Buscando TV…'
            : status === 'loading'
              ? 'Cargando Cast…'
              : 'Vincular TV (Cast)'}
        </button>
      )}

      <footer className="mono__foot">
        <span className={`mono__dot ${connected ? 'is-on' : ''}`} aria-hidden="true" />
        <span>
          {connected ? `TV: ${device}` : status === 'unavailable' ? 'sin Cast' : 'sin vincular'}
        </span>
      </footer>
    </main>
  )
}
