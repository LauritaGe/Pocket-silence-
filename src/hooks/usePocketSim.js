import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BT_CHANNELS,
  MOCK_DEVICES,
  congestionForChannel,
  liveRssi,
} from '../data/devices'
import { createStreetField } from '../audio/streetField'

export function usePocketSim() {
  const fieldRef = useRef(null)
  const logSeq = useRef(0)
  const [powered, setPowered] = useState(false)
  const [mode, setMode] = useState('idle') // idle | diag | silence
  const [tick, setTick] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [visibleIds, setVisibleIds] = useState([])
  const [silencedIds, setSilencedIds] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [soundOn, setSoundOn] = useState(true)
  const [jamming, setJamming] = useState(false)
  const [log, setLog] = useState([])

  useEffect(() => {
    fieldRef.current = createStreetField()
  }, [])

  useEffect(() => {
    if (!powered) return undefined
    const id = window.setInterval(() => setTick((t) => t + 1), 400)
    return () => window.clearInterval(id)
  }, [powered])

  useEffect(() => {
    fieldRef.current?.setMuted(!soundOn)
  }, [soundOn])

  useEffect(() => {
    for (const id of MOCK_DEVICES.map((d) => d.id)) {
      fieldRef.current?.silence(id, silencedIds.includes(id))
    }
  }, [silencedIds])

  const pushLog = (line) => {
    logSeq.current += 1
    const entry = { id: logSeq.current, text: `${new Date().toLocaleTimeString('es-AR')}  ${line}` }
    setLog((prev) => [entry, ...prev].slice(0, 8))
  }

  const channels = useMemo(
    () =>
      BT_CHANNELS.map((ch) => ({
        ...ch,
        load: powered ? congestionForChannel(ch.id, tick) : 0,
      })),
    [powered, tick],
  )

  const devices = useMemo(() => {
    return MOCK_DEVICES.filter((d) => visibleIds.includes(d.id)).map((d, index) => ({
      ...d,
      rssi: liveRssi(d.baseRssi, tick, index + 1),
      silenced: silencedIds.includes(d.id),
    }))
  }, [visibleIds, tick, silencedIds])

  async function powerOn() {
    if (powered) return
    setPowered(true)
    setMode('idle')
    pushLog('PWR OK — USB 5V detectado')
    pushLog('Antena direccional lista')
  }

  function powerOff() {
    setPowered(false)
    setMode('idle')
    setScanning(false)
    setVisibleIds([])
    setSilencedIds([])
    setSelectedId(null)
    setJamming(false)
    pushLog('Apagado')
  }

  async function enterDiag() {
    if (!powered) return
    setMode('diag')
    setScanning(true)
    pushLog('Modo diagnóstico — escaneo Classic/LE')
    setVisibleIds([])

    const order = [...MOCK_DEVICES]
    for (let i = 0; i < order.length; i += 1) {
      await wait(320 + i * 180)
      setVisibleIds((ids) => [...ids, order[i].id])
      pushLog(`Found ${order[i].name}  RSSI ${order[i].baseRssi}`)
    }
    setScanning(false)
    pushLog('Escaneo completo — canales 2.4 GHz mapeados')
  }

  async function enterSilence() {
    if (!powered) return
    setMode('silence')
    if (!visibleIds.length) {
      setVisibleIds(MOCK_DEVICES.filter((d) => d.classic && d.type === 'speaker').map((d) => d.id))
    }
    try {
      await fieldRef.current?.start(MOCK_DEVICES)
      pushLog('Campo sonoro de estudio activo (simulado)')
    } catch {
      pushLog('Audio bloqueado por el navegador — tocá de nuevo')
    }
    pushLog('Modo S — solo parlantes Classic propios / simulación')
  }

  function toggleSilence(deviceId) {
    const device = MOCK_DEVICES.find((d) => d.id === deviceId)
    if (!device?.classic || device.type !== 'speaker') {
      pushLog('Modo S limitado a Bluetooth Classic speakers')
      return
    }
    setSilencedIds((ids) => {
      const on = !ids.includes(deviceId)
      const next = on ? [...ids, deviceId] : ids.filter((id) => id !== deviceId)
      pushLog(on ? `S ON → ${device.name}` : `S OFF → ${device.name}`)
      return next
    })
    setSelectedId(deviceId)
    setJamming(false)
  }

  // Jammer digital de estudio: silencia de golpe TODOS los parlantes Classic
  // del escenario simulado. Es puramente Web Audio local: no transmite RF, no
  // desconecta ni interfiere con ningun dispositivo Bluetooth real del entorno.
  async function toggleJammer() {
    if (!powered) return
    const targets = MOCK_DEVICES.filter((d) => d.classic && d.type === 'speaker').map((d) => d.id)
    if (mode !== 'silence') await enterSilence()
    setJamming((on) => {
      const next = !on
      setSilencedIds(next ? targets : [])
      pushLog(
        next
          ? 'JAMMER SIM ON — parlantes Classic silenciados (solo simulacion, no afecta radios reales)'
          : 'JAMMER SIM OFF — campo sonoro restaurado',
      )
      return next
    })
  }

  return {
    powered,
    mode,
    scanning,
    channels,
    devices,
    selectedId,
    setSelectedId,
    silencedIds,
    soundOn,
    setSoundOn,
    jamming,
    log,
    powerOn,
    powerOff,
    enterDiag,
    enterSilence,
    toggleSilence,
    toggleJammer,
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
