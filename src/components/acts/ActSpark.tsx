import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { IDEA_COPY, PLAN_COPY } from '../../data/content'
import {
  DEFAULT_SPARK_PATH,
  loadSparkPath,
  waypointsToSmoothPathD,
  type SparkWaypoint,
} from '../../data/sparkPath'
import {
  DEFAULT_CONSTELLATION,
  loadConstellation,
  type ConstellationMap,
  type Edge,
} from '../../data/constellation'
import { SparkPathEditor } from './SparkPathEditor'
import { ConstellationEditor } from './ConstellationEditor'

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

/** Pantallas de scroll: Acto 2 (idea) + Acto 3 (plano) + rasgado → Acto 4 */
const IDEA_SCREENS = 4.8
const PLAN_SCREENS = 2.8
const TEAR_SCREENS = 3.2
const PIN_SCREENS = IDEA_SCREENS + PLAN_SCREENS + TEAR_SCREENS

/** Tiempos en la timeline pineada (Acto 2 ocupa 0→1; el resto se escala al scroll).
 *  PLAN_START > 1 = aire de lectura del copy del Acto 2 antes del morph. */
const PLAN_START = 1.42
const PLAN_MORPH = PLAN_START
const PLAN_COPY_AT = PLAN_START + (PLAN_SCREENS / IDEA_SCREENS) * 0.22
/** Sello DESPUÉS de poder leer toda la ficha (items + aire) */
const PLAN_STAMP_AT = PLAN_START + (PLAN_SCREENS / IDEA_SCREENS) * 0.78
const TEAR_START = PLAN_START + PLAN_SCREENS / IDEA_SCREENS
const TEAR_END = TEAR_START + TEAR_SCREENS / IDEA_SCREENS

/** Blueprint más claro: contraste y grilla legible (Acto 3) */
const BLUEPRINT_BG = '#132a4a'
const BLUEPRINT_GRID = [
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 22px)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.07) 0 1px, transparent 1px 22px)',
  'repeating-linear-gradient(0deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 110px)',
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 110px)',
].join(', ')
const STAMP_LIME = '#a3e635'

/** Curva con la que la luz se apaga al acercarse a la cabeza. La usan los dos actos:
 *  el Acto 2 la necesita para arrancar en el mismo estado en que el Acto 1 la deja. */
const LIGHT_START = 48
const LIGHT_FULL = 14

function absorbAtDistance(dist: number) {
  const light = gsap.utils.clamp(0, 1, 1 - (dist - LIGHT_FULL) / (LIGHT_START - LIGHT_FULL))
  return gsap.utils.clamp(0, 1, (light - 0.65) / 0.35)
}

/** Mismo aspecto que el destello del Acto 1 con colorT = 1 (ya virado a amarillo) */
const HOT_SPARK_BG = 'radial-gradient(circle, #facc15 0%, #facc15 55%, #facc15 100%)'
const HOT_SPARK_SHADOW = [
  '0 0 8px 3px rgba(250,204,21,0.95)',
  '0 0 22px 8px rgba(250,204,21,0.75)',
  '0 0 40px 14px rgba(250,204,21,0.47)',
].join(', ')
const HOT_GLOW_BG =
  'radial-gradient(circle, rgba(250,204,21,0.65) 0%, rgba(250,204,21,0.45) 42%, transparent 72%)'

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

/**
 * ACTO 1 (el deseo) + ACTO 2 (la idea) + ACTO 3 (el plan) como una sola secuencia.
 *
 * El Acto 2 no es otra sección: es la última pantalla del Acto 1. Cuando el destello
 * llega a la cabeza, la sección se congela (pin) en ese mismo cuadro y desde ahí la
 * luz sube, la silueta se hunde y los puntos dibujan la constelación. El Acto 3
 * re-skinea esa constelación a blueprint, sella APROBADO y rasga el papel hacia
 * el Acto 4. Por eso la silueta, el ENTRA y la estela son los del Acto 1: no hay
 * nada duplicado.
 */
export function ActSpark() {
  const eyeMaskId = useId().replace(/:/g, '')
  const rootRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const sparkRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const litRef = useRef<HTMLDivElement>(null)
  const enterRef = useRef<HTMLParagraphElement>(null)
  const exitWorldRef = useRef<HTMLDivElement>(null)
  const silWrapRef = useRef<HTMLDivElement>(null)
  const rimRef = useRef<HTMLDivElement>(null)
  const headAnchorRef = useRef<HTMLDivElement>(null)
  const trailCanvasRef = useRef<HTMLCanvasElement>(null)
  const phraseRefs = useRef<(HTMLParagraphElement | null)[]>([])
  const trailPts = useRef<TrailPoint[]>([])
  const animRef = useRef<{ tl?: gsap.core.Timeline; st?: ScrollTrigger }>({})

  // Acto 2 — viven dentro de la sección del Acto 1, en su última pantalla
  const lightStageRef = useRef<HTMLDivElement>(null)
  const riseSparkRef = useRef<HTMLDivElement>(null)
  const riseGlowRef = useRef<HTMLDivElement>(null)
  const ideaStageRef = useRef<HTMLDivElement>(null)
  const splitLayerRef = useRef<HTMLDivElement>(null)
  const ideaLayoutRef = useRef<HTMLDivElement>(null)
  const constStageRef = useRef<HTMLDivElement>(null)
  const constSvgRef = useRef<SVGSVGElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const blueprintBgRef = useRef<HTMLDivElement>(null)
  const planCopyRef = useRef<HTMLDivElement>(null)
  const stampRef = useRef<HTMLDivElement>(null)
  const tearRevealRef = useRef<HTMLDivElement>(null)
  const tearEdgeRef = useRef<HTMLDivElement>(null)
  const paperSheetRef = useRef<HTMLDivElement>(null)

  const [points, setPoints] = useState<SparkWaypoint[]>(() => loadSparkPath() ?? DEFAULT_SPARK_PATH)
  const [placeMode, setPlaceMode] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const [map, setMap] = useState<ConstellationMap>(
    () => loadConstellation() ?? DEFAULT_CONSTELLATION,
  )
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null)
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const [, setOverlayOk] = useState(false)
  const [starPlaceMode, setStarPlaceMode] = useState(false)
  const [connectMode, setConnectMode] = useState(false)
  const [starSelected, setStarSelected] = useState<number | null>(null)
  const [starDragIndex, setStarDragIndex] = useState<number | null>(null)

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
    const exitWorld = exitWorldRef.current
    const silWrap = silWrapRef.current
    const rim = rimRef.current
    const headAnchor = headAnchorRef.current
    const canvas = trailCanvasRef.current
    const lightStage = lightStageRef.current
    const riseSpark = riseSparkRef.current
    const riseGlow = riseGlowRef.current
    const ideaStage = ideaStageRef.current
    const splitLayer = splitLayerRef.current
    const ideaLayout = ideaLayoutRef.current
    const constSvg = constSvgRef.current
    const copy = copyRef.current
    const blueprintBg = blueprintBgRef.current
    const planCopy = planCopyRef.current
    const stamp = stampRef.current
    const tearReveal = tearRevealRef.current
    const tearEdge = tearEdgeRef.current
    const paperSheet = paperSheetRef.current
    if (
      !root ||
      !section ||
      !path ||
      !spark ||
      !glow ||
      !lit ||
      !enter ||
      !exitWorld ||
      !silWrap ||
      !rim ||
      !headAnchor ||
      !canvas ||
      !lightStage ||
      !riseSpark ||
      !riseGlow ||
      !ideaStage ||
      !splitLayer ||
      !ideaLayout ||
      !constSvg ||
      !copy ||
      !blueprintBg ||
      !planCopy ||
      !stamp ||
      !tearReveal ||
      !tearEdge ||
      !paperSheet
    )
      return

    const stars = constSvg.querySelectorAll<SVGCircleElement>('[data-star]')
    const edgeCores = constSvg.querySelectorAll<SVGLineElement>('[data-edge-core]')
    const edgeGlows = constSvg.querySelectorAll<SVGLineElement>('[data-edge-glow]')
    const shots = splitLayer.querySelectorAll<HTMLDivElement>('[data-shot]')

    /** El relevo no se hace al congelar la sección sino justo antes de que la luz
     *  suba: el Acto 1 va con scrub, así que al congelar todavía viene en camino a
     *  la cabeza. Esperar a este punto de la línea de tiempo garantiza que ambas
     *  luces estén en la misma coordenada cuando se hace el cambio. */
    const HANDOFF_AT = 0.11
    let ideaTl: gsap.core.Timeline | undefined
    // time() — no progress(): la timeline se alarga con el Acto 3/rasgado
    const inClimax = () => (ideaTl?.time() ?? 0) >= HANDOFF_AT

    /** Las capas del Acto 2 miden exactamente una pantalla real, no 100vh de CSS:
     *  así coinciden al pixel con el encuadre en el que se congela la sección. */
    const sizeStages = () => {
      const h = `${window.innerHeight}px`
      lightStage.style.height = h
      ideaStage.style.height = h
    }
    sizeStages()

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

    /** La luz activa: la del recorrido, o la que sube en el clímax */
    const activeSpark = () => (inClimax() ? riseSpark : spark)

    /** La máscara se queda anclada a la luz del recorrido, que al final del Acto 1
     *  reposa dentro de la cabeza. Si siguiera a la luz que sube, al acercarse
     *  volvería a encender "Y que al final..." justo antes de apagarlo. */
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
      const source = activeSpark()
      const sRect = section.getBoundingClientRect()
      const sp = source.getBoundingClientRect()
      if (getComputedStyle(source).opacity === '0' || sp.width === 0) {
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
    let enterHideTween: gsap.core.Tween | undefined
    let enterRescuedForPin = false
    const ideaPinActive = () => Boolean(ideaTl?.scrollTrigger?.isActive)

    const showEnter = () => {
      enterHideTween?.kill()
      enterHideTween = undefined
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
      // Con el pin del Acto 2 activo, el progreso del Acto 1 puede caer a 0
      // (más con el layout/WebGL del Acto 4). Ahí ENTRA ya no es del Acto 1:
      // lo apaga solo ideaTl con scrub.
      if (ideaPinActive()) return
      enterHideTween?.kill()
      enterHideTween = gsap.to(enter, {
        autoAlpha: 0,
        y: 14,
        filter: 'blur(8px)',
        scale: 0.96,
        duration: 0.35,
        ease: 'power2.inOut',
        overwrite: 'auto',
        onComplete: () => {
          enterHideTween = undefined
        },
      })
    }

    const updateClimaxFromSpark = () => {
      const hr = headAnchor.getBoundingClientRect()
      const sp = spark.getBoundingClientRect()
      const sRect = section.getBoundingClientRect()
      const sx = sp.left + sp.width / 2
      const sy = sp.top + sp.height / 2
      const dist = Math.hypot(sx - (hr.left + hr.width / 2), sy - (hr.top + hr.height / 2))

      const st = animRef.current.st
      const progress = st?.progress ?? 0

      const light = gsap.utils.clamp(
        0,
        1,
        1 - (dist - LIGHT_FULL) / (LIGHT_START - LIGHT_FULL),
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

      if (absorb >= 1 && !enterLatched) {
        enterLatched = true
        showEnter()
      }

      // Solo soltar si realmente subes el Acto 1 (lejos de la cabeza).
      // No usar histéresis relativa al latch: el pin puede reportar progress 0
      // y eso siempre ganaba a cualquier umbral tipo latch-0.08.
      if (enterLatched && !ideaPinActive() && progress < 0.65) {
        enterLatched = false
        hideEnter()
      }
    }

    const onFrame = () => {
      const pinOn = ideaPinActive()
      if (!pinOn) enterRescuedForPin = false

      // Pin activo + hide que ganó la carrera: rescate solo ANTES del fade de ENTRA
      if (
        pinOn &&
        enterLatched &&
        !enterRescuedForPin &&
        (ideaTl?.time() ?? 0) < 0.36 &&
        (enterHideTween || (gsap.getProperty(enter, 'autoAlpha') as number) < 0.05)
      ) {
        enterRescuedForPin = true
        showEnter()
      }

      if (inClimax()) {
        // El relevo: la luz del recorrido se apaga y manda la del clímax
        gsap.set([spark, glow], { autoAlpha: 0 })
        gsap.set(lightStage, { autoAlpha: 1 })
      } else {
        gsap.set(lightStage, { autoAlpha: 0 })
        updateClimaxFromSpark()
      }
      applyMask()
      sampleTrail()
    }

    /** Última posición del trazo, traducida a la caja del clímax (misma anchura que la sección) */
    const handoffLeft = () => `${points[points.length - 1]?.x ?? 50}%`
    const handoffTop = () => {
      const sectionH = section.offsetHeight
      const stageH = lightStage.offsetHeight || window.innerHeight
      const y = ((points[points.length - 1]?.y ?? 90) / 100) * sectionH - (sectionH - stageH)
      return `${(y / stageH) * 100}%`
    }

    /** Cuánto lleva absorbida la luz al terminar el trazo. No se puede fijar a mano:
     *  depende de dónde caiga el último punto respecto a la cabeza, y ese punto es
     *  dato editable. Reproduce la misma cuenta que updateClimaxFromSpark. */
    const handoffAbsorb = () => {
      const last = points[points.length - 1]
      if (!last) return 0
      const sRect = section.getBoundingClientRect()
      const hr = headAnchor.getBoundingClientRect()
      // La silueta puede llevar ya algo de hundimiento; se descuenta para medir
      // contra la cabeza donde estaba al terminar el trazo.
      const sunk = Number(gsap.getProperty(exitWorld, 'y')) || 0
      const dx = (last.x / 100) * sRect.width - (hr.left + hr.width / 2 - sRect.left)
      const dy = (last.y / 100) * sRect.height - (hr.top + hr.height / 2 - sRect.top - sunk)
      return absorbAtDistance(Math.hypot(dx, dy))
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

      gsap.set(exitWorld, { y: 0 })
      gsap.set(lightStage, { autoAlpha: 0 })
      gsap.set([riseSpark, riseGlow], { xPercent: -50, yPercent: -50 })
      gsap.set(shots, {
        left: '50%',
        top: '50%',
        xPercent: -50,
        yPercent: -50,
        autoAlpha: 0,
        scale: 0.5,
      })
      gsap.set(stars, { scale: 0, transformOrigin: '50% 50%', opacity: 0 })
      const prepEdge = (el: SVGLineElement, opacity: number) => {
        const len = Math.max(el.getTotalLength(), 0.001)
        gsap.set(el, {
          attr: { 'stroke-dasharray': len, 'stroke-dashoffset': len },
          strokeDasharray: len,
          strokeDashoffset: len,
          opacity,
        })
      }
      edgeCores.forEach((el) => prepEdge(el, 1))
      edgeGlows.forEach((el) => prepEdge(el, 0.38))
      gsap.set(ideaLayout, { autoAlpha: 0 })
      gsap.set(copy, { autoAlpha: 1, y: 0 })
      gsap.set(copy.querySelector('[data-idea-kicker]'), { opacity: 0, y: 8 })
      gsap.set(copy.querySelector('[data-idea-title]'), { opacity: 0, y: 16 })
      gsap.set(copy.querySelectorAll('[data-idea-item]'), { opacity: 0, y: 14 })
      gsap.set(blueprintBg, { autoAlpha: 0 })
      gsap.set(planCopy.querySelectorAll('[data-plan-head]'), { opacity: 0, y: 12 })
      gsap.set(planCopy.querySelectorAll('[data-plan-item]'), { opacity: 0, y: 14 })
      gsap.set(stamp, {
        autoAlpha: 0,
        scale: 1.06,
        rotate: -13,
        filter: 'blur(3px)',
        transformOrigin: '50% 50%',
      })
      gsap.set(tearReveal, { autoAlpha: 0 })
      gsap.set(tearEdge, { autoAlpha: 0 })
      gsap.set(paperSheet, { y: 0, clipPath: 'inset(0 0 0% 0)' })
      ideaStage.style.setProperty('--tear-p', '0')
      gsap.set(ideaStage, { autoAlpha: 1, backgroundColor: 'transparent' })

      onFrame()

      /* ========== ACTO 1 — el recorrido del destello ==========
         El final del trazo cae a una pantalla del fondo de la sección: ese es
         el cuadro que el Acto 2 congela. El end va en px para que el pin del
         Acto 2 no altere el ritmo de las frases. */
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${Math.max(1, section.offsetHeight - window.innerHeight)}`,
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

      /* ========== ACTO 2 — la idea ==========
         Arranca en el instante exacto en que termina el trazo: la sección se
         congela con la silueta y el ENTRA donde ya estaban. */
      ideaTl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: section,
          start: 'bottom bottom',
          end: () => `+=${window.innerHeight * PIN_SCREENS}`,
          pin: true,
          pinSpacing: true,
          scrub: 0.85,
          invalidateOnRefresh: true,
        },
      })

      // La luz retoma justo donde quedó: misma posición y mismo estado absorbido
      ideaTl.set(
        [riseSpark, riseGlow],
        { left: handoffLeft, top: handoffTop, xPercent: -50, yPercent: -50 },
        0,
      )

      // ENTRA por encima del ideaStage (z-6) para poder desvanecerse a la vista
      gsap.set(enter, { zIndex: 8 })
      ideaTl.to(
        enter,
        {
          autoAlpha: 0,
          filter: 'blur(12px)',
          y: -20,
          duration: 0.55,
          ease: 'none',
        },
        0.38,
      )

      // Sube al centro, saliendo de la cabeza, mientras la silueta se hunde
      ideaTl.fromTo(
        riseSpark,
        {
          autoAlpha: () => 1 - handoffAbsorb() * 0.92,
          scale: () => 1 - handoffAbsorb() * 0.8,
        },
        { autoAlpha: 1, scale: 1.25, duration: 0.3, ease: 'power2.out' },
        0.12,
      )
      ideaTl.fromTo(
        riseGlow,
        {
          autoAlpha: () => 1 - handoffAbsorb() * 0.25,
          scale: () => 1 + handoffAbsorb() * 0.45,
        },
        { autoAlpha: 1, scale: 1.6, duration: 0.3, ease: 'power2.out' },
        0.12,
      )
      ideaTl.to(
        [riseSpark, riseGlow],
        { left: '50%', top: '50%', duration: 0.34, ease: 'power2.out' },
        0.12,
      )

      ideaTl.to(exitWorld, { y: '75vh', duration: 0.32, ease: 'power1.in' }, 0.14)
      ideaTl.to(lit, { autoAlpha: 0, duration: 0.16 }, 0.14)
      ideaTl.to(rim, { autoAlpha: 0, duration: 0.1 }, 0.16)
      ideaTl.to(silWrap, { autoAlpha: 0, duration: 0.16 }, 0.32)

      ideaTl.to(ideaLayout, { autoAlpha: 1, duration: 0.1 }, 0.58)

      // Se desarma: la luz se rompe en puntos que vuelan a cada estrella
      ideaTl.to(
        [riseSpark, riseGlow],
        { autoAlpha: 0, scale: 0.3, duration: 0.06, ease: 'power2.in' },
        0.54,
      )
      ideaTl.set(shots, { left: '50%', top: '50%', autoAlpha: 1, scale: 1 }, 0.54)

      const n = Math.max(stars.length, 1)
      const idea = ideaTl
      shots.forEach((node, i) => {
        const star = stars[i]
        if (!star) return
        idea.to(
          node,
          {
            left: () => {
              const sr = ideaStage.getBoundingClientRect()
              const st = star.getBoundingClientRect()
              return `${(((st.left + st.width / 2 - sr.left) / sr.width) * 100).toFixed(2)}%`
            },
            top: () => {
              const sr = ideaStage.getBoundingClientRect()
              const st = star.getBoundingClientRect()
              return `${(((st.top + st.height / 2 - sr.top) / sr.height) * 100).toFixed(2)}%`
            },
            autoAlpha: 0,
            scale: 0.55,
            duration: 0.22,
            ease: 'power2.out',
          },
          0.56 + (i / n) * 0.08,
        )
        idea.to(
          star,
          { scale: 1, opacity: 1, duration: 0.08, ease: 'power2.out' },
          0.72 + (i / n) * 0.08,
        )
      })

      const DRAW = 0.055
      const GAP = 0.038
      edgeCores.forEach((core, i) => {
        const glow = edgeGlows[i]
        const at = 0.82 + i * GAP
        const drawTo = (el: SVGLineElement) => {
          const len = () => Math.max(el.getTotalLength(), 0.001)
          idea.fromTo(
            el,
            { strokeDasharray: len, strokeDashoffset: len },
            { strokeDashoffset: 0, duration: DRAW, ease: 'none' },
            at,
          )
        }
        drawTo(core)
        if (glow) drawTo(glow)
      })
      /* Copy Acto 2: título (continúa Acto 1) → mini lista de conceptos */
      idea.to(
        copy.querySelector('[data-idea-kicker]'),
        { opacity: 1, y: 0, duration: 0.1, ease: 'none' },
        0.7,
      )
      idea.to(
        copy.querySelector('[data-idea-title]'),
        { opacity: 1, y: 0, duration: 0.18, ease: 'none' },
        0.74,
      )
      idea.to(
        copy.querySelectorAll('[data-idea-item]'),
        { opacity: 1, y: 0, duration: 0.16, ease: 'none', stagger: 0.07 },
        0.88,
      )

      /* ========== ACTO 3 — el plan (blueprint) ========== */
      const morphDur = Math.max(0.12, PLAN_COPY_AT - PLAN_MORPH)
      idea.to(
        copy,
        { autoAlpha: 0, y: -10, duration: morphDur * 0.5, ease: 'none' },
        PLAN_MORPH,
      )
      idea.to(stars, { opacity: 0, scale: 0.4, duration: morphDur * 0.7, ease: 'none' }, PLAN_MORPH)
      idea.to(
        section.querySelectorAll('[data-star-handle]'),
        { autoAlpha: 0, duration: morphDur * 0.4, ease: 'none' },
        PLAN_MORPH,
      )
      idea.to(edgeGlows, { opacity: 0, duration: morphDur * 0.5, ease: 'none' }, PLAN_MORPH)
      idea.to(
        edgeCores,
        { attr: { stroke: '#f4f7fb' }, stroke: '#f4f7fb', duration: morphDur, ease: 'none' },
        PLAN_MORPH,
      )
      idea.to(blueprintBg, { autoAlpha: 1, duration: morphDur, ease: 'none' }, PLAN_MORPH)
      idea.to(
        planCopy.querySelectorAll('[data-plan-head]'),
        { opacity: 1, y: 0, duration: 0.18, ease: 'none' },
        PLAN_COPY_AT,
      )
      idea.to(
        planCopy.querySelectorAll('[data-plan-item]'),
        { opacity: 1, y: 0, duration: 0.18, ease: 'none', stagger: 0.07 },
        PLAN_COPY_AT + 0.1,
      )

      // Sello APROBADO — solo cuando la ficha ya se pudo leer
      idea.fromTo(
        stamp,
        { autoAlpha: 0, scale: 1.06, rotate: -13, filter: 'blur(3px)' },
        {
          autoAlpha: 1,
          scale: 0.985,
          rotate: -11.5,
          filter: 'blur(0px)',
          duration: 0.18,
          ease: 'none',
        },
        PLAN_STAMP_AT,
      )
      idea.to(
        stamp,
        { scale: 1, rotate: -12, duration: 0.1, ease: 'none' },
        PLAN_STAMP_AT + 0.18,
      )

      /* ========== Rasgado tipo Trevor Noah ==========
         El frente cruza de izquierda→derecha. Detrás de él el plano conserva
         solo la parte superior y deja visible una vista estable del Acto 4. */
      const tearDur = Math.max(0.2, TEAR_END - TEAR_START)
      idea.set(tearReveal, { autoAlpha: 1 }, TEAR_START)
      const tearFiber = tearEdge.querySelector<SVGPathElement>('[data-tear-fiber]')
      const tearHighlight = tearEdge.querySelector<SVGPathElement>('[data-tear-highlight]')

      const tearYAt = (x: number, base: number, amplitude: number) => {
        const broad = Math.sin(x * 0.18 + 0.8) * amplitude
        const fine = Math.sin(x * 0.63 + 2.1) * amplitude * 0.42
        const tooth = ((((Math.floor(x / 3.25) * 17) % 11) - 5) / 5) * amplitude * 0.32
        const diagonal = -(x / 100) * 7.5
        return gsap.utils.clamp(4.5, 96.5, base + diagonal + broad + fine + tooth)
      }

      const applyTearProgress = (p: number) => {
        const t = gsap.utils.clamp(0, 1, p)
        const headX = t * 100
        const opening = gsap.parseEase('power1.inOut')(t)
        const baseY = gsap.utils.interpolate(90, 14.5, opening)
        const amplitude = gsap.utils.interpolate(0.9, 1.9, t)
        const sampleCount = Math.max(1, Math.ceil(headX / 3.2))
        const seam = Array.from({ length: sampleCount + 1 }, (_, i) => {
          const x = i === sampleCount ? headX : (headX * i) / sampleCount
          return { x, y: tearYAt(x, baseY, amplitude) }
        })
        const head = seam[seam.length - 1]
        const clipPoints = [
          '0% 0%',
          '100% 0%',
          '100% 100%',
          `${head.x.toFixed(3)}% 100%`,
          ...[...seam]
            .reverse()
            .map(({ x, y }) => `${x.toFixed(3)}% ${y.toFixed(3)}%`),
          '0% 0%',
        ]

        paperSheet.style.clipPath = `polygon(${clipPoints.join(',')})`
        ideaStage.style.setProperty('--tear-p', String(t))
        tearReveal.style.setProperty(
          '--reveal-top',
          `${gsap.utils.clamp(13, 94, head.y + 5.5).toFixed(2)}%`,
        )

        const seamPath = seam
          .map(({ x, y }, i) => `${i === 0 ? 'M' : 'L'} ${(x * 10).toFixed(1)} ${(y * 10).toFixed(1)}`)
          .join(' ')
        const fiberBottom = [...seam]
          .reverse()
          .map(({ x, y }, i) => {
            const depth = 1.05 + Math.sin(x * 0.51 + i) * 0.28
            return `L ${(x * 10).toFixed(1)} ${((y + depth) * 10).toFixed(1)}`
          })
          .join(' ')
        tearFiber?.setAttribute('d', `${seamPath} ${fiberBottom} Z`)
        tearHighlight?.setAttribute('d', seamPath)

        gsap.set(tearEdge, { autoAlpha: t > 0.012 && t < 0.995 ? 1 : 0 })
      }

      gsap.set(paperSheet, { y: 0, clearProps: 'transform' })
      applyTearProgress(0)

      idea.set(ideaStage, { zIndex: 6 }, TEAR_START)

      const tearProxy = { p: 0 }
      idea.to(
        tearProxy,
        {
          p: 1,
          duration: tearDur,
          ease: 'none',
          onUpdate: () => applyTearProgress(tearProxy.p),
        },
        TEAR_START,
      )

      idea.set(ideaStage, { autoAlpha: 0 }, TEAR_END)
    }, root)

    let resizeTimer: number | undefined
    const onResize = () => {
      sizeStages()
      resizeCanvas()
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 160)
    }
    window.addEventListener('resize', onResize)
    gsap.ticker.add(onFrame)

    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(resizeTimer)
      gsap.ticker.remove(onFrame)
      ctx.revert()
    }
  }, [points])

  /** Modo edición constelación: no depende del scroll; fuerza escena visible y clickeable */
  const constellationEditing = import.meta.env.DEV && (starPlaceMode || connectMode)

  useLayoutEffect(() => {
    if (!import.meta.env.DEV) return
    const ideaStage = ideaStageRef.current
    const ideaLayout = ideaLayoutRef.current
    const constSvg = constSvgRef.current
    const section = sectionRef.current
    if (!ideaStage || !ideaLayout || !constSvg || !section) return

    if (!constellationEditing) return

    gsap.set(ideaStage, { autoAlpha: 1 })
    gsap.set(ideaLayout, { autoAlpha: 1 })
    gsap.set(constSvg.querySelectorAll('[data-star]'), {
      scale: 1,
      opacity: 1,
      transformOrigin: '50% 50%',
    })
    gsap.set(constSvg.querySelectorAll('[data-edge-core]'), {
      opacity: 1,
      strokeDashoffset: 0,
    })
    gsap.set(constSvg.querySelectorAll('[data-edge-glow]'), { opacity: 0.35, strokeDashoffset: 0 })
    gsap.set(section.querySelectorAll('[data-star-handle]'), { autoAlpha: 1 })

    ideaStage.scrollIntoView({ block: 'end', behavior: 'smooth' })
  }, [constellationEditing, map.stars.length, map.edges.length])

  const sectionToPct = (clientX: number, clientY: number): SparkWaypoint | null => {
    const section = sectionRef.current
    if (!section) return null
    const r = section.getBoundingClientRect()
    return {
      x: Math.round((((clientX - r.left) / r.width) * 100) * 10) / 10,
      y: Math.round((((clientY - r.top) / r.height) * 100) * 10) / 10,
    }
  }

  const constStageToPct = (clientX: number, clientY: number) => {
    const stage = constStageRef.current
    if (!stage) return null
    const r = stage.getBoundingClientRect()
    return {
      x: Math.round((((clientX - r.left) / r.width) * 100) * 10) / 10,
      y: Math.round((((clientY - r.top) / r.height) * 100) * 10) / 10,
    }
  }

  const onSectionPointerDown = (e: React.PointerEvent) => {
    if (!import.meta.env.DEV) return
    const target = e.target as HTMLElement
    if (target.closest('[data-path-handle]')) return
    if (target.closest('[data-idea-stage]')) return

    if (placeMode) {
      const p = sectionToPct(e.clientX, e.clientY)
      if (!p) return
      setPoints((prev) => [...prev, p])
      setPlaceMode(false)
    }
  }

  const onSectionPointerMove = (e: React.PointerEvent) => {
    if (dragIndex !== null) {
      const p = sectionToPct(e.clientX, e.clientY)
      if (p) setPoints((prev) => prev.map((pt, i) => (i === dragIndex ? p : pt)))
    }
    if (starDragIndex !== null) {
      const p = constStageToPct(e.clientX, e.clientY)
      if (p) {
        setMap((prev) => ({
          ...prev,
          stars: prev.stars.map((s, i) => (i === starDragIndex ? p : s)),
        }))
      }
    }
  }

  const onSectionPointerUp = () => {
    setDragIndex(null)
    setStarDragIndex(null)
  }

  const onHandlePointerDown = (index: number, e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelected(index)
    setDragIndex(index)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onConstStagePointerDown = (e: React.PointerEvent) => {
    if (!import.meta.env.DEV) return
    e.stopPropagation()
    if ((e.target as HTMLElement).closest('[data-star-handle]')) return
    if (!starPlaceMode) return
    const p = constStageToPct(e.clientX, e.clientY)
    if (!p) return
    setMap((prev) => ({ ...prev, stars: [...prev.stars, p] }))
    setStarPlaceMode(false)
  }

  const onStarClick = (index: number, e: React.PointerEvent) => {
    e.stopPropagation()
    if (!import.meta.env.DEV) return
    if (connectMode) {
      e.preventDefault()
      if (starSelected === null) {
        setStarSelected(index)
        return
      }
      if (starSelected === index) {
        setStarSelected(null)
        return
      }
      const a = Math.min(starSelected, index)
      const b = Math.max(starSelected, index)
      setMap((prev) => {
        const exists = prev.edges.some(([x, y]) => x === a && y === b)
        const edges: Edge[] = exists
          ? prev.edges.filter(([x, y]) => !(x === a && y === b))
          : [...prev.edges, [a, b]]
        return { ...prev, edges }
      })
      setStarSelected(null)
      return
    }
    setStarSelected(index)
    setStarDragIndex(index)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  return (
    /* ACTO 1 + ACTO 2 INICIAN */
    <div ref={rootRef} className="relative">
      <section
        ref={sectionRef}
        id="deseo"
        className="relative min-h-[320vh] overflow-hidden bg-void pb-[40vh]"
        aria-label="Acto I — El deseo"
        onPointerDown={onSectionPointerDown}
        onPointerMove={onSectionPointerMove}
        onPointerUp={onSectionPointerUp}
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

        {/* La misma luz, ya en la última pantalla: mismo tamaño y mismo z que la del
            recorrido, para que salga por detrás de la cabeza igual que entró. */}
        <div
          ref={lightStageRef}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-screen"
          aria-hidden
        >
          <div
            ref={riseGlowRef}
            className="absolute h-28 w-28 rounded-full will-change-transform sm:h-36 sm:w-36"
            style={{ background: HOT_GLOW_BG, filter: 'blur(14px)' }}
          />
          <div
            ref={riseSparkRef}
            className="absolute h-2.5 w-2.5 rounded-full will-change-transform sm:h-3 sm:w-3"
            style={{ background: HOT_SPARK_BG, boxShadow: HOT_SPARK_SHADOW }}
          />
        </div>

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

        {/* Silueta y ENTRA del Acto 1. En el Acto 2 se hunden juntos, sin redibujarse. */}
        <div ref={exitWorldRef} className="pointer-events-none absolute inset-0 z-[3]">
          <div
            ref={silWrapRef}
            className="absolute left-1/2 top-[278vh] w-[min(42vw,200px)] -translate-x-1/2 sm:w-[220px]"
          >
            {/* Luz detrás: se ve a través de los ojos-ventana */}
            <div
              ref={rimRef}
              className="absolute left-1/2 top-[6%] h-[72%] w-[82%] -translate-x-1/2 rounded-[50%] bg-spark/50 blur-2xl"
              aria-hidden
            />
            <div
              ref={headAnchorRef}
              className="absolute left-1/2 top-[18%] size-2 -translate-x-1/2"
            />
            <svg viewBox="0 0 200 220" className="relative w-full" aria-hidden>
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
        </div>

          {/* ENTRA fuera de exitWorld: la silueta puede hundirse sin llevárselo */}
          <p
            ref={enterRef}
            className="pointer-events-none absolute left-1/2 top-[266vh] z-[8] -translate-x-1/2 font-display text-4xl font-extrabold tracking-[0.32em] text-spark sm:text-6xl md:text-7xl"
          >
            ENTRA
          </p>

        {/* ACTO 2–3 — última pantalla: idea → plano → rasgado */}
        <div
          ref={ideaStageRef}
          id="idea"
          data-idea-stage
          role="region"
          aria-label="Acto II–III — La idea y el plan"
      className={`absolute inset-x-0 bottom-0 z-[6] h-screen overflow-visible bg-transparent ${
            constellationEditing ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ ['--tear-y' as string]: 100 }}
        >
          {/* Vista estable del siguiente acto. Vive dentro del mismo pin para que
              el rasgado pueda revelarlo sin sacar #configurador del flujo. */}
          <div
            ref={tearRevealRef}
            className="absolute inset-0 z-0 overflow-hidden bg-void"
            aria-hidden
          >
            <div
              className="absolute inset-x-0 mx-auto max-w-6xl px-6 transition-none md:px-10"
              style={{ top: 'var(--reveal-top, 94%)' }}
            >
              <p className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase">
                Acto IV
              </p>
              <h2 className="max-w-3xl font-display text-4xl font-bold tracking-tight text-paper sm:text-5xl">
                El taller se pone a trabajar
              </h2>
              <p className="mt-4 max-w-xl text-mist">
                El plan ya está aprobado. Elige las piezas — o salta y sigue.
              </p>
              <div className="mt-8 grid h-[54vh] grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] overflow-hidden rounded-sm border border-white/10 bg-fog/30">
                <div className="relative border-r border-white/10 bg-black/25">
                  <div className="absolute inset-8 rounded-sm border border-spark/15 bg-[radial-gradient(circle_at_50%_45%,rgba(250,204,21,0.09),transparent_48%)]" />
                </div>
                <div className="space-y-4 p-6">
                  <div className="h-7 w-28 rounded-sm bg-white/10" />
                  <div className="h-20 rounded-sm border border-white/10 bg-white/[0.025]" />
                  <div className="h-20 rounded-sm border border-white/10 bg-white/[0.025]" />
                  <div className="h-20 rounded-sm border border-white/10 bg-white/[0.025]" />
                </div>
              </div>
            </div>
          </div>

          <div
            ref={paperSheetRef}
            className="absolute inset-0 z-[1] will-change-[clip-path]"
            style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          >
            <div
              ref={blueprintBgRef}
              className="absolute inset-0"
              style={{
                backgroundColor: BLUEPRINT_BG,
                backgroundImage: BLUEPRINT_GRID,
              }}
              aria-hidden
            />

            <div ref={splitLayerRef} className="pointer-events-none absolute inset-0 z-[1]">
              {map.stars.map((_, i) => (
                <div
                  key={`shot-${i}`}
                  data-shot
                  className="absolute h-2 w-2 rounded-full bg-spark sm:h-2.5 sm:w-2.5"
                  style={{ boxShadow: '0 0 10px 3px rgba(250,204,21,0.85)' }}
                />
              ))}
            </div>

            <div
              ref={ideaLayoutRef}
              className="absolute inset-0 z-[2] mx-auto grid max-w-6xl items-center gap-8 px-6 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16"
            >
              <div
                ref={constStageRef}
                className={`relative aspect-[4/5] w-full max-h-[70vh] justify-self-start self-center ${
                  constellationEditing ? 'pointer-events-auto cursor-crosshair ring-1 ring-spark/40' : ''
                }`}
                onPointerDown={onConstStagePointerDown}
              >
                {import.meta.env.DEV && overlaySrc && (
                  <img
                    src={overlaySrc}
                    alt=""
                    className="pointer-events-none absolute inset-0 h-full w-full object-contain"
                    style={{ opacity: overlayOpacity / 100 }}
                  />
                )}
                <svg
                  ref={constSvgRef}
                  viewBox="0 0 100 100"
                  className="absolute inset-0 h-full w-full overflow-visible"
                  aria-hidden
                >
                  <defs>
                    <filter
                      id={`${eyeMaskId}-edgeglow`}
                      x="-80%"
                      y="-80%"
                      width="260%"
                      height="260%"
                    >
                      <feGaussianBlur in="SourceGraphic" stdDeviation="0.32" />
                    </filter>
                  </defs>
                  {map.edges.map(([a, b], i) => {
                    const sa = map.stars[a]
                    const sb = map.stars[b]
                    if (!sa || !sb) return null
                    const shared = {
                      x1: sa.x,
                      y1: sa.y,
                      x2: sb.x,
                      y2: sb.y,
                      stroke: '#facc15',
                      strokeLinecap: 'round' as const,
                    }
                    return (
                      <g key={`edge-${i}`}>
                        <line
                          data-edge-glow
                          {...shared}
                          strokeWidth="0.62"
                          opacity={0.38}
                          filter={`url(#${eyeMaskId}-edgeglow)`}
                        />
                        <line
                          data-edge-core
                          {...shared}
                          strokeWidth="0.28"
                          opacity={1}
                        />
                      </g>
                    )
                  })}
                  {map.stars.map((s, i) => (
                    <circle
                      key={`star-${i}`}
                      data-star
                      cx={s.x}
                      cy={s.y}
                      r="0.85"
                      fill="#fffef8"
                      style={{ filter: 'drop-shadow(0 0 1.2px rgba(250,204,21,0.9))' }}
                    />
                  ))}
                </svg>
                {import.meta.env.DEV &&
                  map.stars.map((s, i) => (
                    <button
                      key={`h-${i}`}
                      type="button"
                      data-star-handle
                      aria-label={`Estrella ${i + 1}`}
                      onPointerDown={(e) => onStarClick(i, e)}
                      className={`pointer-events-auto absolute z-20 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-void shadow ${
                        starSelected === i ? 'scale-125 bg-white' : 'bg-spark'
                      }`}
                      style={{ left: `${s.x}%`, top: `${s.y}%` }}
                    />
                  ))}
              </div>

              <div className="pointer-events-auto relative min-h-[20rem] flex items-center">
                <div ref={copyRef} className="relative w-full" data-copy>
                  <p
                    data-idea-kicker
                    className="mb-3 text-xs font-medium tracking-[0.3em] text-spark uppercase"
                  >
                    {IDEA_COPY.kicker}
                  </p>
                  <h2
                    data-idea-title
                    className="font-display text-3xl font-bold tracking-tight text-paper text-balance sm:text-4xl md:text-5xl"
                  >
                    {IDEA_COPY.title}
                  </h2>
                  <ul className="mt-10 space-y-3">
                    {IDEA_COPY.items.map((item) => (
                      <li
                        key={item}
                        data-idea-item
                        className="flex items-baseline gap-3 will-change-transform"
                      >
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-spark" aria-hidden />
                        <span className="font-display text-xl text-paper sm:text-2xl">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div ref={planCopyRef} className="pointer-events-none absolute inset-0 flex items-center">
                  <div className="relative w-full">
                    <div data-plan-head>
                      <p className="mb-3 text-xs font-medium tracking-[0.3em] uppercase text-white/65">
                        {PLAN_COPY.kicker}
                      </p>
                      <h2 className="font-display text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl md:text-5xl">
                        {PLAN_COPY.title}
                      </h2>
                      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                        {PLAN_COPY.lead}
                      </p>
                    </div>
                    <ul className="mt-8 space-y-3 border-t border-white/15 pt-6">
                      {PLAN_COPY.items.map((item) => (
                        <li
                          key={item.title}
                          data-plan-item
                          className="grid grid-cols-[minmax(0,9.5rem)_1fr] gap-3 sm:grid-cols-[11rem_1fr]"
                        >
                          <span className="font-display text-sm font-semibold tracking-wide text-white uppercase sm:text-base">
                            {item.title}
                          </span>
                          <span className="text-sm text-white/70">{item.body}</span>
                        </li>
                      ))}
                    </ul>

                    <div
                      ref={stampRef}
                      className="pointer-events-none mt-10 flex justify-end"
                      aria-hidden
                    >
                      <div
                        className="rounded-sm border-[3px] px-3 py-2 font-display text-2xl font-extrabold tracking-[0.18em] uppercase sm:text-3xl"
                        style={{
                          color: STAMP_LIME,
                          borderColor: STAMP_LIME,
                          boxShadow: `inset 0 0 0 2px ${STAMP_LIME}`,
                          opacity: 0.92,
                        }}
                      >
                        APROBADO
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Corte irregular, fibra y solapa que acompañan el frente de izquierda a derecha */}
            <div
              ref={tearEdgeRef}
              className="pointer-events-none absolute inset-0 z-[10] overflow-hidden"
              aria-hidden
              style={{
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.5))',
              }}
            >
              <svg
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                className="block h-full w-full"
              >
                <defs>
                  <filter
                    id={`${eyeMaskId}-paper-rough`}
                    x="-8%"
                    y="-20%"
                    width="116%"
                    height="140%"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.018 0.11"
                      numOctaves="2"
                      seed="17"
                      result="noise"
                    />
                    <feDisplacementMap
                      in="SourceGraphic"
                      in2="noise"
                      scale="7"
                      xChannelSelector="R"
                      yChannelSelector="B"
                    />
                  </filter>
                </defs>
                <path
                  data-tear-fiber
                  fill="#eeeae1"
                  filter={`url(#${eyeMaskId}-paper-rough)`}
                />
                <path
                  data-tear-highlight
                  fill="none"
                  stroke="#fffef8"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.78"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          </div>

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

      {import.meta.env.DEV && (
        <ConstellationEditor
          map={map}
          onChange={setMap}
          overlaySrc={overlaySrc}
          overlayOpacity={overlayOpacity}
          onOverlaySrc={(src) => {
            setOverlaySrc(src)
            setOverlayOk(Boolean(src))
          }}
          onOverlayOpacity={setOverlayOpacity}
          placeMode={starPlaceMode}
          onPlaceModeChange={setStarPlaceMode}
          connectMode={connectMode}
          onConnectModeChange={setConnectMode}
          selected={starSelected}
          onSelect={setStarSelected}
        />
      )}
    </div>
    /* ACTO 1 + ACTO 2 + ACTO 3 TERMINAN */
  )
}
