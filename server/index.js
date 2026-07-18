/**
 * Servidor de la demo simulada de Pocket Silence.
 *
 * Sirve el build estatico y hace de relay WebSocket para sincronizar el estado
 * de "mute" entre el control (celu) y la pantalla TV simulada. Todo el efecto es
 * dentro de la app (audio/visual del navegador): no controla ningun equipo real.
 */
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { WebSocketServer } from 'ws'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const PORT = Number(process.env.PORT) || 8080

const app = express()
app.use(express.static(distDir))
app.get(/.*/, (_req, res) => res.sendFile(path.join(distDir, 'index.html')))

const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/sync' })

// Estado por sala: { muted: boolean }
const rooms = new Map()

function getRoom(name) {
  if (!rooms.has(name)) rooms.set(name, { muted: false })
  return rooms.get(name)
}

function broadcast(roomName, payload) {
  const data = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === 1 && client.roomName === roomName) {
      client.send(data)
    }
  }
}

wss.on('connection', (socket, req) => {
  const url = new URL(req.url, 'http://localhost')
  const roomName = url.searchParams.get('room') || 'demo'
  socket.roomName = roomName

  const room = getRoom(roomName)
  socket.send(JSON.stringify({ type: 'state', muted: room.muted }))

  socket.on('message', (raw) => {
    let msg
    try {
      msg = JSON.parse(raw.toString())
    } catch {
      return
    }
    if (msg.type === 'set' && typeof msg.muted === 'boolean') {
      room.muted = msg.muted
      broadcast(roomName, { type: 'state', muted: room.muted })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Pocket Silence sim server en http://localhost:${PORT}`)
})
