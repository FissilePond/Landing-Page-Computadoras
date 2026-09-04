import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ConfigurationSummary, ComponentName } from './ActPlayground'

gsap.registerPlugin(ScrollTrigger)

const componentOrder: ComponentName[] = ['Motherboard', 'Procesador', 'RAM', 'Almacenamiento', 'PSU', 'GPU', 'Ventiladores']

export function ActConfig({ configuration }: { configuration: ConfigurationSummary }) {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('[data-pane]', {
        opacity: 0,
        x: (_, element) => element.dataset.direction === 'right' ? 120 : -120,
        stagger: 0.25,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="configuracion"
      className="relative overflow-hidden bg-void px-6 py-24 md:py-32"
      aria-label="Acto V — Configuración"
    >
      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(250,204,21,0.08),transparent_50%)]" />

        <div data-pane data-direction="left" className="flex flex-col justify-center">
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">Acto V</p>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl text-balance">El despertar</h2>
          <p className="mt-4 text-mist leading-relaxed">
            La máquina ya está armada. Ahora se despierta y se valida antes de entregarla: nada se va casi listo.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-paper/90">
            <li className="border-l-2 border-spark/60 pl-4">Estándares de armado y cableado limpio</li>
            <li className="border-l-2 border-spark/60 pl-4">Pruebas de estrés, temperaturas y estabilidad</li>
            <li className="border-l-2 border-spark/60 pl-4">Garantía real sobre el trabajo</li>
          </ul>
        </div>

        <div data-pane data-direction="right" className="relative overflow-hidden rounded-3xl border border-white/10 bg-fog shadow-[0_0_0_1px_rgba(250,204,21,0.06)]">
          <aside className="summary-card" aria-label="Ticket de configuración">
            <div className="summary-top">
              <h3>Tu configuración</h3>
              <span className="price-badge">MXN</span>
            </div>
            <div className="amount">${configuration.total.toLocaleString('es-MX')} <small>MXN</small></div>
            <ul className="selection-list">
              {componentOrder.map((name, index) => (
                <li key={name} className={configuration[name] ? 'active' : ''}>
                  <span className="step-number">{index + 1}</span>
                  <span className="selection-name">{configuration[name] || 'Pendiente'}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  )
}
