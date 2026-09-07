export type Star = { x: number; y: number }
export type Edge = [number, number]

/** Un recorrido: puntos en orden + cuánto tarda en dibujarse (unidades de la timeline pineada). */
export type Trajectory = {
  points: number[]
  /** Duración del dibujo completo del trayecto (todos arrancan a la vez). */
  duration: number
  /** Si true, une el último punto con el primero. */
  closed?: boolean
}

export type ConstellationMap = {
  stars: Star[]
  trajectories: Trajectory[]
  /** Derivado de trayectorias (pares consecutivos). */
  edges: Edge[]
}

export const DEFAULT_TRAJ_DURATION = 0.28

export function edgesFromTrajectories(trajectories: Trajectory[]): Edge[] {
  const seen = new Set<string>()
  const edges: Edge[] = []
  for (const t of trajectories) {
    const pts = t.points
    if (pts.length < 2) continue
    const pairs: [number, number][] = []
    for (let i = 0; i < pts.length - 1; i++) pairs.push([pts[i], pts[i + 1]])
    if (t.closed && pts.length >= 3) pairs.push([pts[pts.length - 1], pts[0]])
    for (const [a0, b0] of pairs) {
      if (a0 === b0) continue
      const a = Math.min(a0, b0)
      const b = Math.max(a0, b0)
      const key = `${a},${b}`
      if (seen.has(key)) continue
      seen.add(key)
      edges.push([a, b])
    }
  }
  return edges
}

/** Segmentos dibujables con índice de trayecto / segmento (para animar en paralelo). */
export type TrajSegment = {
  trajIndex: number
  segIndex: number
  segCount: number
  duration: number
  a: number
  b: number
}

export function segmentsFromTrajectories(trajectories: Trajectory[]): TrajSegment[] {
  const outSegs: TrajSegment[] = []
  trajectories.forEach((t, trajIndex) => {
    const pts = t.points
    if (pts.length < 2) return
    const pairs: [number, number][] = []
    for (let i = 0; i < pts.length - 1; i++) pairs.push([pts[i], pts[i + 1]])
    if (t.closed && pts.length >= 3) pairs.push([pts[pts.length - 1], pts[0]])
    const valid = pairs.filter(([a, b]) => a !== b)
    const segCount = valid.length
    const duration = Math.max(0.04, t.duration || DEFAULT_TRAJ_DURATION)
    valid.forEach(([a, b], segIndex) => {
      outSegs.push({ trajIndex, segIndex, segCount, duration, a, b })
    })
  })
  return outSegs
}

function asTrajectory(raw: unknown): Trajectory | null {
  if (Array.isArray(raw) && raw.every((n) => typeof n === 'number')) {
    return { points: raw as number[], duration: DEFAULT_TRAJ_DURATION }
  }
  if (raw && typeof raw === 'object' && Array.isArray((raw as Trajectory).points)) {
    const t = raw as Trajectory
    return {
      points: t.points.filter((n) => typeof n === 'number'),
      duration: typeof t.duration === 'number' && t.duration > 0 ? t.duration : DEFAULT_TRAJ_DURATION,
      closed: Boolean(t.closed),
    }
  }
  return null
}

export function normalizeConstellation(
  raw: Partial<ConstellationMap> | null | undefined,
): ConstellationMap {
  const stars = Array.isArray(raw?.stars) ? raw!.stars.map((s) => ({ x: s.x, y: s.y })) : []
  const trajectories = (Array.isArray(raw?.trajectories) ? raw!.trajectories : [])
    .map(asTrajectory)
    .filter((t): t is Trajectory => Boolean(t && t.points.length > 0))
  const edges =
    trajectories.length > 0
      ? edgesFromTrajectories(trajectories)
      : Array.isArray(raw?.edges)
        ? (raw!.edges as Edge[])
        : []
  return { stars, trajectories, edges }
}

/** Constelación fijada (puntos + trayectos del Acto 2) */
export const DEFAULT_CONSTELLATION: ConstellationMap = normalizeConstellation({
  stars: [
    { x: 18, y: 17.5 },
    { x: 54.5, y: 2.5 },
    { x: 82.8, y: 13 },
    { x: 82, y: 84 },
    { x: 55.5, y: 99.1 },
    { x: 19.9, y: 76.8 },
    { x: 19.6, y: 63.6 },
    { x: 81.4, y: 69.9 },
    { x: 55.5, y: 79.3 },
    { x: 50.1, y: 17.3 },
    { x: 49.9, y: 69.7 },
    { x: 55.1, y: 9.7 },
    { x: 46.9, y: 49.2 },
    { x: 48, y: 57.1 },
    { x: 26.4, y: 51.5 },
    { x: 25.7, y: 45.2 },
    { x: 36.2, y: 44.3 },
    { x: 50.9, y: 47.2 },
    { x: 44.8, y: 42.7 },
    { x: 49, y: 43.4 },
    { x: 49.2, y: 25 },
    { x: 45.3, y: 25.6 },
    { x: 67.1, y: 20.9 },
    { x: 71.1, y: 31.5 },
    { x: 64.2, y: 43.6 },
    { x: 57.6, y: 30.3 },
    { x: 64.2, y: 46.1 },
    { x: 70.7, y: 56.4 },
    { x: 64.2, y: 68.1 },
    { x: 57.2, y: 56.6 },
    { x: 43.8, y: 30.3 },
    { x: 43.6, y: 37.8 },
    { x: 38.5, y: 30.8 },
    { x: 37.7, y: 37.8 },
    { x: 35.8, y: 25 },
    { x: 36.4, y: 60.2 },
    { x: 49.9, y: 21.6 },
    { x: 36.7, y: 54.2 },
    { x: 49.2, y: 64.5 },
    { x: 22.2, y: 24.1 },
  ],
  trajectories: [
    { points: [0, 1, 2, 7, 3, 4, 5, 6], duration: 0.28, closed: true },
    { points: [6, 8, 7], duration: 0.28 },
    { points: [8, 11, 1], duration: 0.28 },
    { points: [23, 22, 25, 24, 23], duration: 0.28 },
    { points: [15, 14, 37, 13, 12, 16, 15], duration: 0.28 },
    { points: [8, 10, 38, 17, 36, 9, 11], duration: 0.28 },
    { points: [32, 33, 31, 30, 32], duration: 0.28 },
    { points: [26, 29, 28, 27, 26], duration: 0.28 },
    { points: [39, 11, 8], duration: 0.28 },
    { points: [34, 39, 11, 9, 36, 34], duration: 0.28 },
    { points: [21, 18, 19, 20, 21], duration: 0.28 },
    { points: [6, 35, 38], duration: 0.28 },
  ],
})
