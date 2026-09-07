# PROBLEMAS / backlog

Lista de issues abiertos. No es el plan narrativo — es lo que **hay que arreglar**.  
Priorizar con el dueño antes de tocar Acto 1 / `ActSpark`.

---

## 1. Desvanecimiento del ENTRA (Acto 1)
El **ENTRA** no se desvanece bien al pasar al Acto 2 (se corta, parpadea o no hace fade limpio).  
Archivo sensible: `ActSpark.tsx` (no romper el latch / path del Acto 1).

## 2. Unión de estrellas (Acto 2)
La forma en que las estrellas se unen (draw de aristas / timing) se siente mal. Revisar ritmo del draw de edges y aparición de estrellas.

## 3. Copys (en general)
Revisar y reescribir textos de todos los actos (`content.ts` + hardcodes en componentes). Tonos, longitud y continuidad narrativa.

## 4. Transición 3 → 4 (rasgado)
La **línea** del corte está bien como idea, pero la ejecución se ve **muy rara/fea**: parece solo una sombra abajo, no un rasgado creíble.  
Objetivo: paper tear tipo Trevor Noah **o** (ver #5) simplificar.

## 5. Hay “2 Acto 4”
Uno se ve **debajo de la línea** durante la transición y otro **después**. Duplicado / overlap.  
**Simplificación aceptada:** textura de papel roto en **diagonal** y ya, **sin animación** de rasgado scrub — si eso elimina el doble Acto 4 y el glitch visual.

## 6. Acto 4 no detiene el scroll
El playground no pinea / no retiene scroll.  
- Si se **queda** sin pin: **quitar el botón Saltar** (ya no hace falta ese muro).  
- Si se decide pinnear: entonces Saltar puede tener sentido.

## 7. Cambiar imagen de fondo del Acto 5
Reemplazar `public/wood-desk.jpg` (u overlay actual) por una textura/imagen nueva de escritorio aprobada por el dueño.

## 8. Hacer más grande el Acto 6
Más presencia: PC + tipografía + CTA a escala mayor (hero de cierre, no sección chica).

## 9. Todo más suave / fluido
Mínimo: suavizar con GSAP y/o smooth scroll ligero (sin romper ScrubTrigger de los actos). Sensación general menos “a trompicones”.

## 10. Cambiar todos los placeholders
`PLACEHOLDERS` en `content.ts` (+ title, WhatsApp, tel, email, redes, dirección): datos reales o al menos no-placeholder.

## 11. Quitar lo de dev
Sacar UI/editores solo-dev: Path editor, Constelación editor, handles, overlays de edición, etc. (o gate estricto que no exista en build/prod).

## 12. Header / accesos directos
Arreglar anclas del nav (`#idea`, `#configurador`, `#contacto`, etc.) **o quitarlos** si pelean con el scroll pineado.

## 13. Estrellas en Acto 1 y 2
Añadir/mejorar estrellas (atmósfera) en Acto 1 y reforzar en Acto 2 — coherencia visual del cielo/chispa/constelación.

---

## Notas de proceso sugeridas (no firmes)

| # | Riesgo | Notas |
|---|---|---|
| 1 | Alto | ActSpark / ENTRA |
| 4–5 | Alto | Transición; #5 puede ser atajo |
| 2, 13 | Medio | ActSpark pin |
| 6 | Bajo | Producto + quitar Skip si aplica |
| 3, 7, 8, 10, 11, 12 | Bajo–medio | Contenido / UI |
| 9 | Medio | Global; hacerlo al final o por capas |

---

## Docs relacionados

- `contexto-tecnico-ia.md` — mapa de código  
- `plan-como-estara.md` — objetivo narrativo  
- `briefing-ia-nueva.md` — onboarding IA  
