import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import {
  DEFAULT_SPARK_PATH,
  loadSparkPath,
  waypointsToSmoothPathD,
  type SparkWaypoint,
} from '../../data/sparkPath'
import { SparkPathEditor } from './SparkPathEditor'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)

/** X (inset) intacta · Y en vh para leer al centro de pantalla y con aire entre frases */
const PHRASES = [
  { id: 'siempre', text: 'Siempre hay', side: 'left', top: '46vh', inset: '6%', wrap: false },
  { id: 'deseo', text: 'un deseo rondando...', side: 'left', top: '72vh', inset: '10%', wrap: false },
  { id: 'plan', text: 'Un plan.', side: 'right', top: '100vh', inset: '8%', wrap: false },
  { id: 'taller', text: 'Un taller.', side: 'left', top: '128vh', inset: '16%', wrap: false },
  { id: 'chispa', text: 'Una chispa.', side: 'right', top: '156vh', inset: '14%', wrap: false },
  {
    id: 'idea',
    text: 'Una idea\nque pide forma.',
    side: 'left',
    top: '188vh',
    inset: '24%',
    wrap: 'break' as const,
  },
  { id: 'final', text: 'Y que al final...', side: 'center', top: '252vh', inset: '0%', wrap: false },
] as const

const TRAIL_LIFE_MS = 1200
const TRAIL_STEP = 0.12
const TRAIL_MAX_POINTS = 160

type TrailPoint = { x: number; y: number; born: number }

function pctInSection(
  el: HTMLElement,
  section: HTMLElement,
  anchor: 'start' | 'end' | 'center',
): SparkWaypoint {
  const s = section.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const y = ((r.top + r.height / 2 - s.top) / s.height) * 100
  if (anchor === 'center') {
    return { x: ((r.left + r.width / 2 - s.left) / s.width) * 100, y }
  }
  if (anchor === 'start') {
    return { x: ((r.left - s.left) / s.width) * 100 + 0.8, y }
  }
  return { x: ((r.right - s.left) / s.width) * 100 - 0.8, y }
}

/** Primera→última letra por frase (zigzag L/R), luego cabeza */
function buildPathFromPhrases(
  phraseEls: HTMLElement[],
  section: HTMLElement,
  headEl: HTMLElement | null,
): SparkWaypoint[] {
  const points: SparkWaypoint[] = []
  phraseEls.forEach((el) => {
    points.push(pctInSection(el, section, 'start'))
    points.push(pctInSection(el, section, 'end'))
  })
  if (headEl) {
    const mid = pctInSection(headEl, section, 'center')
    points.push({ x: mid.x, y: mid.y - 2 })
    points.push({ x: mid.x, y: mid.y + 1 })
  } else {
    points.push({ x: 50, y: 88 }, { x: 50, y: 92 })
  }
  return points.map((p) => ({
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
  }))
}

export function ActSpark() {
  const eyeMaskId = useId().replace(/:/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const sparkRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const litRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLParagraphElement>(null)
  const silWrapRef = useRef<HTMLDivElement>(null)
  const silSvgRef = useRef<SVGSVGElement>(null)
  const rimRef = useRef<HTMLDivElement>(null)
  const headAnchorRef = useRef<HTMLDivElement>(null)
  const trailCanvasRef = useRef<HTMLCanvasElement>(null)
  const phraseRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const trailPts = useRef<TrailPoint[]>([])
  const animRef = useRef<{ tl?: gsap.core.Timeline; st?: ScrollTrigger }>({})

  const [points, setPoints] = useState<SparkWaypoint[]>(() => loadSparkPath() ?? DEFAULT_SPARK_PATH)
  const [placeMode, setPlaceMode] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const rebuildFromText = useCallback(() => {
    const section = sectionRef.current
    if (!section) return
    const els = phraseRefs.current.filter(Boolean) as HTMLElement[]
    if (els.length !== PHRASES.length) return
    const next = buildPathFromPhrases(els, section, headAnchorRef.current)
    setPoints(next)
  }, [])

  const applyPathToSvg = useCallback((wp: SparkWaypoint[]) => {
    const path = pathRef.current
    if (!path) return
    path.setAttribute('d', waypointsToSmoothPathD(wp))
  }, [])

  useLayoutEffect(() => {
    const section = sectionRef.current
    if (!section) return

    // Si no hay path guardado, medir textos
    const stored = loadSparkPath()
    if (!stored) {
      const els = phraseRefs.current.filter(Boolean) as HTMLElement[]
      if (els.length === PHRASES.length) {
        const measured = buildPathFromPhrases(els, section, headAnchorRef.current)
        setPoints(measured)
        applyPathToSvg(measured)
        return
      }
    }
    applyPathToSvg(points)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- solo bootstrap

  useLayoutEffect(() => {
    applyPathToSvg(points)
  }, [points, applyPathToSvg])

  useLayoutEffect(() => {
    const root = rootRef.current
    const section = sectionRef.current
    const path = pathRef.current
    const spark = sparkRef.current
    const glow = glowRef.current
    const lit = litRef.current
    const enter = enterRef.current
    const silWrap = silWrapRef.current
    const silSvg = silSvgRef.current
    const rim = rimRef.current
    const headAnchor = headAnchorRef.current
    const canvas = trailCanvasRef.current
    if (
      !root ||
      !section ||
      !path ||
      !spark ||
      !glow ||
      !lit ||
      !enter ||
      !silWrap ||
      !silSvg ||
      !rim ||
      !headAnchor ||
      !canvas
    )
      return

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = section.clientWidth
      const h = section.clientHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx2 = canvas.getContext('2d')
      if (ctx2) ctx2.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resizeCanvas()

    const applyMask = () => {
      const sRect = section.getBoundingClientRect()
      const sp = spark.getBoundingClientRect()
      const x = sp.left + sp.width / 2 - sRect.left
      const y = sp.top + sp.height / 2 - sRect.top
      const radius = window.innerWidth < 768 ? 140 : 210
      const gradient = `radial-gradient(circle ${radius}px at ${x}px ${y}px, #000 0%, #000 34%, rgba(0,0,0,0.72) 58%, transparent 80%)`
      lit.style.webkitMaskImage = gradient
      lit.style.maskImage = gradient
    }

    const buildSmoothPath = (
      ctx2: CanvasRenderingContext2D,
      alive: TrailPoint[],
      w: number,
      h: number,
    ) => {
      const px = (p: TrailPoint) => ({ x: (p.x / 100) * w, y: (p.y / 100) * h })
      const p0 = px(alive[0])
      ctx2.beginPath()
      ctx2.moveTo(p0.x, p0.y)
      if (alive.length === 2) {
        const p1 = px(alive[1])
        ctx2.lineTo(p1.x, p1.y)
        return
      }
      for (let i = 1; i < alive.length - 1; i++) {
        const a = px(alive[i])
        const b = px(alive[i + 1])
        ctx2.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2)
      }
      const last = px(alive[alive.length - 1])
      ctx2.lineTo(last.x, last.y)
    }

    const paintTrail = (now: number) => {
      const ctx2 = canvas.getContext('2d')
      if (!ctx2) return
      const w = section.clientWidth
      const h = section.clientHeight
      ctx2.clearRect(0, 0, w, h)

      const alive = trailPts.current.filter((p) => now - p.born < TRAIL_LIFE_MS)
      trailPts.current = alive
      if (alive.length < 2) return

      const headAge = 1 - (now - alive[alive.length - 1].born) / TRAIL_LIFE_MS
      const tailAge = 1 - (now - alive[0].born) / TRAIL_LIFE_MS
      const alpha = Math.max(0.15, (headAge * 0.55 + Math.max(0, tailAge) * 0.25))

      ctx2.lineCap = 'round'
      ctx2.lineJoin = 'round'

      // Una sola curva continua (barato y limpio)
      buildSmoothPath(ctx2, alive, w, h)
      ctx2.strokeStyle = `rgba(250, 204, 21, ${0.22 * alpha})`
      ctx2.lineWidth = 2.2
      ctx2.stroke()

      buildSmoothPath(ctx2, alive, w, h)
      ctx2.strokeStyle = `rgba(250, 204, 21, ${0.75 * alpha})`
      ctx2.lineWidth = 1.05
      ctx2.stroke()
    }

    const sampleTrail = () => {
      const now = performance.now()
      const sRect = section.getBoundingClientRect()
      const sp = spark.getBoundingClientRect()
      if (getComputedStyle(spark).opacity === '0' || sp.width === 0) {
        paintTrail(now)
        return
      }
      const x = ((sp.left + sp.width / 2 - sRect.left) / sRect.width) * 100
      const y = ((sp.top + sp.height / 2 - sRect.top) / sRect.height) * 100
      const pts = trailPts.current
      const last = pts[pts.length - 1]

      if (!last) {
        pts.push({ x, y, born: now })
      } else {
        const gap = Math.hypot(x - last.x, y - last.y)
        if (gap > TRAIL_STEP * 2) {
          // Huecos grandes (scroll rápido): pocos puntos intermedios
          const steps = Math.min(8, Math.ceil(gap / TRAIL_STEP))
          for (let i = 1; i <= steps; i++) {
            const t = i / steps
            pts.push({
              x: last.x + (x - last.x) * t,
              y: last.y + (y - last.y) * t,
              born: now,
            })
          }
        } else if (gap > TRAIL_STEP) {
          pts.push({ x, y, born: now })
        }
      }

      if (pts.length > TRAIL_MAX_POINTS) pts.splice(0, pts.length - TRAIL_MAX_POINTS)
      paintTrail(now)
    }

    /** Rim por proximidad · ENTRA se traba al bajar y se suelta al subir */
    let enterLatched = false
    let latchedAtProgress = 1

    const showEnter = () => {
      gsap.to(enter, {
        autoAlpha: 1,
        y: 0,
        filter: 'blur(0px)',
        scale: 1,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: 'auto',
      })
    }

    const hideEnter = () => {
      gsap.to(enter, {
        autoAlpha: 0,
        y: 14,
        filter: 'blur(8px)',
        scale: 0.96,
        duration: 0.35,
        ease: 'power2.inOut',
        overwrite: 'auto',
      })
    }

    const updateClimaxFromSpark = () => {
      const hr = headAnchor.getBoundingClientRect()
      const sp = spark.getBoundingClientRect()
      const sRect = section.getBoundingClientRect()
      const sx = sp.left + sp.width / 2
      const sy = sp.top + sp.height / 2
      const dist = Math.hypot(sx - (hr.left + hr.width / 2), sy - (hr.top + hr.height / 2))

      const lightStart = 48
      const lightFull = 14
      const latchDist = 18
      const st = animRef.current.st
      const progress = st?.progress ?? 0

      const light = gsap.utils.clamp(
        0,
        1,
        1 - (dist - lightFull) / (lightStart - lightFull),
      )

      // Color → amarillo ENTRA desde el penúltimo punto hasta el último
      const prev = points[points.length - 2]
      const last = points[points.length - 1]
      let colorT = 0
      if (prev && last) {
        const sparkX = ((sx - sRect.left) / sRect.width) * 100
        const sparkY = ((sy - sRect.top) / sRect.height) * 100
        const ax = last.x - prev.x
        const ay = last.y - prev.y
        const len2 = ax * ax + ay * ay || 1
        colorT = gsap.utils.clamp(0, 1, ((sparkX - prev.x) * ax + (sparkY - prev.y) * ay) / len2)
      }
      if (enterLatched) colorT = 1

      const core = gsap.utils.interpolate('#fffef8', '#facc15', colorT) as string
      const mid = gsap.utils.interpolate('#ffe9a8', '#facc15', colorT) as string
      const g0 = gsap.utils.interpolate(0.5, 0.65, colorT)
      const g1 = gsap.utils.interpolate(0.22, 0.45, colorT)
      spark.style.background = `radial-gradient(circle, ${core} 0%, ${mid} 55%, #facc15 100%)`
      spark.style.boxShadow = [
        `0 0 8px 3px rgba(250,204,21,${0.35 + colorT * 0.6})`,
        `0 0 22px 8px rgba(250,204,21,${0.2 + colorT * 0.55})`,
        `0 0 40px 14px rgba(250,204,21,${0.12 + colorT * 0.35})`,
      ].join(', ')
      glow.style.background = `radial-gradient(circle, rgba(250,204,21,${g0}) 0%, rgba(250,204,21,${g1}) 42%, transparent 72%)`

      // Rim detrás (se ve por las ventanas-ojos)
      gsap.set(rim, {
        autoAlpha: light * 0.95,
        scale: 0.82 + light * 0.18,
      })

      const absorb = gsap.utils.clamp(0, 1, (light - 0.65) / 0.35)
      gsap.set(spark, { autoAlpha: 1 - absorb * 0.92, scale: 1 - absorb * 0.8 })
      gsap.set(glow, { autoAlpha: 1 - absorb * 0.25, scale: 1 + absorb * 0.45 })

      if (dist <= latchDist && !enterLatched) {
        enterLatched = true
        latchedAtProgress = progress
        showEnter()
      }

      if (enterLatched && progress < latchedAtProgress - 0.012) {
        enterLatched = false
        hideEnter()
      }
    }

    const onFrame = () => {
      applyMask()
      sampleTrail()
      updateClimaxFromSpark()
    }

    const ctx = gsap.context(() => {
      path.setAttribute('d', waypointsToSmoothPathD(points))

      gsap.set([spark, glow], { xPercent: -50, yPercent: -50, scale: 1, autoAlpha: 1 })
      gsap.set(enter, { autoAlpha: 0, y: 18, filter: 'blur(10px)', scale: 0.94 })
      gsap.set(silWrap, { autoAlpha: 1 })
      gsap.set(rim, { autoAlpha: 0, scale: 0.75 })

      gsap.set([spark, glow], {
        motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 0, end: 0 },
      })
      onFrame()

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.55,
          invalidateOnRefresh: true,
          onUpdate: onFrame,
        },
      })

      // Solo el recorrido del destello; climax = proximidad a la cabeza
      tl.to(
        [spark, glow],
        {
          motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: 0, end: 1 },
          duration: 1,
          onUpdate: onFrame,
        },
        0,
      )

      animRef.current = { tl, st: tl.scrollTrigger ?? undefined }
      ScrollTrigger.refresh()
    }, root)

    const onResize = () => {
      resizeCanvas()
      ScrollTrigger.refresh()
    }
    window.addEventListener('resize', onResize)
    gsap.ticker.add(onFrame)

    return () => {
      window.removeEventListener('resize', onResize)
      gsap.ticker.remove(onFrame)
      ctx.revert()
    }
  }, [points])

  const sectionToPct = (clientX: number, clientY: number): SparkWaypoint | null => {
    const section = sectionRef.current
    if (!section) return null
    const r = section.getBoundingClientRect()
    return {
      x: Math.round((((clientX - r.left) / r.width) * 100) * 10) / 10,
      y: Math.round((((clientY - r.top) / r.height) * 100) * 10) / 10,
    }
  }

  const onSectionPointerDown = (e: React.PointerEvent) => {
    if (!import.meta.env.DEV) return
    if ((e.target as HTMLElement).closest('[data-path-handle]')) return

    if (placeMode) {
      const p = sectionToPct(e.clientX, e.clientY)
      if (!p) return
      setPoints((prev) => [...prev, p])
      setPlaceMode(false)
      return
    }
  }

  const onHandlePointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelected(index)
    setDragIndex(index)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onHandlePointerMove = (e: React.PointerEvent) => {
    if (dragIndex === null) return
    const p = sectionToPct(e.clientX, e.clientY)
    if (!p) return
    setPoints((prev) => prev.map((pt, i) => (i === dragIndex ? p : pt)))
  }

  const onHandlePointerUp = () => setDragIndex(null)

  return (
    <div ref={rootRef} className="relative">
      <section
        ref={sectionRef}
        id="deseo"
        className="relative min-h-[320vh] overflow-hidden bg-void pb-[40vh]"
        aria-label="Acto I — El deseo"
        onPointerDown={onSectionPointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
      >
        <svg
          className="pointer-events-none absolute inset-0 z-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path ref={pathRef} d={waypointsToSmoothPathD(points)} fill="none" stroke="transparent" />
        </svg>

        <canvas
          ref={trailCanvasRef}
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
          aria-hidden
        />

        {/* Destello detrás del texto · núcleo chico, tono blanco-cálido */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute top-0 left-0 z-[1] h-28 w-28 rounded-full will-change-transform sm:h-36 sm:w-36"
          style={{
            background:
              'radial-gradient(circle, rgba(255,252,240,0.5) 0%, rgba(250,220,120,0.22) 42%, transparent 72%)',
            filter: 'blur(14px)',
          }}
          aria-hidden
        />
        <div
          ref={sparkRef}
          className="pointer-events-none absolute top-0 left-0 z-[1] h-2.5 w-2.5 rounded-full will-change-transform sm:h-3 sm:w-3"
          style={{
            background: 'radial-gradient(circle, #fffef8 0%, #ffe9a8 55%, #f5d56a 100%)',
            boxShadow:
              '0 0 8px 3px rgba(255,250,235,0.9), 0 0 22px 8px rgba(255,236,180,0.45), 0 0 40px 14px rgba(250,204,21,0.22)',
          }}
          aria-hidden
        />

        <div
          ref={litRef}
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            WebkitMaskImage:
              'radial-gradient(circle 210px at 14% 4%, #000 0%, #000 34%, transparent 80%)',
            maskImage:
              'radial-gradient(circle 210px at 14% 4%, #000 0%, #000 34%, transparent 80%)',
          }}
        >
          {PHRASES.map((phrase, i) => (
            <p
              key={phrase.id}
              ref={(el) => {
                phraseRefs.current[i] = el
              }}
              className={[
                'absolute font-display font-bold tracking-tight text-paper',
                'text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem]',
                phrase.wrap === 'break' ? 'whitespace-pre-line' : 'whitespace-nowrap',
                phrase.side === 'center' ? 'left-1/2 -translate-x-1/2 text-center' : '',
                phrase.side === 'left' ? 'text-left' : '',
                phrase.side === 'right' ? 'text-right' : '',
              ].join(' ')}
              style={
                phrase.side === 'center'
                  ? { top: phrase.top }
                  : phrase.side === 'left'
                    ? { top: phrase.top, left: phrase.inset }
                    : { top: phrase.top, right: phrase.inset }
              }
            >
              {phrase.text}
            </p>
          ))}
        </div>

        <div
          ref={silWrapRef}
          className="pointer-events-none absolute left-1/2 top-[278vh] z-[3] w-[min(42vw,200px)] -translate-x-1/2 sm:w-[220px]"
        >
          {/* Luz detrás: se ve a través de los ojos-ventana */}
          <div
            ref={rimRef}
            className="absolute left-1/2 top-[6%] h-[72%] w-[82%] -translate-x-1/2 rounded-[50%] bg-spark/50 blur-2xl"
            aria-hidden
          />
          <div ref={headAnchorRef} className="absolute left-1/2 top-[18%] size-2 -translate-x-1/2" />
          <svg ref={silSvgRef} viewBox="0 0 200 220" className="relative w-full" aria-hidden>
            <defs>
              <mask id={eyeMaskId} maskUnits="userSpaceOnUse">
                <rect x="0" y="0" width="200" height="220" fill="white" />
                {/* Agujeros = ventanas al fondo */}
                <ellipse cx="86" cy="68" rx="3.5" ry="3.8" fill="black" />
                <ellipse cx="114" cy="68" rx="3.5" ry="3.8" fill="black" />
              </mask>
            </defs>
            <g mask={`url(#${eyeMaskId})`}>
              <circle cx="100" cy="72" r="42" fill="#09090b" stroke="none" />
              <path
                d="M28 210 C28 150, 55 128, 100 128 C145 128, 172 150, 172 210"
                fill="#09090b"
                stroke="none"
              />
            </g>
          </svg>
        </div>

        <p
          ref={enterRef}
          className="pointer-events-none absolute left-1/2 top-[266vh] z-[4] -translate-x-1/2 font-display text-4xl font-extrabold tracking-[0.32em] text-spark sm:text-6xl md:text-7xl"
        >
          ENTRA
        </p>

        {/* Handles de edición (solo dev) */}
        {import.meta.env.DEV &&
          points.map((p, i) => (
            <button
              key={`handle-${i}`}
              type="button"
              data-path-handle
              aria-label={`Punto ${i + 1}`}
              onPointerDown={(e) => onHandlePointerDown(i, e)}
              className={`absolute z-[20] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-void ${
                selected === i ? 'bg-white scale-125' : 'bg-spark'
              }`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            />
          ))}

        <p className="pointer-events-none absolute top-[42vh] left-1/2 z-[5] -translate-x-1/2 text-[10px] tracking-[0.28em] text-mist/50 uppercase sm:text-xs">
          Desliza
        </p>
      </section>

      {import.meta.env.DEV && (
        <SparkPathEditor
          points={points}
          onChange={setPoints}
          onRebuildFromText={rebuildFromText}
          placeMode={placeMode}
          onPlaceModeChange={setPlaceMode}
          selected={selected}
          onSelect={setSelected}
        />
      )}
    </div>
  )
}
