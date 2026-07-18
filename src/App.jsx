import { useEffect, useRef, useState } from 'react'
import { createStreetField } from './audio/streetField'
import { MOCK_DEVICES } from './data/devices'
import './App.css'

export default function App() {
  const fieldRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [audible, setAudible] = useState(false)

  useEffect(() => {
    fieldRef.current = createStreetField()
  }, [])

  async function handleToggle() {
    const field = fieldRef.current
    if (!field) return

    if (!ready) {
      try {
        await field.start(MOCK_DEVICES)
        field.setMuted(false)
        setReady(true)
        setAudible(true)
      } catch {
        setReady(true)
        setAudible(false)
      }
      return
    }

    setAudible((on) => {
      const next = !on
      field.setMuted(!next)
      return next
    })
  }

  return (
    <main className="mono">
      <h1 className="mono__title">El salvador de los oídos</h1>

      <button
        type="button"
        className={`mono__cta ${audible ? 'is-audible' : 'is-muted'}`}
        onClick={handleToggle}
        aria-pressed={!audible}
        aria-label={audible ? 'Silenciar' : 'Reproducir'}
      >
        {audible ? <SpeakerOn /> : <SpeakerOff />}
      </button>
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
