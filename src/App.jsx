import { DevicePanel } from './components/DevicePanel'
import { usePocketSim } from './hooks/usePocketSim'
import './App.css'

export default function App() {
  const sim = usePocketSim()

  return (
    <div className="page">
      <div className="atmosphere" aria-hidden="true" />

      <header className="nav">
        <a className="nav__brand" href="#top">
          Pocket Silence
        </a>
        <a className="nav__cta" href="#dispositivo">
          Abrir dispositivo
        </a>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero__copy">
            <p className="hero__brand">Pocket Silence</p>
            <h1>El salvador de los oídos</h1>
            <p className="hero__lede">
              Caso de estudio digital y lúdico: diagnóstico Bluetooth y un modo S simulado,
              inspirado en herramientas DIY como Pocket Gone.
            </p>
            <div className="hero__actions">
              <a className="btn btn--primary" href="#dispositivo">
                Probar la simulación
              </a>
              <a className="btn btn--ghost" href="#estudio">
                Ver el marco del estudio
              </a>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <div className="hero-field" />
            <div className="hero-wave" />
            <div className="hero-wave hero-wave--delay" />
            <div className="hero-wave hero-wave--slow" />
          </div>
        </section>

        <DevicePanel sim={sim} />

        <section className="study" id="estudio">
          <h2>Qué replica este caso de estudio</h2>
          <p>
            Pocket Gone es una herramienta analógica/DIY de diagnóstico para parlantes Bluetooth
            con un modo de silenciamiento pensado para parlantes propios. Pocket Silence traduce
            esa lógica a una experiencia web jugable: sin hardware, sin RF real y sin uso comercial.
          </p>

          <div className="study__grid">
            <article>
              <h3>Modo diagnóstico</h3>
              <p>
                Muestra congestión de canales 2.4&nbsp;GHz y dispositivos en pair con nombre, MAC y
                RSSI — igual que el monitor serial del dispositivo físico, pero en pantalla.
              </p>
            </article>
            <article>
              <h3>Modo S y Jammer (simulados)</h3>
              <p>
                En lugar de actuar sobre el aire, genera un campo sonoro local: “silenciás” un
                parlante Classic o activás el <strong>Jammer sim</strong> para callarlos a todos.
                Ventana educativa, no interferencia.
              </p>
            </article>
            <article>
              <h3>Límites claros</h3>
              <p>
                No abre autos, no toca GPS/GSM, no inhibe Wi‑Fi. Solo Bluetooth Classic de parlantes
                en el relato del estudio, como en las FAQ del referente.
              </p>
            </article>
          </div>
        </section>

        <section className="ethics" id="etica">
          <h2>Ética del “jammer” (y por qué acá es solo simulación)</h2>
          <p>
            El botón <strong>Jammer sim</strong> deja “sentir” la fantasía del interruptor mágico
            que apaga el ruido ajeno, pero corta únicamente el audio sintetizado en tu navegador.
            Un jammer real es otra cosa — y por buenas razones no lo construimos:
          </p>
          <ul className="ethics__list">
            <li>
              <strong>Es ilegal.</strong> Transmitir para inhibir o interferir radios ajenas está
              prohibido en casi todo el mundo (multas y decomiso del equipo).
            </li>
            <li>
              <strong>No distingue víctimas.</strong> Un jammer afecta a todos en su radio, no solo
              al parlante molesto: puede tumbar auriculares médicos, alarmas o comunicaciones de
              emergencia.
            </li>
            <li>
              <strong>Técnicamente imposible desde la web.</strong> Un navegador no transmite RF ni
              puede desconectar dispositivos de terceros; solo hablaría por GATT con un equipo
              <em> propio</em> que vos autorizás.
            </li>
            <li>
              <strong>Alternativas legítimas.</strong> Hablar con quien hace ruido, normas de
              convivencia, o controlar tus propios dispositivos emparejados.
            </li>
          </ul>
        </section>

        <section className="disclaimer">
          <h2>No es un producto</h2>
          <p>
            Pocket Silence no se comercializa. Es material lúdico para aprender y discutir diseño,
            ética y diagnóstico en entornos Bluetooth. Si ves algo similar a la venta como “jammer”,
            desconfiá — el referente original también advierte sobre estafas.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>Pocket Silence · caso de estudio · inspirado en pocketgone.com</p>
      </footer>
    </div>
  )
}
