import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PLACEHOLDERS } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

export function ActCta() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      gsap.from('[data-cta]', {
        opacity: 0,
        y: 28,
        stagger: 0.12,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contacto"
      className="relative overflow-hidden bg-void px-6 pt-16 pb-6 md:pt-20"
      aria-label="Acto VI — Encuentro y cierre"
    >
      {/* Fondo: imagen → negro 80% → degradado negro arriba→abajo */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-no-repeat"
        style={{
          backgroundImage: 'url(/taller.jpg)',
          // Baja el recorte: más = se ve más la parte baja de la foto
          backgroundPosition: 'center 62%',
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-black/80" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-black/70 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        <div
          data-cta
          className="relative -ml-3 w-[min(112%,520px)] justify-self-start sm:-ml-5 sm:w-[min(115%,580px)] lg:-ml-8 lg:w-[min(120%,640px)]"
        >
          <div className="relative max-h-[min(70vh,560px)]">
            <img
              src="/pc-hero.png"
              alt={`${PLACEHOLDERS.brand} — PC armada`}
              className="h-auto max-h-[min(70vh,560px)] w-full object-contain object-left drop-shadow-[0_0_40px_rgba(56,189,248,0.22)]"
              draggable={false}
            />
          </div>
        </div>

        <div>
          <p data-cta className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">
            Acto VI
          </p>
          <h2
            data-cta
            className="font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl"
          >
            Podrías ser tú.
          </h2>
          <div data-cta className="mt-2 w-fit max-w-full">
            <p className="font-display text-4xl font-bold tracking-tight text-spark sm:text-5xl md:text-6xl">
              ¿Empezamos?
            </p>
            <a
              href={PLACEHOLDERS.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex w-full items-center justify-center rounded-none border border-white/80 bg-transparent px-6 py-3.5 font-display text-sm font-bold tracking-wide text-white transition hover:border-white hover:bg-white/5"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </div>

      <footer className="relative mx-auto mt-6 flex max-w-6xl flex-col gap-4 border-t border-white/5 py-5 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
        <p>
          {PLACEHOLDERS.brand} · {PLACEHOLDERS.address}
        </p>
        <nav className="flex flex-wrap gap-4">
          {PLACEHOLDERS.socials.map((s) => (
            <a key={s.label} href={s.href} className="hover:text-spark">
              {s.label}
            </a>
          ))}
          <a href={`mailto:${PLACEHOLDERS.email}`} className="hover:text-spark">
            Email
          </a>
        </nav>
      </footer>
    </section>
  )
}
