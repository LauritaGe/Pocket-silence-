import { useSync } from './useSync'
import { TvScreen } from './TvScreen'
import './App.css'

function readParams() {
  const p = new URLSearchParams(window.location.search)
  return { room: p.get('room') || 'demo', isTv: p.get('view') === 'tv' }
}

export default function App() {
  const { room, isTv } = readParams()
  const sync = useSync(room)

  return isTv ? <TvScreen sync={sync} room={room} /> : <Remote sync={sync} room={room} />
}

function Remote({ sync, room }) {
  const { muted, connected, setMuted } = sync
  const tvUrl = `${window.location.origin}/?view=tv&room=${encodeURIComponent(room)}`

  return (
    <main className="mono">
      <h1 className="mono__title">El salvador de los oídos</h1>

      <button
        type="button"
        className={`mono__cta ${muted ? 'is-muted' : 'is-audible'}`}
        onClick={() => setMuted(!muted)}
        aria-pressed={muted}
        aria-label={muted ? 'Restaurar audio de la TV' : 'Silenciar la TV'}
      >
        {muted ? <SpeakerOff /> : <SpeakerOn />}
      </button>

      <footer className="mono__foot">
        <span className={`mono__dot ${connected ? 'is-on' : ''}`} aria-hidden="true" />
        <span>{connected ? 'control vinculado' : 'buscando pantalla…'}</span>
        <a className="mono__link" href={tvUrl} target="_blank" rel="noreferrer">
          Abrir pantalla TV
        </a>
      </footer>
    </main>
  )
}

function SpeakerOn() {
  return (
    <svg viewBox="0 0 24 24" width="46" height="46" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SpeakerOff() {
  return (
    <svg viewBox="0 0 24 24" width="46" height="46" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 9.5l5 5M21.5 9.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
