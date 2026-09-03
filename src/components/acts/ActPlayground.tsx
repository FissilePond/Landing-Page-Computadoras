import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SLOTS = [
  { id: 'gpu', label: 'GPU', watts: 220 },
  { id: 'ram', label: 'RAM', watts: 10 },
  { id: 'cooler', label: 'Cooler', watts: 15 },
  { id: 'psu', label: 'PSU', watts: 0 },
] as const

export function ActPlayground() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('[data-slot]', {
        opacity: 0,
        y: 24,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="playground"
      className="relative overflow-hidden bg-void px-6 py-24 md:py-32"
      aria-label="Acto IV — Playground de armado"
    >
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">Acto IV</p>
        <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl text-balance">
          El ritual de armado
        </h2>
        <p className="mt-4 max-w-xl text-mist">
          Aquí el usuario arrastrará piezas al gabinete con feedback de compatibilidad y
          watts. Por ahora: maqueta estática lista para integrar el módulo interactivo.
        </p>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-2 gap-3">
            {SLOTS.map((slot) => (
              <div
                key={slot.id}
                data-slot
                className="rounded-2xl border border-white/10 bg-steel/50 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <p className="text-xs tracking-[0.2em] text-mist uppercase">{slot.label}</p>
                <p className="mt-6 font-display text-2xl text-paper">Arrastra</p>
                <p className="mt-1 text-xs text-spark/80">{slot.watts}W · placeholder</p>
              </div>
            ))}
          </div>

          <div
            data-slot
            className="relative min-h-[280px] rounded-3xl border border-white/10 bg-gradient-to-b from-fog to-void p-6"
          >
            <p className="text-xs tracking-[0.25em] text-spark uppercase">Gabinete</p>
            <div className="mt-6 grid h-[70%] place-items-center rounded-2xl border border-dashed border-white/15 bg-void/50">
              <div className="text-center">
                <p className="font-display text-xl text-paper">Zona de acoplamiento</p>
                <p className="mt-2 text-sm text-mist">Drag & drop · GSAP Flip · Web Audio</p>
                <p className="mt-1 text-xs text-mist/70">Módulo externo pendiente</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-mist">Consumo estimado</span>
              <span className="font-display text-spark">000 W</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
