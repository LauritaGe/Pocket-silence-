import { useEffect, useRef, useState } from 'react'
import { createStreetField } from './audio/streetField'
import { MOCK_DEVICES } from './data/devices'

const BARS = Array.from({ length: 28 }, (_, i) => i)

export function TvScreen({ sync, room }) {
  const fieldRef = useRef(null)
  const [on, setOn] = useState(false)
  const { muted } = sync

  useEffect(() => {
    fieldRef.current = createStreetField()
  }, [])

  useEffect(() => {
    if (!on) return
    fieldRef.current?.setMuted(muted)
  }, [muted, on])

  async function powerOn() {
    try {
      await fieldRef.current?.start(MOCK_DEVICES)
      fieldRef.current?.setMuted(muted)
    } catch {
      /* audio bloqueado: seguimos con la parte visual */
    }
    setOn(true)
  }

  if (!on) {
    return (
      <main className="tv tv--off">
        <button type="button" className="tv__power" onClick={powerOn}>
          Encender TV simulada
        </button>
        <p className="tv__hint">
          Sala <strong>{room}</strong> · abrí el control en el celu y tocá el botón para mutear
        </p>
      </main>
    )
  }

  return (
    <main className={`tv ${muted ? 'is-muted' : 'is-playing'}`}>
      <div className="tv__frame">
        <div className="tv__meta">
          <span>CANAL 03 · EN VIVO</span>
          <span>Sala {room}</span>
        </div>

        <div className="tv__stage">
          <div className="tv__eq" aria-hidden="true">
            {BARS.map((i) => (
              <span key={i} className="tv__bar" style={{ animationDelay: `${(i % 7) * 0.12}s` }} />
            ))}
          </div>
          <p className="tv__now">Reproduciendo · Fiesta del vecino (loop)</p>
        </div>

        <div className={`tv__badge ${muted ? 'is-muted' : ''}`}>{muted ? 'MUTE' : 'AUDIO ON'}</div>

        {muted && (
          <div className="tv__overlay" role="status">
            <span className="tv__overlay-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="64" height="64" fill="none">
                <path
                  d="M4 9v6h4l5 4V5L8 9H4z"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <path
                  d="M16.5 9.5l5 5M21.5 9.5l-5 5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>Silenciado desde el control</span>
          </div>
        )}
      </div>

      <p className="tv__foot">Simulación local — no controla ningún televisor real.</p>
    </main>
  )
}
