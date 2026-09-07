import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { ConfigurationSummary } from './ActPlayground'

gsap.registerPlugin(ScrollTrigger)

const CHECKS = [
  'Instalar sistema operativo',
  'Drivers',
  'BIOS / perfiles',
  'Prueba de estrés',
  'Temperaturas estables',
  'Lista para entrega',
] as const

/**
 * Acto V — El despertar
 * 1) Panel madera sube desde abajo (empieza antes de pinnear)
 * 2) Contenido aparece ENCIMA
 * 3) Checks al scroll
 * 4) Fin → scroll normal al Acto 6
 */
export function ActConfig({ configuration }: { configuration: ConfigurationSummary }) {
  const sectionRef = useRef<HTMLElement>(null)
  const oakRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const section = sectionRef.current
    const oak = oakRef.current
    const content = contentRef.current
    const countEl = countRef.current
    if (!section || !oak || !content) return

    const checkEls = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-check]'))
    const markEls = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-check-mark]'))

    const setCount = (n: number) => {
      if (countEl) countEl.textContent = `${n}/${CHECKS.length}`
    }

    const ctx = gsap.context(() => {
      gsap.set(oak, { yPercent: 55 })
      gsap.set(content, { autoAlpha: 1 })
      gsap.set(checkEls, { opacity: 0.4 })
      gsap.set(markEls, { scale: 0, opacity: 0 })
      setCount(0)

      // Empieza a subir cuando el Acto 5 asoma (antes del pin full).
      // scrub:true (sin suavizado): al llegar a 'top top' el panel está EXACTO en 0
      // y el empalme con el pin no brinca. Con scrub numérico el tween llega con
      // retardo y el set del pin lo forzaba de golpe = salto brusco.
      gsap.to(oak, {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 95%',
          end: 'top top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${window.innerHeight * 4.0}`,
          pin: true,
          anticipatePin: 1,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      })

      // Red de seguridad: en el empalme el valor ya es 0, esto es no-op visual.
      tl.set(oak, { yPercent: 0 }, 0)

      // Texto izquierdo más dinámico (stagger)
      const copyBits = gsap.utils.toArray<HTMLElement>(section.querySelectorAll('[data-act5-copy]'))
      gsap.set(copyBits, { autoAlpha: 0, y: 28 })
      gsap.set(content, { autoAlpha: 1 })
      tl.to(
        copyBits,
        { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.07, ease: 'none' },
        0.06,
      )

      // Monitor entra un poco después / desde la derecha
      const monitor = section.querySelector('[data-act5-monitor]')
      if (monitor) {
        gsap.set(monitor, { autoAlpha: 0, x: 48 })
        tl.to(monitor, { autoAlpha: 1, x: 0, duration: 0.28, ease: 'none' }, 0.18)
      }

      const checkStart = 0.55
      const perCheck = 0.32
      checkEls.forEach((el, i) => {
        const at = checkStart + i * perCheck
        tl.to(el, { opacity: 1, duration: 0.08 }, at)
        tl.to(
          markEls[i],
          {
            scale: 1,
            opacity: 1,
            duration: 0.12,
            onUpdate: function (this: gsap.core.Tween) {
              if (this.progress() > 0.5) setCount(i + 1)
            },
          },
          at + 0.02,
        )
      })

      const after = checkStart + checkEls.length * perCheck
      tl.to({}, { duration: 0.4 }, after)
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="configuracion"
      className="relative -mt-28 h-screen overflow-hidden bg-[#1a100c]"
      aria-label="Acto V — El despertar"
    >
      <div
        ref={oakRef}
        className="absolute inset-0 z-0 bg-[#1a100c] bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(rgba(12,8,5,0.72), rgba(8,5,3,0.78)), url(/wood-oak.jpg)',
        }}
        aria-hidden
      />

      <div ref={contentRef} className="absolute inset-0 z-10 flex">
        {/* Izquierda: texto full half */}
        <div className="flex h-full w-1/2 flex-col justify-center px-8 py-16 md:px-12 lg:px-16">
          <p
            data-act5-copy
            className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase"
          >
            Acto V
          </p>
          <h2
            data-act5-copy
            className="font-display text-4xl font-bold tracking-tight text-paper text-balance sm:text-5xl lg:text-6xl"
          >
            El despertar
          </h2>
          <p
            data-act5-copy
            className="mt-5 max-w-lg text-base leading-relaxed text-paper/80 sm:text-lg"
          >
            La máquina ya está armada. Ahora se enciende, se calibra y se valida: nada se entrega a
            medias.
          </p>
          <ul className="mt-10 space-y-4 text-sm text-paper/90 sm:text-base">
            <li data-act5-copy className="border-l-2 border-spark/70 pl-4">
              Cableado limpio y estándares de armado
            </li>
            <li data-act5-copy className="border-l-2 border-spark/70 pl-4">
              Sistema, drivers y perfiles listos
            </li>
            <li data-act5-copy className="border-l-2 border-spark/70 pl-4">
              Estrés, temperaturas y estabilidad
            </li>
            {configuration.total > 0 && (
              <li data-act5-copy className="border-l-2 border-spark/70 pl-4">
                Configuración: ${configuration.total.toLocaleString('es-MX')} MXN
              </li>
            )}
          </ul>
        </div>

        <div className="relative h-full w-1/2 overflow-hidden">
          <div
            data-act5-monitor
            className="absolute top-0 bottom-0 left-0 right-0 flex items-stretch"
          >
            <div
              className="ml-auto flex h-full w-[118%] flex-col border-y-[10px] border-l-[10px] border-r-0 border-[#1a1a1c] bg-[#0a0a0c] shadow-[-12px_0_40px_rgba(0,0,0,0.55)]"
              style={{
                borderTopLeftRadius: '1.25rem',
                borderBottomLeftRadius: '1.25rem',
              }}
            >
              <div className="flex items-center justify-between border-b-2 border-[#2a2a2e] bg-[#121214] px-5 py-2.5 text-[10px] tracking-[0.22em] text-white/45 uppercase">
                <span>CompuLab · Monitor</span>
                <span ref={countRef}>
                  0/{CHECKS.length}
                </span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-auto border-[6px] border-[#0a0a0c] bg-[#0b1f6a] px-7 py-7 md:px-9 md:py-8">
                <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
                <p className="relative mb-6 font-mono text-[11px] tracking-[0.25em] text-white/70 uppercase">
                  POST · Validación
                </p>
                <ul className="relative space-y-4 font-mono text-sm text-white sm:text-base md:text-lg">
                  {CHECKS.map((label) => (
                    <li
                      key={label}
                      data-check
                      className="flex items-center justify-between gap-4 border-b border-white/15 pb-3"
                    >
                      <span>{label}</span>
                      <span
                        data-check-mark
                        className="inline-flex size-6 items-center justify-center rounded-sm border border-emerald-300/40 bg-emerald-400/20 text-sm font-bold text-emerald-300"
                        aria-hidden
                      >
                        ✓
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-center border-t-2 border-[#2a2a2e] bg-[#121214] py-3.5" aria-hidden>
                <div className="h-2 w-24 rounded-full bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
