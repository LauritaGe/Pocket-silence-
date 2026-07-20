import { useEffect, useState } from 'react'
import { SpeakerOff, SpeakerOn } from './icons'

// App id del Default Media Receiver de Google Cast (no requiere registro).
const DEFAULT_RECEIVER = 'CC1AD845'
const SDK_SRC = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1'

/**
 * Control real vía Google Cast: desde Chrome (Android/desktop), en la misma WiFi
 * que la TV, vincula una sesion de Cast y controla volumen/mute del dispositivo.
 *
 * Cast descubre los dispositivos por si mismo (mDNS/DIAL): funciona con CUALQUIER
 * TV que tenga Chromecast integrado / Google TV, sin importar la marca. No hay
 * base de codigos por marca (eso es del mundo IR). Usa la API oficial: no es
 * jamming ni interferencia.
 */
function detectEnv() {
  const ua = navigator.userAgent || ''
  const standalone =
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator.standalone === true
  const isAndroid = /Android/i.test(ua)
  // iPadOS reciente se hace pasar por Mac, pero tiene touch.
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1)
  const isChrome = /Chrome\//i.test(ua) && !/Edg\/|OPR\/|SamsungBrowser/i.test(ua)
  // Navegadores embebidos (Instagram, Facebook, etc.) no traen Cast.
  const inApp = /(FBAN|FBAV|Instagram|Line|WhatsApp|WebView|; wv\))/i.test(ua)
  return { standalone, isAndroid, isIOS, isChrome, inApp }
}

export function CastRemote() {
  const [status, setStatus] = useState('loading') // loading | unavailable | ready | connecting | connected
  const [device, setDevice] = useState('')
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [reason, setReason] = useState('')
  const env = detectEnv()

  useEffect(() => {
    // iOS no expone el SDK de Google Cast a la web (WebKit). No tiene solución
    // por navegador: se controla la TV con las apps nativas Google Home / Google TV.
    if (env.isIOS) {
      setReason('iOS')
      setStatus('unavailable')
      return
    }

    window.__onGCastApiAvailable = (isAvailable) => {
      if (isAvailable) initCast()
      else fail('El navegador reportó Cast como no disponible (__onGCastApiAvailable=false).')
    }

    if (window.cast?.framework) {
      initCast()
    } else if (!document.getElementById('cast-sdk')) {
      const s = document.createElement('script')
      s.id = 'cast-sdk'
      s.src = SDK_SRC
      s.onerror = () => fail('No se pudo cargar el SDK de Cast (gstatic.com bloqueado o sin red).')
      document.head.appendChild(s)
    }

    const timeout = window.setTimeout(() => {
      setStatus((prev) => {
        if (prev !== 'loading') return prev
        setReason(
          env.standalone
            ? 'Estás en la app instalada (modo standalone): Chrome no inyecta Cast acá.'
            : env.inApp
              ? 'Estás en un navegador embebido de otra app: no trae Cast.'
              : !env.isChrome
                ? 'Este navegador no soporta Cast. Usá Chrome.'
                : 'El SDK de Cast no respondió (5s). Probá recargar en Chrome.',
        )
        return 'unavailable'
      })
    }, 5000)
    return () => window.clearTimeout(timeout)
  }, [])

  function fail(msg) {
    setReason(msg)
    setStatus('unavailable')
  }

  function syncFromSession(session) {
    if (!session) return
    setDevice(session.getCastDevice?.()?.friendlyName || 'TV')
    try {
      setMuted(Boolean(session.isMute?.()))
      const v = session.getVolume?.()
      if (typeof v === 'number' && v >= 0) setVolume(v)
    } catch {
      /* algunos receptores no exponen volumen */
    }
  }

  function initCast() {
    const { cast, chrome } = window
    if (!cast?.framework || !chrome?.cast) {
      fail('El framework de Cast se cargó pero chrome.cast no está disponible.')
      return
    }
    const context = cast.framework.CastContext.getInstance()
    context.setOptions({
      receiverApplicationId: chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID || DEFAULT_RECEIVER,
      autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
    })

    context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event) => {
      const S = cast.framework.SessionState
      const session = context.getCurrentSession()
      if (event.sessionState === S.SESSION_STARTED || event.sessionState === S.SESSION_RESUMED) {
        syncFromSession(session)
        setStatus('connected')
      } else if (event.sessionState === S.SESSION_ENDED) {
        setDevice('')
        setStatus('ready')
      }
    })

    setStatus('ready')
  }

  function currentSession() {
    return window.cast?.framework?.CastContext?.getInstance()?.getCurrentSession() || null
  }

  function connect() {
    const { cast } = window
    if (!cast?.framework) return
    setStatus('connecting')
    cast.framework.CastContext.getInstance()
      .requestSession()
      .catch(() => setStatus((p) => (p === 'connecting' ? 'ready' : p)))
  }

  function toggleMute() {
    const session = currentSession()
    if (!session) {
      connect()
      return
    }
    const next = !muted
    setMuted(next)
    try {
      session.setMute(next)?.catch?.(() => {})
    } catch {
      /* receptor sin soporte de mute */
    }
  }

  function changeVolume(value) {
    setVolume(value)
    const session = currentSession()
    try {
      session?.setVolume(value)?.catch?.(() => {})
    } catch {
      /* receptor sin soporte de volumen */
    }
  }

  const connected = status === 'connected'

  return (
    <main className="mono">
      <h1 className="mono__title">Enjoy the silence TV</h1>

      {status === 'unavailable' ? (
        <div className="mono__controls">
          {reason === 'iOS' ? (
            <>
              <p className="mono__notice">
                En <strong>iPhone / iPad</strong> el navegador no permite Cast (limitación de Apple, no
                de la app). Para mutear tu Android TV / Chromecast desde iOS usá una app nativa gratis,
                en la misma WiFi que la TV:
              </p>
              <p className="mono__notice">
                • <strong>Google Home</strong> → tocá tu TV → volumen / silenciar.
                <br />• <strong>Google TV</strong> → control remoto virtual con botón de mute.
              </p>
              <a
                className="mono__connect"
                href="https://apps.apple.com/app/google-home/id680819774"
                target="_blank"
                rel="noreferrer"
              >
                Abrir Google Home en App Store
              </a>
            </>
          ) : (
            <>
              <p className="mono__notice">
                Cast no disponible acá. Abrí <strong>https://pocketsilence.netlify.app/?view=cast</strong>{' '}
                en la <strong>app de Chrome</strong> de Android (no en la app instalada ni dentro de otra
                app), misma WiFi que tu TV con Chromecast / Google TV.
              </p>
              {reason && <p className="mono__reason">Motivo: {reason}</p>}
              <button type="button" className="mono__change" onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </>
          )}
        </div>
      ) : connected ? (
        <div className="mono__controls">
          <button
            type="button"
            className={`mono__cta ${muted ? 'is-muted' : 'is-audible'}`}
            onClick={toggleMute}
            aria-pressed={muted}
            aria-label={muted ? 'Restaurar volumen de la TV' : 'Silenciar la TV'}
          >
            {muted ? <SpeakerOff /> : <SpeakerOn />}
          </button>

          <input
            className="mono__vol"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            aria-label="Volumen de la TV"
          />

          <button type="button" className="mono__change" onClick={connect}>
            Cambiar TV
          </button>
        </div>
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
              : 'Vincular TV'}
        </button>
      )}

      <footer className="mono__foot mono__foot--stack">
        <span className="mono__status">
          <span className={`mono__dot ${connected ? 'is-on' : ''}`} aria-hidden="true" />
          {connected ? `TV: ${device}` : status === 'unavailable' ? 'sin Cast' : 'sin vincular'}
        </span>
        <span className="mono__compat">
          Compatible con cualquier TV con Chromecast integrado / Google TV (BGH, ONN, Hitachi, TCL,
          Sony, Philips, Xiaomi…). Roku, Samsung Tizen y LG webOS no usan Cast.
        </span>
      </footer>
    </main>
  )
}
