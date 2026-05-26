import { component$ } from '@builder.io/qwik'
import { Card, Link, LinkButton, Header, Footer } from './components';
import ntfyAppleIcon from './assets/badge-apple.ntfy.png'
import ntfyGoogleIcon from './assets/badge-google.ntfy.png'
import ntfyFDroidIcon from './assets/badge-fdroid.ntfy.svg'
import ntfyLogo from './assets/logo-ntfy.svg'
import grafanaLogo from './assets/logo-grafana.svg'

const content = {
  desc: {
    title: "Stell dir vor, eine Topfpflanze könnte uns Bescheid geben, wenn sie Durst hat!",
    text: [
      <>Bei uns kannst du lernen, wie das mit ein wenig Elektronik und etwas Grips geht.
        Wir erklären nämlich, wie sich der Feuchtegrad in der Blumenerde messen und in
        eine Zahl umwandeln lässt. Und du erlebst, wie diese Zahl ihren Weg über das
        WLAN auf den PC oder das Smartphone findet.</>,
      <>Quellcode unter:{' '}</>
    ],
    link: {
      href: "https://github.com/das-habitat/giesbert",
      text: "github/das-habitat/giesbert",
    }
  },
  ntfy: {
    title: "ntfy",
    text: <>Eine App mit der du dir Benachrichtigungen auf dein Handy schicken kannst
      – zum Beispiel wenn deine Pflanze zu trocken ist. Dein Microcontroller schickt
      einfach eine HTTPS-Anfrage an den Server und schon bekommst du eine
      Push-Nachricht: „Pflanze gießen!" Die App kannst du dir hier herunterladen:
    </>,
    stores: [
      {
        href: "https://f-droid.org/en/packages/io.heckel.ntfy/",
        img: {
          src: ntfyFDroidIcon,
          alt: "fdroid store"
        }
      },
      {
        href: "https://play.google.com/store/apps/details?id=io.heckel.ntfy",
        img: {
          src: ntfyGoogleIcon,
          alt: "google play store"
        }
      },
      {
        href: "https://apps.apple.com/us/app/ntfy/id1625396347",
        img: {
          src: ntfyAppleIcon,
          alt: "apple app store"
        }
      }
    ],
    nav: {
      link: "https://notifications.giesbert.das-habitat.de/",
      text: "Zum ntfy Dashboard"
    }
  },
  grafana: {
    title: "Grafana",
    text: <>Die App veranschaulicht deine gesammelten Messwerte wie
      Bodenfeuchtigkeit und Temperatur deiner Pflanze. Dein Microcontroller speichert
      regelmäßg Messwerte über HTTPS-Anfragen an den Server. Grafana erstellt aus diesen
      Daten ein übersichtliches Dashboard mit hübschen Diagrammen.</>,
    nav: {
      link: "https://monitoring.giesbert.das-habitat.de/",
      text: "Zum Grafana Dashboard"
    }
  },
}

export const App = component$(() => {
  return (
    <>
      <Header />

      <Card class="bg-olive-300 mb-6">
        <h2 class="text-2xl font-bold mb-3">
          {content.desc.title}
        </h2>
        <p class="text-lg text-black font-medium mb-3" >{content.desc.text[0]}</p>
        <span class="text-lg">{content.desc.text[1]}
          <Link href={content.desc.link.href}>{content.desc.link.text}</Link>
        </span>
      </Card>

      <Card class="bg-livid-400 border-3 border-black mb-6">
        <div class="flex items-center gap-2.5 mb-3">
          <img
            src={ntfyLogo}
            alt="ntfy logo"
            width={36}
            height={36}
            class="shrink-0 rounded-lg"
          />
          <h2 class="text-2xl font-bold">{content.ntfy.title}</h2>
        </div>
        <p class="text-lg mb-3">{content.ntfy.text}</p>
        <div class="flex gap-2.5 mb-3">
          {content.ntfy.stores.map((item, idx) => (
            <a key={`ntfy-store${idx}`} target="_blank" href={item.href}>
              <img
                src={item.img.src}
                alt={item.img.alt}
                width={120}
                height={120}
                class="shrink-0"
              />
            </a>
          ))}
        </div>
        <LinkButton class="bg-black text-white" href={content.ntfy.nav.href}>
          {content.ntfy.nav.text}
        </LinkButton>
      </Card>

      <Card class="bg-livid-400 border-3 border-black mb-6">
        <div class="flex items-center gap-2.5 mb-3">
          <img
            src={grafanaLogo}
            alt="ntfy logo"
            width={36}
            height={36}
            class="shrink-0 rounded-lg"
          />
          <h2 class="text-2xl font-bold">
            {content.grafana.title}
          </h2>
        </div>
        <p class="text-lg mb-3">{content.grafana.text}</p>
        <LinkButton class="bg-black text-white" href={content.grafana.nav.href}>
          {content.grafana.nav.text}
        </LinkButton>
      </Card>

      <Footer />
    </>
  )
})
