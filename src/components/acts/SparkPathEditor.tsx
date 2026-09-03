import { useEffect, useState } from 'react'
import {
  clearSparkPath,
  saveSparkPath,
  type SparkWaypoint,
} from '../../data/sparkPath'

type Props = {
  points: SparkWaypoint[]
  onChange: (points: SparkWaypoint[]) => void
  onRebuildFromText: () => void
  placeMode: boolean
  onPlaceModeChange: (on: boolean) => void
  selected: number | null
  onSelect: (index: number | null) => void
}

export function SparkPathEditor({
  points,
  onChange,
  onRebuildFromText,
  placeMode,
  onPlaceModeChange,
  selected,
  onSelect,
}: Props) {
  const [open, setOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 1800)
    return () => window.clearTimeout(t)
  }, [toast])

  if (!import.meta.env.DEV) return null

  const updatePoint = (index: number, axis: 'x' | 'y', value: number) => {
    const next = points.map((p, i) => (i === index ? { ...p, [axis]: value } : p))
    onChange(next)
  }

  const removePoint = (index: number) => {
    onChange(points.filter((_, i) => i !== index))
    onSelect(null)
  }

  const persist = () => {
    saveSparkPath(points)
    setToast('Guardado en localStorage')
  }

  const resetStorage = () => {
    clearSparkPath()
    onRebuildFromText()
    setToast('localStorage limpio · path desde textos')
  }

  const copyJson = async () => {
    const json = JSON.stringify(points, null, 2)
    await navigator.clipboard.writeText(json)
    setToast('JSON copiado — cuando digas “ya”, lo pegamos en código')
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-[min(92vw,320px)] font-body text-xs text-paper">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-2 rounded-full border border-spark/40 bg-void/90 px-3 py-1.5 shadow-lg backdrop-blur"
      >
        {open ? 'Cerrar path editor' : 'Path editor (dev)'}
      </button>

      {open && (
        <div className="max-h-[70vh] overflow-auto rounded-2xl border border-white/10 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur">
          <p className="mb-2 text-[10px] tracking-[0.2em] text-spark uppercase">
            Acto I · trayectoria
          </p>
          <p className="mb-3 text-[11px] leading-relaxed text-mist">
            Click en el acto para agregar punto · arrastra handles · Guardar usa
            localStorage hasta que digas “ya” y lo fijamos en código.
          </p>

          <div className="mb-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onPlaceModeChange(!placeMode)}
              className={`rounded-full px-2.5 py-1 ${
                placeMode ? 'bg-spark text-void' : 'border border-white/15'
              }`}
            >
              {placeMode ? 'Colocando…' : 'Agregar punto'}
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
              onClick={copyJson}
              className="rounded-full border border-white/15 px-2.5 py-1"
            >
              Copiar JSON
            </button>
            <button
              type="button"
              onClick={onRebuildFromText}
              className="rounded-full border border-white/15 px-2.5 py-1"
            >
              Desde textos
            </button>
            <button
              type="button"
              onClick={resetStorage}
              className="rounded-full border border-white/15 px-2.5 py-1"
            >
              Reset
            </button>
          </div>

          <ul className="space-y-2">
            {points.map((p, i) => (
              <li
                key={`wp-${i}`}
                className={`grid grid-cols-[auto_1fr_1fr_auto] items-center gap-1 rounded-lg px-1.5 py-1 ${
                  selected === i ? 'bg-spark/15' : 'bg-white/5'
                }`}
              >
                <button
                  type="button"
                  className="w-6 text-left text-mist"
                  onClick={() => onSelect(i)}
                >
                  {i + 1}
                </button>
                <label className="flex items-center gap-1">
                  <span className="text-mist">x</span>
                  <input
                    type="number"
                    step={0.5}
                    value={Number(p.x.toFixed(1))}
                    onChange={(e) => updatePoint(i, 'x', Number(e.target.value))}
                    className="w-full rounded bg-void px-1 py-0.5"
                  />
                </label>
                <label className="flex items-center gap-1">
                  <span className="text-mist">y</span>
                  <input
                    type="number"
                    step={0.5}
                    value={Number(p.y.toFixed(1))}
                    onChange={(e) => updatePoint(i, 'y', Number(e.target.value))}
                    className="w-full rounded bg-void px-1 py-0.5"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removePoint(i)}
                  className="px-1 text-mist hover:text-paper"
                  aria-label="Eliminar punto"
                >
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
