import { PLACEHOLDERS } from './data/content'
import { ActSpark } from './components/acts/ActSpark'
import { ActIdea } from './components/acts/ActIdea'
import { ActUnbox } from './components/acts/ActUnbox'
import { ActPlayground } from './components/acts/ActPlayground'
import { ActConfig } from './components/acts/ActConfig'
import { ActCta } from './components/acts/ActCta'

export default function App() {
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
        <ActSpark />
        <ActIdea />
        <ActUnbox />
        <ActPlayground />
        <ActConfig />
        <ActCta />
      </main>
    </div>
  )
}
