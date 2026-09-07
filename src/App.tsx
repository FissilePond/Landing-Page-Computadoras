import { PLACEHOLDERS } from './data/content'
import { ActSpark } from './components/acts/ActSpark'
import { ActPlayground, type ConfigurationSummary } from './components/acts/ActPlayground'
import { ActConfig } from './components/acts/ActConfig'
import { useEffect, useState } from 'react'
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

  return (
    <div className="min-h-screen bg-void text-paper">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 mix-blend-difference md:px-8">
        <a href="#deseo" className="font-display text-sm font-bold tracking-[0.2em] uppercase">
          {PLACEHOLDERS.brand}
        </a>
        <nav className="hidden gap-6 text-xs tracking-[0.18em] uppercase sm:flex">
          <a href="#idea" className="opacity-70 transition hover:opacity-100">
            Idea
          </a>
          <a href="#configurador" className="opacity-70 transition hover:opacity-100">
            Armado
          </a>
          <a href="#contacto" className="opacity-70 transition hover:opacity-100">
            Contacto
          </a>
        </nav>
      </header>

      <main>
        <ActSpark />
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
