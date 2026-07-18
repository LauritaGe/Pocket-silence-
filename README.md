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

## Alcance del caso de estudio

Este proyecto **no** interfiere señales ni controla equipos externos. Inhibir o jamear radios ajenas es ilegal y, además, imposible desde un navegador. La demo simula el concepto para poder mostrarlo y discutir su ética.
