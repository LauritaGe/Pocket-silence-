import { useSync } from './useSync'
import { TvScreen } from './TvScreen'
import { CastRemote } from './CastRemote'
import { SpeakerOff, SpeakerOn } from './icons'
import './App.css'

function readParams() {
  const p = new URLSearchParams(window.location.search)
  return { room: p.get('room') || 'demo', view: p.get('view') || 'remote' }
}

export default function App() {
  const { room, view } = readParams()

  if (view === 'cast') return <CastRemote />
  if (view === 'tv') return <TvScreen room={room} />
  if (view === 'sim') return <Remote room={room} />
  return <Home />
}

function Home() {
  return (
    <main className="mono">
      <h1 className="mono__title">El salvador de los oídos</h1>

      <div className="mono__controls">
        <a className="mono__connect" href="/?view=cast">
          Vincular mi TV (Cast)
        </a>
        <a className="mono__change" href="/?view=sim">
          Ver demo simulada
        </a>
      </div>

      <footer className="mono__foot mono__foot--stack">
        <span className="mono__compat">
          Cast: control real de tu Android TV / Chromecast (Chrome de Android, misma WiFi). Demo:
          simulación local en el navegador, sin equipos reales.
        </span>
      </footer>
    </main>
  )
}

function Remote({ room }) {
  const { muted, connected, setMuted } = useSync(room)
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
