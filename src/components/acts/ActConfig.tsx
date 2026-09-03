import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function ActConfig() {
  const sectionRef = useRef<HTMLElement>(null)
  const [thermal, setThermal] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('[data-pane]', {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power2.out',
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
        <div data-pane className="flex flex-col justify-center">
          <p className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">Acto V</p>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl text-balance">
            El despertar
          </h2>
          <p className="mt-4 text-mist leading-relaxed">
            Antes de entregarte la máquina, pasamos por setup, drivers y pruebas de
            estabilidad. Nada se va “casi listo”.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-paper/90">
            <li className="border-l-2 border-spark/60 pl-4">Estándares de armado y cableado limpio</li>
            <li className="border-l-2 border-spark/60 pl-4">Pruebas de estrés y temperaturas</li>
            <li className="border-l-2 border-spark/60 pl-4">Garantía de un mes sobre el trabajo</li>
            <li className="border-l-2 border-spark/40 pl-4 text-mist">Detalle de cobertura (placeholder)</li>
          </ul>
        </div>

        <div
          data-pane
          className="overflow-hidden rounded-3xl border border-white/10 bg-fog shadow-[0_0_0_1px_rgba(250,204,21,0.06)]"
        >
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <span className="text-xs tracking-[0.2em] text-mist uppercase">Monitor · BIOS</span>
            <button
              type="button"
              onClick={() => setThermal((v) => !v)}
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-paper transition hover:border-spark/40 hover:text-spark"
            >
              Thermal View · {thermal ? 'ON' : 'OFF'}
            </button>
          </div>
          <div
            className={`relative aspect-[4/3] p-5 font-mono text-xs leading-relaxed sm:text-sm ${
              thermal
                ? 'bg-[radial-gradient(circle_at_30%_40%,rgba(239,68,68,0.35),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(250,204,21,0.25),transparent_40%),#09090b]'
                : 'bg-void'
            }`}
          >
            <p className="text-spark">PC STUDIO SETUP // PLACEHOLDER</p>
            <p className="mt-3 text-mist">POST OK · memoria verificada</p>
            <p className="text-mist">Drivers base · cargando…</p>
            <p className="text-mist">Stress test · en cola</p>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-steel">
              <div className="h-full w-2/3 rounded-full bg-spark" />
            </div>
            <p className="mt-2 text-[11px] text-mist">Progreso simulado — 67%</p>
          </div>
        </div>
      </div>
    </section>
  )
}
