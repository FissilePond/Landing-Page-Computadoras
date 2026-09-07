# Contexto técnico para IA (leer primero en tareas de código)

Documento **denso** para gastar pocos tokens.  
Narrativa / “cómo debe quedar” → `plan-como-estara.md`.  
Onboarding corto → `briefing-ia-nueva.md`.

**Stack:** React 19 + TS + Vite 7 + Tailwind 4 + GSAP ScrollTrigger + Three (Acto 4).  
**Marca:** CompuLab · **Rama tipica:** `acto4` · **Dev:** `npm run dev` → localhost:5173  
**Desktop primero · Sin audio · No inventar assets.**

---

## Orden en pantalla (`App.tsx`)

```
header (CompuLab)
ActSpark          → Actos 1–3 (+ rasgado → 4)
ActPlayground     → Acto 4 (config 3D + Saltar)
[mensaje si incompleto]
ActConfig         → Acto 5 (si config completa O skip)
ActCta            → Acto 6 (mismo gate)
```

**Gate:** `canContinue = configurationComplete || skippedAssembly`.  
**Saltar:** `onSkip` → monta 5/6 y hace scroll al **inicio** de `#configuracion`.

---

## Mapa de archivos

| Archivo | Rol |
|---|---|
| `src/App.tsx` | Orquesta actos, skip, scroll a Acto 5 |
| `src/data/content.ts` | `PLACEHOLDERS`, `IDEA_COPY`, `PLAN_COPY`, `SERVICES` |
| `src/data/sparkPath.ts` | Path Acto 1 (waypoints, load/save localStorage) |
| `src/data/constellation.ts` | Estrellas/aristas Acto 2 |
| `src/index.css` | Tokens: void, spark, Syne, Outfit |
| `src/components/acts/ActSpark.tsx` | **Actos 1–3** · archivo grande/frágil |
| `…/SparkPathEditor.tsx` | Dev-only editor path Acto 1 |
| `…/ConstellationEditor.tsx` | Dev-only editor constelación |
| `…/ActPlayground.tsx` | Acto 4 UI + productos + compatibilidad |
| `…/act4/main.ts` | `initPcWorkbench` Three.js |
| `…/act4/models.tsx` | Visores 3D auxiliares (poco usados en UI) |
| `…/act4/styles.css` | Skin wizard Acto 4 |
| `…/ActConfig.tsx` | Acto 5: madera + 50/50 + checks |
| `…/ActCta.tsx` | Acto 6: PC + “¿Empezamos?” + Contáctanos |
| `…/ActUnbox.tsx` | **Fuera del flujo** — no montar |
| `public/pc-hero.png` | PC Acto 6 |
| `public/wood-desk.jpg` | Fondo madera Acto 5 |
| `public/tears/*` | Assets rasgado (rasgado1/2/3) |

---

## Acto por acto (código real)

### Acto 1 — Deseo (`ActSpark`)
- Scroll scrub: chispa sigue path SVG (`sparkPath`).
- Frases `PHRASES`, silueta + **ENTRA** (latch por proximidad a cabeza).
- **NO TOCAR** path/ENTRA/silueta si se puede. Romper esto cuesta caro.
- Helpers: `absorbAtDistance`, `buildPathFromPhrases`, `onFrame`, `showEnter`/`hideEnter`.

### Acto 2 — Idea (mismo `ActSpark`, pin)
- Pin al llegar al final del trazo (`ideaTl` + ScrollTrigger).
- Constelación: estrellas + edges draw; copy `IDEA_COPY` (Crear/Jugar/Trabajar/Recuperar).
- Título: “sabes para qué la quieres”.
- ENTRA debe desvanecerse **encima** del stage (z alto); no hundirlo con `exitWorld`.

### Acto 3 — Plan (mismo pin)
- Morph material → blueprint (`BLUEPRINT_BG` + grid).
- `PLAN_COPY` + sello **APROBADO** (después de poder leer la ficha).
- **Rasgado → Acto 4 (WIP / frágil):** clip-path del papel + borde fino; playground a veces `position:fixed` detrás. Objetivo: estilo trevornoah.com (más scroll = más rotura). **No reescribir Acto 1 al tocar esto.**

Constantes clave en `ActSpark`: `IDEA_SCREENS`, `PLAN_SCREENS`, `TEAR_SCREENS`, `PLAN_START`, `TEAR_START`/`TEAR_END`.

### Acto 4 — Playground
- `ActPlayground`: catálogo por categoría, precios MXN, `compatible()`, `initPcWorkbench`.
- Lazy WebGL con IntersectionObserver.
- Botones: Reiniciar, **Saltar** (`onSkip`).
- Export: `ConfigurationSummary`, `ComponentName`.

### Acto 5 — Despertar (`ActConfig`)
- Panel madera sube (scrub previo + pin).
- 50/50: texto izq (`data-act5-copy` stagger) · monitor der (pantalla azul, checks ✓).
- Checks: OS, Drivers, BIOS, estrés, temps, lista.
- Salida: **scroll normal** al 6 (sin slide a la derecha).

### Acto 6 — CTA (`ActCta`)
- `pc-hero.png` + “Podrías ser tú. ¿Empezamos?” + Contáctanos → WhatsApp placeholder.
- Footer mínimo.

---

## Funciones / exports importantes

| Símbolo | Archivo | Para qué |
|---|---|---|
| `ActSpark` | ActSpark.tsx | Toda la secuencia 1–3 |
| `initPcWorkbench` | act4/main.ts | Escena 3D armado |
| `IDEA_COPY` / `PLAN_COPY` | content.ts | Textos actos 2–3 |
| `loadSparkPath` / `saveSparkPath` | sparkPath.ts | Persistencia path (dev) |
| `loadConstellation` / `saveConstellation` | constellation.ts | Persistencia mapa (dev) |
| `ActConfig` | ActConfig.tsx | Acto 5 |
| `ActCta` | ActCta.tsx | Acto 6 |

---

## IDs DOM útiles

- `#deseo` — sección Acto 1  
- `#idea` — stage actos 2–3  
- `#configurador` — Acto 4  
- `#configuracion` — Acto 5  
- `#contacto` — Acto 6  

---

## Reglas duras (dueño)

1. Preguntar antes de inventar motion/copy grande.  
2. **Acto 1 = sagrado.** Si tocas `ActSpark`, aísla el cambio al tramo 2/3/rasgado o trabaja en **rama aparte**.  
3. No inventar PNG/texturas; si falta, pedir.  
4. Desktop first.  
5. Trabajar rasgado 3→4 en rama tipo `fix/rasgado-3-4`, no romper `acto4` estable.

---

## Estado conocido (abr 2026 sesión)

- Actos 2 copy/conceptos y 3 plan/sello: avanzados.  
- Rasgado 3→4: **aún no satisface** (objetivo Noah; otra IA puede tomarlo en rama).  
- Acto 4 skin + Saltar: ok.  
- Acto 5 madera + monitor + checks: ok-ish; pulible.  
- Acto 6 básico: ok.

---

## Prompt mínimo para otra IA

> Lee `contexto-tecnico-ia.md` y `plan-como-estara.md`. Rama: `fix/rasgado-3-4` (o la indicada). Tarea: solo [X]. No tocar Acto 1. Desktop. Pregunta si bloqueas.
