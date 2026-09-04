import fs from 'node:fs'

/** Máx. puntos por trayectoria (si hay más, se parte en varias). */
const MAX_POINTS = 6

const stars = [
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
]

const n = stars.length
const dist = (i, j) => Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y)

const cx = stars.reduce((s, p) => s + p.x, 0) / n
const cy = stars.reduce((s, p) => s + p.y, 0) / n
const angle = (i) => Math.atan2(stars[i].y - cy, stars[i].x - cx)

/** Convex hull (Andrew's monotone chain), índices. */
function convexHull(indices) {
  if (indices.length <= 2) return [...indices]
  const pts = [...indices].sort((a, b) => {
    const dx = stars[a].x - stars[b].x
    if (dx !== 0) return dx
    return stars[a].y - stars[b].y
  })
  const cross = (o, a, b) =>
    (stars[a].x - stars[o].x) * (stars[b].y - stars[o].y) -
    (stars[a].y - stars[o].y) * (stars[b].x - stars[o].x)

  const lower = []
  for (const i of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], i) <= 0) {
      lower.pop()
    }
    lower.push(i)
  }
  const upper = []
  for (let k = pts.length - 1; k >= 0; k--) {
    const i = pts[k]
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], i) <= 0) {
      upper.pop()
    }
    upper.push(i)
  }
  lower.pop()
  upper.pop()
  return lower.concat(upper)
}

/**
 * Parte una secuencia en trayectorias de ≤ MAX_POINTS.
 * Anillos cerrados ≤ MAX: una trayectoria (se cierra al generar edges).
 * Anillos más largos: arcos abiertos con solape 1, cubriendo todo el perímetro.
 */
function splitPath(path, closed = false) {
  if (path.length === 0) return []
  if (path.length === 1) return [{ path, closed: false }]
  if (closed && path.length > 2) {
    if (path.length <= MAX_POINTS) return [{ path: [...path], closed: true }]
    const ring = [...path]
    const out = []
    let start = 0
    while (start < ring.length) {
      const chunk = []
      for (let k = 0; k < MAX_POINTS; k++) {
        chunk.push(ring[(start + k) % ring.length])
      }
      out.push({ path: chunk, closed: false })
      const advance = MAX_POINTS - 1
      start += advance
      // Último arco: si casi cerramos, paramos sin duplicar casi todo el anillo
      if (start + 1 >= ring.length) break
      // Si el siguiente arco cabría hasta el inicio+1, hacemos un arco final corto
      const remaining = ring.length - start
      if (remaining < 2) break
      if (remaining <= MAX_POINTS - 1) {
        const last = []
        for (let k = 0; k <= remaining; k++) {
          last.push(ring[(start + k) % ring.length])
        }
        out.push({ path: last, closed: false })
        break
      }
    }
    return out
  }
  if (path.length <= MAX_POINTS) return [{ path, closed: false }]
  const out = []
  let i = 0
  while (i < path.length) {
    const end = Math.min(i + MAX_POINTS, path.length)
    out.push({ path: path.slice(i, end), closed: false })
    if (end >= path.length) break
    i = end - 1
  }
  return out
}

function pathToEdges(path, closed = false) {
  const edges = []
  for (let i = 0; i < path.length - 1; i++) {
    const a = Math.min(path[i], path[i + 1])
    const b = Math.max(path[i], path[i + 1])
    edges.push([a, b])
  }
  if (closed && path.length >= 3) {
    const a = Math.min(path[0], path[path.length - 1])
    const b = Math.max(path[0], path[path.length - 1])
    edges.push([a, b])
  }
  return edges
}

/** Cadena greedy por vecinos cercanos dentro de un conjunto. */
function chainNearest(indices) {
  if (indices.length <= 1) return indices.length ? [indices] : []
  const remaining = new Set(indices)
  const chains = []

  while (remaining.size) {
    // Empieza en el más lejano del centro (o el primero)
    let start = [...remaining][0]
    let bestD = -1
    for (const i of remaining) {
      const d = Math.hypot(stars[i].x - cx, stars[i].y - cy)
      if (d > bestD) {
        bestD = d
        start = i
      }
    }
    const chain = [start]
    remaining.delete(start)
    while (remaining.size) {
      const last = chain[chain.length - 1]
      let next = null
      let nextD = Infinity
      for (const j of remaining) {
        const d = dist(last, j)
        if (d < nextD) {
          nextD = d
          next = j
        }
      }
      // Si el siguiente está demasiado lejos, nueva trayectoria (grupo aparte)
      if (next == null || nextD > 28) break
      chain.push(next)
      remaining.delete(next)
    }
    chains.push(chain)
  }
  return chains
}

// —— Capas tipo cebolla: hull exterior → interior → … ——
const unused = new Set([...Array(n).keys()])
const layerPaths = []

while (unused.size >= 3) {
  const hull = convexHull([...unused])
  if (hull.length < 3) break
  // Orden angular para dibujar el anillo limpio
  const ordered = [...hull].sort((a, b) => angle(a) - angle(b))
  layerPaths.push({ path: ordered, closed: true })
  for (const i of hull) unused.delete(i)
  // Evitar hulls degenerados infinitos
  if (hull.length === unused.size + hull.length) break
}

// Puntos restantes: trayectorias internas / aisladas
const leftovers = [...unused]
const leftoverChains = chainNearest(leftovers)
for (const chain of leftoverChains) {
  layerPaths.push({ path: chain, closed: false })
}

// Partir cada trayectoria si > MAX_POINTS
const trajectories = []
const trajMeta = []
for (const { path, closed } of layerPaths) {
  for (const chunk of splitPath(path, closed)) {
    trajectories.push(chunk.path)
    trajMeta.push(chunk)
  }
}

const edgeSet = new Set()
for (const { path, closed } of trajMeta) {
  for (const [a, b] of pathToEdges(path, closed)) {
    edgeSet.add(`${a},${b}`)
  }
}

const edges = [...edgeSet].map((s) => s.split(',').map(Number))

const fmtStar = (s) => `    { x: ${s.x}, y: ${s.y} }`
const fmtEdge = (e) => `    [${e[0]}, ${e[1]}]`
const fmtTraj = (t) => `    [${t.join(', ')}]`

const out = `export type Star = { x: number; y: number }
export type Edge = [number, number]

export type ConstellationMap = {
  stars: Star[]
  edges: Edge[]
  /** Trayectorias (cadenas de índices). Cada una ≤ ${MAX_POINTS} puntos. */
  trajectories?: number[][]
}

export const CONSTELLATION_STORAGE_KEY = 'magnumopus.act2.constellation.v3'

/** Constelación de la PC (puntos del usuario + trayectorias en capas) */
export const DEFAULT_CONSTELLATION: ConstellationMap = {
  stars: [
${stars.map(fmtStar).join(',\n')},
  ],
  trajectories: [
${trajectories.map(fmtTraj).join(',\n')},
  ],
  edges: [
${edges.map(fmtEdge).join(',\n')},
  ],
}

export function loadConstellation(): ConstellationMap | null {
  try {
    const raw = localStorage.getItem(CONSTELLATION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ConstellationMap
    if (!Array.isArray(parsed.stars) || !Array.isArray(parsed.edges)) return null
    return parsed
  } catch {
    return null
  }
}

export function saveConstellation(map: ConstellationMap) {
  localStorage.setItem(CONSTELLATION_STORAGE_KEY, JSON.stringify(map))
}

export function clearConstellation() {
  localStorage.removeItem(CONSTELLATION_STORAGE_KEY)
}
`

fs.writeFileSync('src/data/constellation.ts', out)
console.log(
  'stars',
  stars.length,
  'trajectories',
  trajectories.length,
  'sizes',
  trajectories.map((t) => t.length).join(','),
  'edges',
  edges.length,
)
