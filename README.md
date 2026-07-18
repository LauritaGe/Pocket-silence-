# Pocket Silence

**El salvador de los oídos** — caso de estudio digital y lúdico.

Demo web de dos pantallas: un **control** (pensado para el celular) y una **TV simulada**. Al tocar el botón del control, la TV simulada se **mutea en vivo**. Todo el efecto ocurre dentro de la app (audio y visuales del navegador).

## Qué es (y qué no es)

- Material educativo / de diseño, no un producto a la venta.
- Corre en el navegador: síntesis de audio + UI, sincronizadas por WebSocket.
- **No** transmite RF, **no** jamea, **no** controla ni silencia ningún televisor ni dispositivo real. La "TV" es una simulación en pantalla.

## Cómo correrlo

Desarrollo (solo una pantalla, sin sincronización):

```bash
npm install
npm run dev
```

Demo completa de dos pantallas (control + TV sincronizados):

```bash
npm install
npm run build
npm run serve   # sirve el build y el relay WebSocket en http://localhost:8080
```

Luego:

1. Abrí `http://localhost:8080/` en el **celular** → es el control.
2. Abrí `http://localhost:8080/?view=tv` en la **notebook/TV** → es la TV simulada; tocá "Encender TV simulada".
3. Tocá el botón redondo en el celular → la TV se mutea/restaura al instante.

Ambas pantallas comparten una "sala" (`?room=demo` por defecto; podés usar `?room=loquesea` en las dos URLs para separar sesiones).

## Modo Cast (control real de una Android TV / Chromecast)

Además de la demo simulada, hay un modo que usa la **API oficial de Google Cast** para mutear el volumen de una Android TV / Chromecast propia:

- Abrí `http://localhost:8080/?view=cast` (o el mismo path en el hosting) en **Chrome de Android**, en la misma WiFi que la TV.
- Tocá "Vincular TV (Cast)" y elegí tu dispositivo. Esto inicia una sesión de Cast (la TV cambia a la pantalla de Cast).
- El botón redondo mutea/restaura el volumen del dispositivo.

Límites: solo Chrome con soporte de Cast (Android/desktop, no iOS/Safari); vincular interrumpe lo que se está viendo; el efecto depende del modelo (en muchas Android TV el volumen de Cast es el del sistema). Es **control remoto legal de un equipo propio** (la misma vía que usa la app oficial), no interferencia.

## Alcance del caso de estudio

Este proyecto **no** interfiere señales ni jamea. Inhibir radios ajenas es ilegal e imposible desde un navegador. La vista simulada muestra el concepto; el modo Cast controla únicamente un equipo propio y autorizado mediante su API oficial.
