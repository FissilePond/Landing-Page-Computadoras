import { PLACEHOLDERS } from './data/content'
import { ActSpark } from './components/acts/ActSpark'
import { ActPlayground, type ConfigurationSummary } from './components/acts/ActPlayground'
import { ActConfig } from './components/acts/ActConfig'
import { useEffect, useMemo, useState } from 'react'
import { ActCta } from './components/acts/ActCta'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  const [configuration, setConfiguration] = useState<ConfigurationSummary>({ total: 0 })
  const [skippedAssembly, setSkippedAssembly] = useState(false)
  const [pendingAct5Scroll, setPendingAct5Scroll] = useState(false)
  const configurationComplete = [
    'Motherboard',
    'Procesador',
    'RAM',
    'Almacenamiento',
    'PSU',
    'GPU',
    'Ventiladores',
  ].every((component) => Boolean(configuration[component as keyof ConfigurationSummary]))
  const canContinue = configurationComplete || skippedAssembly

  const scrollToAct5Start = () => {
    const el = document.getElementById('configuracion')
    if (!el) return
    // Inicio del Acto 5 (más arriba que un scrollIntoView suelto)
    const y = el.getBoundingClientRect().top + window.scrollY - 8
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    window.setTimeout(() => ScrollTrigger.refresh(), 480)
  }

  useEffect(() => {
    if (!pendingAct5Scroll || !canContinue) return
    setPendingAct5Scroll(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(scrollToAct5Start)
    })
  }, [pendingAct5Scroll, canContinue])

  // Instancia única del Acto IV: el rasgado (ActSpark) la muestra primero como
  // preview y al terminar el pin la muda al flujo, vía portal. useMemo para no
  // recrear el elemento en cada cambio de configuración.
  const playground = useMemo(
    () => (
      <ActPlayground
        onConfigurationChange={setConfiguration}
        onAssemblyComplete={() => {
          setPendingAct5Scroll(true)
        }}
        onSkip={() => {
          setSkippedAssembly(true)
          setPendingAct5Scroll(true)
        }}
      />
    ),
    [],
  )

  return (
    <div className="min-h-screen bg-void text-paper">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 mix-blend-difference md:px-8">
        <a href="#deseo" className="font-display text-sm font-bold tracking-[0.2em] uppercase">
          {PLACEHOLDERS.brand}
        </a>
        <nav className="flex items-center gap-6 text-xs tracking-[0.18em] uppercase">
          <a
            href={PLACEHOLDERS.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/50 px-5 py-2 transition hover:bg-white hover:text-black"
          >
            Contáctanos
          </a>
        </nav>
      </header>

      <main>
        <ActSpark playground={playground} />
        {!canContinue && (
          <div className="relative z-10 mx-auto mt-8 mb-8 max-w-6xl px-6 text-center text-sm text-paper/80">
            <p>Completa tu configuración para continuar — o usa Saltar.</p>
          </div>
        )}
        {canContinue && <ActConfig configuration={configuration} />}
        {canContinue && <ActCta />}
      </main>
    </div>
  )
}
