import { useEffect, useRef, useState } from 'react'
import {
  clearConstellation,
  saveConstellation,
  type ConstellationMap,
  type Edge,
} from '../../data/constellation'

type Props = {
  map: ConstellationMap
  onChange: (map: ConstellationMap) => void
  overlaySrc: string | null
  overlayOpacity: number
  onOverlaySrc: (src: string | null) => void
  onOverlayOpacity: (n: number) => void
  placeMode: boolean
  onPlaceModeChange: (on: boolean) => void
  connectMode: boolean
  onConnectModeChange: (on: boolean) => void
  selected: number | null
  onSelect: (i: number | null) => void
}

export function ConstellationEditor({
  map,
  onChange,
  overlaySrc,
  overlayOpacity,
  onOverlaySrc,
  onOverlayOpacity,
  placeMode,
  onPlaceModeChange,
  connectMode,
  onConnectModeChange,
  selected,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const historyRef = useRef<ConstellationMap[]>([])

  const pushHistory = (snapshot: ConstellationMap) => {
    historyRef.current = [
      ...historyRef.current.slice(-39),
      {
        stars: snapshot.stars.map((s) => ({ ...s })),
        edges: snapshot.edges.map((e) => [e[0], e[1]] as Edge),
      },
    ]
  }

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  // (auto-plasmar desactivado: las estrellas/trayectorias ya viven en constellation.ts)

  if (!import.meta.env.DEV) return null

  const apply = (next: ConstellationMap, note?: string) => {
    pushHistory(map)
    onChange(next)
    if (note) setToast(note)
  }

  const undo = () => {
    const prev = historyRef.current.pop()
    if (!prev) {
      setToast('Nada que deshacer')
      return
    }
    onChange(prev)
    onSelect(null)
    setToast('Deshecho')
  }

  const persist = () => {
    saveConstellation(map)
    setToast('Guardado en localStorage')
  }

  const clearEdges = () => {
    if (map.edges.length === 0) {
      setToast('No hay líneas')
      return
    }
    apply({ stars: map.stars, edges: [] }, 'Líneas eliminadas')
    saveConstellation({ stars: map.stars, edges: [] })
  }

  const saveToProject = async () => {
    const payload = { stars: map.stars, edges: map.edges }
    try {
      const res = await fetch('/__dev/save-constellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as { ok: boolean; error?: string; stars?: number; edges?: number }
      if (!res.ok || !data.ok) throw new Error(data.error ?? 'falló')
      saveConstellation(payload)
      clearConstellation()
      setToast(`Fijado en código (${data.stars}★ ${data.edges ?? map.edges.length} líneas)`)
    } catch (err) {
      setToast(`No se pudo fijar: ${String(err)}`)
    }
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify({ stars: map.stars, edges: map.edges }, null, 2))
    setToast('JSON copiado')
  }

  const reset = () => {
    apply({ stars: [], edges: [] }, 'Mapa vacío')
    clearConstellation()
    onSelect(null)
  }

  const removeStar = (index: number) => {
    const stars = map.stars.filter((_, i) => i !== index)
    const edges: Edge[] = map.edges
      .filter(([a, b]) => a !== index && b !== index)
      .map(([a, b]) => [a > index ? a - 1 : a, b > index ? b - 1 : b] as Edge)
    apply({ stars, edges })
    onSelect(null)
  }

  const removeEdge = (index: number) => {
    apply({ ...map, edges: map.edges.filter((_, i) => i !== index) })
  }

  return (
    <div className="fixed bottom-4 left-4 z-[100] w-[min(92vw,340px)] font-body text-xs text-paper">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 rounded-full border border-spark/40 bg-void/90 px-3 py-1.5 shadow-lg backdrop-blur"
      >
        {open ? 'Cerrar constelación' : 'Constelación (dev)'}
      </button>

      {open && (
        <div className="max-h-[72vh] overflow-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur">
          <p className="mb-2 text-[10px] tracking-[0.2em] text-spark uppercase">Acto II · estrellas</p>
          <p className="mb-3 text-[11px] leading-relaxed text-mist">
            Estrellas OK → conecta con cuidado. Usa <strong className="text-paper">Deshacer</strong> o{' '}
            <strong className="text-paper">Quitar líneas</strong> si falla una unión.
          </p>
          {(placeMode || connectMode) && (
            <p className="mb-3 rounded-lg border border-spark/30 bg-spark/10 px-2 py-1.5 text-[11px] text-spark">
              {placeMode
                ? 'Click en la PC para colocar una estrella.'
                : selected === null
                  ? 'Conectar: click en la 1ª estrella.'
                  : `Conectar: 1ª = ★${selected + 1}. Click en la 2ª (o otra vez la misma para cancelar).`}
            </p>
          )}

          <label className="mb-3 block text-mist">
            Overlay
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-[11px]"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                onOverlaySrc(URL.createObjectURL(file))
              }}
            />
          </label>
          <label className="mb-3 flex items-center gap-2 text-mist">
            Opacidad
            <input
              type="range"
              min={0}
              max={80}
              value={overlayOpacity}
              onChange={(e) => onOverlayOpacity(Number(e.target.value))}
              className="flex-1"
            />
          </label>
          {overlaySrc && (
            <button
              type="button"
              className="mb-3 rounded-full border border-white/15 px-2.5 py-1"
              onClick={() => onOverlaySrc(null)}
            >
              Quitar overlay
            </button>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                onPlaceModeChange(!placeMode)
                if (!placeMode) onConnectModeChange(false)
              }}
              className={`rounded-full px-2.5 py-1 ${
                placeMode ? 'bg-spark text-void' : 'border border-white/15'
              }`}
            >
              {placeMode ? 'Colocando…' : 'Agregar estrella'}
            </button>
            <button
              type="button"
              onClick={() => {
                onConnectModeChange(!connectMode)
                if (!connectMode) {
                  onPlaceModeChange(false)
                  onSelect(null)
                }
              }}
              className={`rounded-full px-2.5 py-1 ${
                connectMode ? 'bg-spark text-void' : 'border border-white/15'
              }`}
            >
              {connectMode ? 'Conectando…' : 'Conectar'}
            </button>
            <button
              type="button"
              onClick={undo}
              className="rounded-full border border-white/15 px-2.5 py-1"
            >
              Deshacer
            </button>
            <button
              type="button"
              onClick={clearEdges}
              className="rounded-full border border-white/15 px-2.5 py-1"
            >
              Quitar líneas
            </button>
            <button
              type="button"
              onClick={persist}
              className="rounded-full border border-spark/50 px-2.5 py-1 text-spark"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={saveToProject}
              className="rounded-full border border-spark/50 bg-spark/15 px-2.5 py-1 text-spark"
            >
              Fijar estrellas en código
            </button>
            <button
              type="button"
              onClick={copyJson}
              className="rounded-full border border-white/15 px-2.5 py-1"
            >
              Copiar JSON
            </button>
            <button type="button" onClick={reset} className="rounded-full border border-white/15 px-2.5 py-1">
              Vaciar
            </button>
          </div>

          <p className="mb-1 text-mist">
            {map.stars.length} estrellas · {map.edges.length} líneas
            {selected !== null ? ` · sel. ★${selected + 1}` : ''}
          </p>
          <ul className="mb-2 max-h-28 space-y-1 overflow-auto">
            {map.edges.map((e, i) => (
              <li key={`e-${i}`} className="flex justify-between text-mist">
                <span>
                  {e[0] + 1} — {e[1] + 1}
                </span>
                <button type="button" onClick={() => removeEdge(i)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          <ul className="max-h-24 space-y-1 overflow-auto">
            {map.stars.map((_, i) => (
              <li key={`s-${i}`} className="flex justify-between text-mist">
                <button type="button" onClick={() => onSelect(i)}>
                  ★ {i + 1}
                </button>
                <button type="button" onClick={() => removeStar(i)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
          {toast && <p className="mt-2 text-spark">{toast}</p>}
        </div>
      )}
    </div>
  )
}
