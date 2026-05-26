import { component$ } from '@builder.io/qwik'
import './app.css'

export const App = component$(() => {
  return (
    <>
      <section id="center">
        <div class="hero">
          <img src="/icon.svg" class="base" width="170" height="179" alt="giesbert logo" />
        </div>
        <div>
          <h1>Sprechender Blumentopf [giesbert]</h1>
          <p class="description" >Stell dir vor, eine Topfpflanze könnte uns Bescheid geben, wenn sie Durst hat!
            Bei uns kannst du lernen, wie das mit ein wenig Elektronik und etwas Grips geht.
            Wir erklären nämlich, wie sich der Feuchtegrad in der Blumenerde messen und in
            eine Zahl umwandeln lässt. Und du erlebst, wie diese Zahl ihren Weg über das
            WLAN auf den PC oder das Smartphone findet.</p>
        </div>
      </section>

      <section id="next-steps">
        <div id="docs">
          <h2>Dashboards</h2>
          <p>Es gibt zwei wesentliche Apps:</p>
          <ul>
            <li>
              <a href="https://ntfy.giesbert.das-habitat.de/" target="_blank">
                Ntfy Dashboard
              </a>
            </li>
            <li>
              <a href="https://grafana.giesbert.das-habitat.de/" target="_blank">
                Grafana Dashboard
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <h2>Kontakt</h2>
          <span>
            Das ist ein Projekt von{' '}
            <a href="https://das-habitat.de/" target="_blank">
              Das Habitat Augsburg e.V.
            </a>
          </span>
        </div>
      </section>

      <section id="spacer"></section>
    </>
  )
})
