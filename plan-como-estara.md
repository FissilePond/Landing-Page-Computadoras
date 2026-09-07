# Plan — Cómo estará el proyecto (estado objetivo)

**Marca:** CompuLab  
**Producto:** Landing cinemática (scroll) de armado / reparación de PCs  
**Stack:** React + Vite + Tailwind + GSAP (+ WebGL en Acto 4)  
**Prioridad layout:** Desktop primero  
**Audio:** No en esta fase  
**Datos de contacto:** Placeholders (WhatsApp / tel / redes)  
**Asset PC:** `public/pc-hero.png` (existe; no inventar otra)

Documentos viejos (`proyecto_narrativa_masterplan.md`, `plan-actos-3-a-6.md`) son referencia histórica. **Este archivo manda** para el estado objetivo acordado.

---

## Orden de trabajo

1. Actos **2 + 3 + 4 (solo skin)**  
2. Acto **5**  
3. Acto **6** (más simple)

**Restricción dura:** no romper Acto 1. Preferible no tocarlo; si hace falta, respaldo o copiar lógica a otro módulo antes de alterar.

---

## Narrativa central

Una PC nace de un **deseo** → se vuelve **idea** (para qué) → se vuelve **plan** (decisión / transacción) → el taller **arma** → la máquina **despierta** (config) → **entrega / CTA**.

El sello **APROBADO** = la transacción quedó hecha.  
El Acto 4 = la tienda se pone a trabajar porque ya se aprobó.

---

## Acto 1 — El deseo (YA SIRVE — no tocar)

- Lienzo void, chispa amarilla, frases al scroll, silueta, **ENTRA**.
- Cierre de lectura: *“Y que al final…”* → **ENTRA**.
- El Acto 2 debe **continuar** esa lectura, no resetear el tono.

---

## Acto 2 — La idea

### Rol
Todavía no es pedido. Es **para qué / por qué** quieres la máquina (concepto), no catálogo de servicios ni garantía.

### Layout
- PC / constelación **izquierda**
- Texto **derecha** (como ahora)
- **No** texto encima de la silueta

### Copy (objetivo)
- Título temporal (continúa el 1): **“sabes para qué la quieres”** (el dueño lo puede cambiar después).
- Mini lista: **solo concepto** (título corto, sin body largo):

  1. Crear  
  2. Jugar  
  3. Trabajar  
  4. Recuperar *(reparar / recuperar lo que ya tienes)*

### Motion
- Constelación / dibujo de forma (ya existe; conservar espíritu).
- Las ideas entran como mini lista con ritmo (no un solo fade de bloque).
- Beat corto de lectura antes del morph al Acto 3.

---

## Acto 3 — El plan (pragmático)

### Rol
“Comprar / armar con CompuLab es buena decisión.”  
Aspectos prácticos (compatibilidad, tiempo, pruebas, garantía).  
**Sello APROBADO** = transacción representada.

### Look
- **Plano técnico** (azul + grilla + trazos), pero **más claro** que la versión actual.
- Misma silueta que el Acto 2; cambia el “material” (idea → blueprint).
- Copy tipo ficha / puntos, no muro de texto.

### Copy (objetivo)
1. Piezas compatibles  
2. Tiempo claro  
3. Pruebas reales  
4. Garantía 1 mes  

(Copy fino lo propone quien implemente; el dueño revisa.)

### Entrada desde Acto 2
1. Aire corto con la mini lista del 2.  
2. Ideas se apagan.  
3. Morph a blueprint (más legible).  
4. Entra ficha pragmática.  
5. Sello **APROBADO**.

### Salida → Acto 4
- **Solo aquí** va el rasgado.
- Referencia: Trevor Noah (`trevornoah.com`) + fotos de ref del dueño.
- Al scrollear hacia abajo, el rasgado **se abre más** (progresivo), revelando el Acto 4 debajo.
- Assets existentes: `public/tears/`.

---

## Acto 4 — Playground (armar)

### Rol
La tienda trabaja: el usuario arma / elige piezas en el configurador 3D.

### Alcance de cambios
- **Solo skin / diseño** (colores CompuLab void+spark, tipografía, bordes, menos look SaaS).
- **No** rediseñar la herramienta ni la lógica.
- Precios en **MXN** (se quedan).
- Botón **Saltar**: continuar sin completar la PC → Acto 5.

### Gate
Sin completar config, hoy se bloquean 5/6. Objetivo: poder **saltar** y seguir.

---

## Acto 5 — El despertar (configuración)

### Layout
50/50:
- **Izquierda:** texto (estándares / calidad / qué hacen antes de entregar).
- **Derecha:** “monitor” con checklist; al scrollear, checks se marcan con **palomita verde**.

### Checklist del monitor (orden)
1. Instalar sistema operativo  
2. Drivers  
3. BIOS / perfiles  
4. Prueba de estrés  
5. Temperaturas estables  
6. Lista para entrega  

### Entrada (desde Acto 4)
1. Usuario termina armado **o** pulsa **Saltar**.  
2. Al scrollear: un **wipe** cubre toda la pantalla.  
3. Textura del wipe: **café / roble oscuro** (escritorio), no void plano.  
4. Luego el **monitor sube de abajo hacia arriba**.

### Durante
Scroll marca los checks en orden.

### Salida → Acto 6
1. Último check.  
2. Pausa corta.  
3. El monitor se **apaga**.  
4. Todo el bloque del 5 se **mueve a la derecha**.  
5. Queda revelada la toma final = Acto 6.

---

## Acto 6 — Cierre / CTA

### Contenido
- PC (`pc-hero.png`) + mensaje corto.
- Copy: **“Podrías ser tú. ¿Empezamos?”**
- Un botón: **Contáctanos** → WhatsApp (placeholder).
- Footer **mínimo**, delgado (marca, links placeholder).

### No priorizar
Escritorio cálido complejo / tipografía cinética pesada. Simple y limpio.

---

## Sistema visual (objetivo)

| Token | Uso |
|---|---|
| Void `#09090b` | Base |
| Spark `#facc15` | Acento / chispa |
| Blueprint azul + grilla | Acto 3 (más claro que hoy) |
| Roble oscuro / textura escritorio | Wipe entrada Acto 5 |
| Syne + Outfit | Display + body |
| Marca en UI | **CompuLab** (reemplazar “PC Studio”) |

---

## Fuera de alcance (por ahora)

- Web Audio  
- Rediseño profundo del configurador  
- Zoom al silicio / ActUnbox en el flujo  
- Datos reales de contacto  
- Inventar nueva foto de PC  

---

## Criterio de “listo” por fase

- **Fase 2+3+4:** Acto 2 ideas correctas; Acto 3 plano claro + sello; rasgado 3→4 tipo ref; Acto 4 skineado + Saltar; Acto 1 intacto.  
- **Fase 5:** wipe roble → monitor sube → checks → apagado → slide a 6.  
- **Fase 6:** PC + frase + Contáctanos + footer delgado.
