# Plan narrativo — Actos III → VI

Documento de referencia para la **segunda mitad** de la landing.  
Los Actos I–III viven en `ActSpark` (deseo → constelación → blueprint + rasgado).  
El Acto IV es el playground (`ActPlayground`).

**Línea temporal de la PC (misma silueta, distinto material):**

| Acto | Estado de la PC | Material |
| ---: | --- | --- |
| II | Idea | Constelación (estrellas + glow amarillo) |
| III | Plan | Blueprint (**trazos blancos** sobre azul + grilla) |
| VI | Materia | PC real encendida + CTA |

---

## Acto III — El plan (blueprint)

### Función narrativa
La idea deja de ser potencial y se vuelve **encargo**. Copy en `PLAN_COPY` (`src/data/content.ts`).

### Continuidad visual
- Misma geometría / ángulo que el Acto II (solo cambia color).
- Estrellas y glow se apagan; **líneas → blanco**.
- Fondo: `#0b1f3a` + grilla blanca delgada.
- Layout: PC izquierda, copy derecha; sello **APROBADO** (lima `#a3e635`) abajo-derecha del layout con golpe scrubbed.

### Beats (scroll, misma sección pineada)
1. Morph material (copy idea out → blanco + azul).
2. Entra copy del plan.
3. Sello APROBADO.
4. Rasgado **derecha → izquierda** (clip jagged + borde fibroso).

### Rasgado → Acto IV
- El papel azul se rompe y deja ver el playground debajo del pin.
- `ActUnbox` **no** está en el flujo (archivo conservado).

---

## Acto IV — Playground
Configurador 3D (lazy WebGL). Ver `ActPlayground` + `act4/`.

## Acto V — Configuración 50/50
Split: estándares | monitor/BIOS + thermal.

## Acto VI — ¿Empezamos?
Misma PC materializada + CTA WhatsApp.

---

## Mapa de transiciones

```
Acto II  constelación
    │  morph (blanco + azul grilla)
    ▼
Acto III  blueprint + copy plan + sello APROBADO
    │  rasgado D→I
    ▼
Acto IV  playground
    ▼
Acto V   50/50 config
    ▼
Acto VI  PC real + ¿Empezamos?
```
