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
  const sync = useSync(room)

  if (view === 'cast') return <CastRemote />
  if (view === 'tv') return <TvScreen sync={sync} room={room} />
  return <Remote sync={sync} room={room} />
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
