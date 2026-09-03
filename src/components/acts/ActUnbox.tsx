import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const PARTS = ['CPU', 'GPU', 'RAM', 'SSD', 'PSU', 'Cooler'] as const

export function ActUnbox() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('[data-box]', {
        y: 60,
        opacity: 0,
        rotate: -4,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 65%',
          end: 'top 20%',
          scrub: 1,
        },
      })

      gsap.to('[data-float]', {
        y: -18,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="arquitectura"
      className="relative overflow-hidden bg-void px-6 py-24 md:py-32"
      aria-label="Acto III — Cajas y arquitectura"
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(39,39,42,0.35),transparent)]" />
      <div className="relative mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">Acto III</p>
        <h2 className="font-display max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl text-balance">
          Cajas, despiece y arquitectura
        </h2>
        <p className="mt-4 max-w-xl text-mist">
          Las piezas salen de sus cajas y flotan hacia el gabinete. El zoom profundo al
          procesador lo integra otro módulo más adelante — aquí queda el shell visual.
        </p>

        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
          {PARTS.map((part, i) => (
            <div
              key={part}
              data-box
              data-float
              className="aspect-square rounded-xl border border-white/10 bg-gradient-to-br from-steel to-fog p-4"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              <div className="flex h-full flex-col justify-between">
                <span className="text-[10px] tracking-[0.2em] text-spark/70 uppercase">Caja</span>
                <span className="font-display text-xl font-semibold text-paper">{part}</span>
                <span className="text-[11px] text-mist">placeholder</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-spark/30 bg-fog/40 px-6 py-10 text-center">
          <p className="font-display text-lg font-semibold text-spark">Portal — Zoom al procesador</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist">
            Espacio reservado para la secuencia cinematográfica (deep architectural zoom).
            Se conectará cuando esté lista.
          </p>
        </div>
      </div>
    </section>
  )
}
