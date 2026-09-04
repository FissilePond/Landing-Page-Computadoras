import { PLACEHOLDERS } from './data/content'
import { ActSpark } from './components/acts/ActSpark'
import { ActUnbox } from './components/acts/ActUnbox'
import { ActPlayground, type ConfigurationSummary } from './components/acts/ActPlayground'
import { ActConfig } from './components/acts/ActConfig'
import { useState } from 'react'
import { ActCta } from './components/acts/ActCta'

export default function App() {
  const [configuration, setConfiguration] = useState<ConfigurationSummary>({ total: 0 })
  const configurationComplete = ['Motherboard', 'Procesador', 'RAM', 'Almacenamiento', 'PSU', 'GPU', 'Ventiladores']
    .every((component) => Boolean(configuration[component as keyof ConfigurationSummary]))

  return (
    <div className="min-h-screen bg-void text-paper">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 mix-blend-difference md:px-8">
        <a href="#deseo" className="font-display text-sm font-bold tracking-[0.2em] uppercase">
          {PLACEHOLDERS.brand}
        </a>
        <nav className="hidden gap-6 text-xs tracking-[0.18em] uppercase sm:flex">
          <a href="#idea" className="opacity-70 transition hover:opacity-100">
            Servicios
          </a>
          <a href="#playground" className="opacity-70 transition hover:opacity-100">
            Armado
          </a>
          <a href="#contacto" className="opacity-70 transition hover:opacity-100">
            Contacto
          </a>
        </nav>
      </header>

      <main>
        {/* ===== ACTO 1 — El deseo · ACTO 2 — La idea (una sola secuencia) ===== */}
        <ActSpark />
        {/* ===== ACTO 1 + ACTO 2 (terminan) ===== */}

        <ActUnbox />
        <ActPlayground onConfigurationChange={setConfiguration} />
        {!configurationComplete && (
          <div className="relative z-10 mx-auto mb-12 max-w-6xl px-6 text-center text-sm text-paper/80 mt-8">
            <p>Completa tu configuración para continuar.</p>
          </div>
        )}
        {configurationComplete && <ActConfig configuration={configuration} />}
        {configurationComplete && <ActCta />}
      </main>
    </div>
  )
}
