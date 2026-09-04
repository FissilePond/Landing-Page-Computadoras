export type Star = { x: number; y: number }
export type Edge = [number, number]

export type ConstellationMap = {
  stars: Star[]
  edges: Edge[]
}

export const CONSTELLATION_STORAGE_KEY = 'magnumopus.act2.constellation.v1'

/** Placeholder de torre hasta que subas la foto / line art y marques puntos */
export const DEFAULT_CONSTELLATION: ConstellationMap = {
  stars: [
    { x: 28, y: 10 },
    { x: 72, y: 10 },
    { x: 78, y: 18 },
    { x: 22, y: 18 },
    { x: 22, y: 78 },
    { x: 78, y: 78 },
    { x: 72, y: 88 },
    { x: 28, y: 88 },
    { x: 32, y: 28 },
    { x: 68, y: 28 },
    { x: 68, y: 48 },
    { x: 32, y: 48 },
    { x: 38, y: 58 },
    { x: 50, y: 58 },
    { x: 50, y: 70 },
    { x: 38, y: 70 },
    { x: 58, y: 34 },
    { x: 64, y: 42 },
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [4, 3],
    [3, 0],
    [3, 2],
    [8, 9],
    [9, 10],
    [10, 11],
    [11, 8],
    [12, 13],
    [13, 14],
    [14, 15],
    [15, 12],
    [16, 17],
    [9, 16],
    [10, 17],
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
