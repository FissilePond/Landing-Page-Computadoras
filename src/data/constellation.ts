export type Star = { x: number; y: number }
export type Edge = [number, number]

export type ConstellationMap = {
  stars: Star[]
  edges: Edge[]
  /** Trayectorias (cadenas de índices). Cada una ≤ 6 puntos. */
  trajectories?: number[][]
}

export const CONSTELLATION_STORAGE_KEY = 'magnumopus.act2.constellation.v3'

/** Constelación de la PC (puntos del usuario + trayectorias en capas) */
export const DEFAULT_CONSTELLATION: ConstellationMap = {
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
    [0, 1, 2, 3, 4, 5],
    [39, 11, 22, 23, 7, 8],
    [8, 6, 39],
    [34, 9, 25, 27, 28, 10],
    [10, 35, 14, 15, 34],
    [16, 32, 36, 24, 26, 29],
    [29, 38, 37, 16],
    [33, 21, 20, 17, 13],
    [18, 31, 30, 19, 12],
  ],
  edges: [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [0, 5],
    [11, 39],
    [11, 22],
    [22, 23],
    [7, 23],
    [7, 8],
    [6, 8],
    [6, 39],
    [9, 34],
    [9, 25],
    [25, 27],
    [27, 28],
    [10, 28],
    [10, 35],
    [14, 35],
    [14, 15],
    [15, 34],
    [16, 32],
    [32, 36],
    [24, 36],
    [24, 26],
    [26, 29],
    [29, 38],
    [37, 38],
    [16, 37],
    [21, 33],
    [20, 21],
    [17, 20],
    [13, 17],
    [13, 33],
    [18, 31],
    [30, 31],
    [19, 30],
    [12, 19],
    [12, 18],
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
