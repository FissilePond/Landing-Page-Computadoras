# Briefing para una IA nueva (cero contexto)

Léelo completo antes de tocar código. Si algo choca con el repo, **gana** `plan-como-estara.md`.

---

## Qué es este proyecto

Landing page de alto impacto (estilo Awwwards) para **CompuLab**, empresa de **armado y reparación de PCs** (México, precios MXN).

No es un e-commerce clásico. Es una **experiencia en actos impulsada por scroll**: deseo → idea → plan (transacción) → armado → configuración → CTA.

**Repo:** `Landing-Page-Computadoras` (rama de trabajo típica: `acto4`).  
**Stack:** React + TypeScript + Vite + Tailwind v4 + GSAP (ScrollTrigger) + Three.js / R3F en el Acto 4.

**Correr:**

```bash
npm install
npm run dev
```

---

## Documentos (prioridad)

1. **`plan-como-estara.md`** ← estado objetivo acordado con el dueño. **Fuente de verdad.**  
2. Este archivo (`briefing-ia-nueva.md`) ← onboarding.  
3. `proyecto_narrativa_masterplan.md` y `plan-actos-3-a-6.md` ← histórico; pueden estar desactualizados. No los uses para contradecir el plan nuevo.

---

## Mapa de archivos importantes

| Área | Dónde |
|---|---|
| App / orden de actos | `src/App.tsx` |
| Copy / placeholders | `src/data/content.ts` |
| Tokens CSS | `src/index.css` |
| Actos 1–3 (scroll pin, constelación, blueprint, rasgado) | `src/components/acts/ActSpark.tsx` ← **grande y frágil** |
| Acto 4 playground | `src/components/acts/ActPlayground.tsx` + `src/components/acts/act4/` |
| Acto 5 | `src/components/acts/ActConfig.tsx` (hoy incompleto vs plan) |
| Acto 6 | `src/components/acts/ActCta.tsx` |
| ActUnbox | `src/components/acts/ActUnbox.tsx` — **fuera del flujo**; no reactivar sin pedir |
| PC hero | `public/pc-hero.png` (existe) |
| Assets rasgado | `public/tears/` |
| Refs rasgado Trevor Noah | las pasó el dueño en chat; estilo jagged + fibra blanca |

---

## Reglas de trabajo (el dueño es estricto con esto)

1. **Pregunta lo que necesites** antes de inventar. No asumas copy final, motion ni alcance.  
2. **No toques el Acto 1** si puedes evitarlo. Ya “sirve”. Si debes tocar `ActSpark.tsx`, aísla cambios al tramo Acto 2/3 o haz respaldo / copia de módulo. Romper el 1 cuesta mucho tiempo.  
3. **No inventes** fotos de PC ni assets que no existan. Si falta, dilo.  
4. **Desktop primero.**  
5. **Sin audio** en esta fase.  
6. Orden de implementación: **2+3+4 skin → 5 → 6**.  
7. Hablar / planear cuando pida hablar; no “arreglar” a ciegas.  
8. Marca en UI: **CompuLab** (hoy el código aún puede decir “PC Studio” — hay que actualizarlo cuando se implemente).

---

## Los 6 actos (cómo deben quedar)

### Acto 1 — Deseo (hecho)
Chispa, frases, silueta, **ENTRA**. Cierra con *“Y que al final…”* → ENTRA. **No modificar.**

### Acto 2 — Idea
- Misma escena pineada / constelación.  
- Layout: silueta **izq**, texto **der**.  
- Mini lista de **conceptos** (solo título): Crear · Jugar · Trabajar · Recuperar.  
- Título temporal: **“sabes para qué la quieres”** (continúa la lectura del 1).  
- Rol: *para qué* la PC, no garantía ni catálogo largo.

### Acto 3 — Plan
- Morph a **blueprint** más claro que el actual.  
- Copy pragmático: Piezas compatibles · Tiempo claro · Pruebas reales · Garantía 1 mes.  
- Sello **APROBADO** = transacción hecha.  
- Luego **rasgado progresivo** (tipo trevornoah.com) → revela Acto 4.  
- El rasgado es **solo** transición 3→4.

### Acto 4 — Playground
- Configurador 3D existente.  
- Cambios: **solo skin** (look CompuLab), no rediseñar lógica.  
- Precios MXN.  
- Botón **Saltar** para ir al 5 sin armar completo.

### Acto 5 — Despertar
- 50/50: texto izq · monitor der.  
- Checks con palomita verde al scroll (OS, Drivers, BIOS, estrés, temps, lista).  
- **Entrada:** wipe pantalla completa con textura **roble oscuro / escritorio café** → monitor sube desde abajo.  
- **Salida:** último check → pausa → monitor se apaga → el bloque se mueve a la **derecha** → revela Acto 6.

### Acto 6 — CTA
- PC + **“Podrías ser tú. ¿Empezamos?”**  
- Botón **Contáctanos** → WhatsApp placeholder.  
- Footer mínimo delgado.

---

## Estado real vs objetivo (para no confundirte)

Al abrir el repo verás cosas a medias o distintas al plan:

- Copy viejo en `content.ts` (servicios Armado/Reparación…, marca “PC Studio”).  
- Acto 5 hoy es más “ticket MXN” que monitor con checks.  
- Actos 5/6 pueden estar gated por configuración completa (falta **Saltar**).  
- El rasgado existe pero debe acercarse más a la ref Trevor Noah (abrir más al scrollear).  
- Acto 2 puede haber tenido experimentos de layout/copy; alinear a `plan-como-estara.md`.

Implementa hacia el plan objetivo; no “respetes” el estado a medias si contradice el plan.

---

## Criterios de aceptación rápidos

- [ ] Acto 1 intacto (misma sensación al scrollear el tramo inicial).  
- [ ] Acto 2: 4 conceptos + título de continuación; mini lista.  
- [ ] Acto 3: blueprint legible + sello + rasgado solo a 4.  
- [ ] Acto 4: skin + MXN + Saltar.  
- [ ] Acto 5: wipe roble → monitor → checks → apagado → slide a 6.  
- [ ] Acto 6: PC + frase + Contáctanos + footer delgado.  
- [ ] Marca CompuLab en UI visible.

---

## Cómo hablar con el dueño

- Directo, corto, sin relleno.  
- Si vas a cambiar narrativa o motion grande: **pregunta primero**.  
- Si el tiempo aprieta: propone la opción más barata que cumpla el plan.  
- Español (México).

Cuando termines un bloque, resume qué cambió y qué falta del checklist — sin inventar el siguiente alcance.
