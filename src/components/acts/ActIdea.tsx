import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SERVICES } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

export function ActIdea() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('[data-reveal]', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 70%',
        },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="idea"
      className="relative overflow-hidden bg-void px-6 py-24 md:py-32"
      aria-label="Acto II — La idea y el plan"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(63,63,70,0.35),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-6xl gap-16 lg:grid-cols-2 lg:gap-20">
        <div>
          <p data-reveal className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">
            Acto II
          </p>
          <h2
            data-reveal
            className="font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl text-balance"
          >
            De la idea al plan
          </h2>
          <p data-reveal className="mt-5 max-w-md text-base leading-relaxed text-mist sm:text-lg">
            No empezamos con un ticket de compra. Empezamos con un blueprint: qué quieres
            crear, qué hay que reparar, y cómo lo materializamos en el taller.
          </p>

          <div
            data-reveal
            className="mt-10 rounded-2xl border border-spark/20 bg-fog/60 p-6 backdrop-blur-sm"
          >
            <p className="text-xs tracking-[0.25em] text-spark/80 uppercase">Blueprint holográfico</p>
            <p className="mt-3 font-display text-2xl font-semibold text-paper">Plan de trabajo</p>
            <ul className="mt-4 space-y-2 text-sm text-mist">
              <li>— Uso objetivo (crear / jugar / editar / estudiar)</li>
              <li>— Piezas y compatibilidad</li>
              <li>— Timeline de armado o reparación</li>
              <li>— Firma cliente ↔ técnico (placeholder)</li>
            </ul>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {SERVICES.map((service) => (
            <article
              key={service.title}
              data-reveal
              className="rounded-2xl border border-white/5 bg-steel/40 p-5"
            >
              <h3 className="font-display text-lg font-semibold text-paper">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{service.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
