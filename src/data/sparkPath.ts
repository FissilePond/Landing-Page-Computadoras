export type SparkWaypoint = { x: number; y: number }

export const SPARK_PATH_STORAGE_KEY = 'magnumopus.act1.sparkPath.v3'

/** Fallback si no hay localStorage / medidas aún ( % del acto ) */
export const DEFAULT_SPARK_PATH: SparkWaypoint[] = [
  { x: 8, y: 4 },
  { x: 28, y: 4 },
  { x: 12, y: 14 },
  { x: 42, y: 14 },
  { x: 58, y: 26 },
  { x: 88, y: 26 },
  { x: 18, y: 38 },
  { x: 40, y: 38 },
  { x: 60, y: 50 },
  { x: 86, y: 50 },
  { x: 28, y: 62 },
  { x: 48, y: 66 },
  { x: 42, y: 74 },
  { x: 58, y: 74 },
  { x: 50, y: 82 },
  { x: 50, y: 90 },
]

export function waypointsToPathD(points: SparkWaypoint[]): string {
  if (points.length === 0) return 'M 50 50'
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const midX = (prev.x + curr.x) / 2
    const midY = (prev.y + curr.y) / 2
    d += ` Q ${prev.x} ${prev.y} ${midX} ${midY}`
    d += ` T ${curr.x} ${curr.y}`
  }
  return d
}

/** Catmull-Rom suave → cubics (mejor para el destello) */
export function waypointsToSmoothPathD(points: SparkWaypoint[]): string {
  if (points.length === 0) return 'M 50 50'
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  const pts = points
  let d = `M ${pts[0].x} ${pts[0].y}`

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? i : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2

    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return d
}

export function loadSparkPath(): SparkWaypoint[] | null {
  try {
    const raw = localStorage.getItem(SPARK_PATH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SparkWaypoint[]
    if (!Array.isArray(parsed) || parsed.length < 2) return null
    if (!parsed.every((p) => typeof p.x === 'number' && typeof p.y === 'number')) return null
    return parsed
  } catch {
    return null
  }
}

export function saveSparkPath(points: SparkWaypoint[]) {
  localStorage.setItem(SPARK_PATH_STORAGE_KEY, JSON.stringify(points))
}

export function clearSparkPath() {
  localStorage.removeItem(SPARK_PATH_STORAGE_KEY)
}
