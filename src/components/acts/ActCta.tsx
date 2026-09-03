import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PLACEHOLDERS } from '../../data/content'

gsap.registerPlugin(ScrollTrigger)

export function ActCta() {
  const sectionRef = useRef<HTMLElement>(null)
  const btnRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const btn = btnRef.current
    if (!section || !btn) return

    const ctx = gsap.context(() => {
      gsap.from('[data-cta]', {
        opacity: 0,
        y: 28,
        stagger: 0.12,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 70%' },
      })

      const onMove = (e: PointerEvent) => {
        const rect = btn.getBoundingClientRect()
        const x = e.clientX - (rect.left + rect.width / 2)
        const y = e.clientY - (rect.top + rect.height / 2)
        const dist = Math.hypot(x, y)
        if (dist < 120) {
          gsap.to(btn, { x: x * 0.28, y: y * 0.28, duration: 0.35, ease: 'power2.out' })
        } else {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' })
        }
      }

      const onLeave = () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.55, ease: 'power3.out' })
      }

      section.addEventListener('pointermove', onMove)
      section.addEventListener('pointerleave', onLeave)

      return () => {
        section.removeEventListener('pointermove', onMove)
        section.removeEventListener('pointerleave', onLeave)
      }
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="contacto"
      className="relative overflow-hidden bg-void px-6 pt-24 pb-10 md:pt-32"
      aria-label="Acto VI — Encuentro y cierre"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(250,204,21,0.08),transparent_50%)]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_1.1fr] lg:gap-16">
        <div
          data-cta
          className="relative mx-auto aspect-square w-full max-w-[280px] sm:max-w-[320px]"
          aria-hidden
        >
          <div className="absolute inset-[8%] rounded-2xl border border-white/10 bg-gradient-to-br from-steel via-fog to-void shadow-[0_0_40px_rgba(250,204,21,0.12)]" />
          <div className="absolute inset-[18%] rounded-xl border border-spark/30 bg-void/80" />
          <div className="absolute inset-x-[28%] top-[22%] h-[3px] rounded-full bg-spark/80 shadow-[0_0_12px_rgba(250,204,21,0.8)]" />
          <div className="absolute inset-x-[32%] bottom-[20%] top-[30%] rounded-lg border border-spark/20 bg-[linear-gradient(180deg,rgba(250,204,21,0.12),transparent)]" />
          <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] text-mist uppercase">
            PC isométrica · placeholder
          </p>
        </div>

        <div>
          <p data-cta className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">
            Acto VI
          </p>
          <h2
            data-cta
            className="font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-balance"
          >
            Podrías ser tú,
            <span className="mt-2 block text-spark">¿Empezamos?</span>
          </h2>
          <p data-cta className="mt-5 max-w-md text-mist">
            Cuéntanos qué quieres crear — o qué hay que recuperar. Respondemos con un plan
            claro.
          </p>

          <div data-cta className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <a
              ref={btnRef}
              href={PLACEHOLDERS.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-full bg-spark px-8 py-3.5 font-display text-sm font-bold tracking-wide text-void transition hover:brightness-110"
            >
              Empezar por WhatsApp
            </a>
            <a
              href={PLACEHOLDERS.phoneHref}
              className="text-sm text-mist transition hover:text-paper"
            >
              {PLACEHOLDERS.phone}
            </a>
          </div>
        </div>
      </div>

      <footer className="relative mx-auto mt-20 flex max-w-6xl flex-col gap-4 border-t border-white/5 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
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
