# Plan narrativo — Actos III → VI

Documento de referencia para la **segunda mitad** de la landing.  
Los Actos I–II (deseo → constelación) ya están en curso en `ActSpark`.  
Este plan **actualiza** el masterplan original: el “Plan” ya no vive mezclado con la Idea; es el Acto III propio. Cajas / playground pasan al Acto IV.

**Línea temporal de la PC (misma silueta, distinto material):**

| Acto | Estado de la PC | Material |
| ---: | --- | --- |
| II | Idea | Constelación (estrellas + glow) |
| III | Plan | Blueprint (trazos técnicos sobre papel azul) |
| VI | Materia | PC real encendida + CTA |

---

## Acto III — El plan (blueprint)

### Función narrativa
La idea deja de ser potencial y se vuelve **encargo**: reglas, piezas, tiempo, costo estimado, acuerdo.  
No es venta dura ni CTA de WhatsApp (eso es el VI).

### Continuidad visual
- **Misma geometría** que el Acto II (mismo mapa de estrellas/aristas / mismo ángulo).
- No se redibuja otra PC: es un **re-skin** de la constelación.
- Layout familiar: PC a la izquierda, **más info a la derecha**.

### Transición Acto II → III (entrada)
Scroll continuo desde la constelación ya armada:

1. **Líneas** de amarillo/glow → **negro** (trazo de plano).
2. **Aristas / estrellas** (nodos brillantes) **desaparecen** — quedan solo los trazos limpios.
3. **Fondo** del void/cielo → **azul de plano** con **líneas blancas** (grilla / papel milimetrado).
4. La silueta se lee como documento técnico, no como cielo.

Ritmo: más calmado que el 1→2. Un morph de material, no otra explosión.

### Contenido (lado derecho)
Copy de **plan**, no de servicios (los servicios ya fueron la Idea):

- Título tipo: *El plan* / *De la idea al plano*
- Puente: *Aquí la chispa deja de rondar y se vuelve trabajo.*
- Bloques cortos:
  - Uso objetivo
  - Piezas / compatibilidad
  - Tiempos
  - Costo estimado (sin escena de dinero)
  - Aprobación cliente ↔ taller
- Cierre suave: *Cuando el plano queda, el taller responde.*

### Beat final del Acto III — el sello
Al final de la sección, un **sello** (APROBADO / CONFIRMADO / encargo sellado):

- Cierra el acuerdo sin mostrar billetes.
- Momento claro de descanso antes de la transición al IV.
- Puede ser scrub corto o un “golpe” visual al llegar al fondo del pin/sección.

### Criterios técnicos (para no inflar scope)
- Reusar `constellation` map → stroke negro + nodos off.
- Fondo = capa CSS/SVG de grilla azul, no un motor 3D.
- Copy en data (`PLAN_COPY`), layout espejo del Acto II.
- Sello = asset o SVG + tween de opacidad/escala/rotación ligera.

---

## Transición III → IV — Papel que se arranca

### Idea
El plano **ya sellado** se **rompe / arranca** como hoja de papel.  
Debajo (o al abrirse el rasgado) aparece el mundo del taller: cajas, piezas, ritual de armado.

### Por qué encaja
- El Acto III es documento; el IV es **materia y manos**.
- El rasgado es la puerta: de “acuerdo en papel” a “se empieza a construir”.
- Una sola transición “fancy”; el resto del IV puede ser más modular.

### Notas de ejecución (cuando toque)
- Capa overlay (máscara / tear) encima del blueprint, no reconstruir la PC otra vez.
- Preferible scroll-driven o un gesto corto al cruzar el umbral de sección.
- Al terminar el rasgado, el Acto IV ya está debajo o entra limpio.

---

## Acto IV — El taller (lo que “hace más gente”)

### Función narrativa
Aquí entra la **tienda / taller**: el proceso que más gente reconoce y el tramo más repartible entre colaboradores (módulos, assets, interacción).

En el masterplan original esto era “Acto III cajas + Acto IV playground”.  
En la narrativa actual **vive junto como Acto IV**, con dos beats:

### Beat A — Cajas y despiece
- Estética técnica / metálica.
- Cajas de componentes se abren; piezas flotan (parallax).
- Opcional (módulo aparte): **zoom al procesador** (deep zoom) y aterrizaje en la motherboard vacía.

### Beat B — Playground de armado
- El usuario (o una demo guiada) acopla piezas al gabinete.
- Compatibilidad + watts.
- Feedback (sonido / chispa en pistas) cuando esté el módulo.
- Drag & drop / GSAP Flip = buen candidato a **módulo externo** (“lo hace más gente”).

### Atmósfera
- Sale del papel azul; entra taller / panel oscuro neumórfico.
- Ya no es cielo ni documento: es **banco de trabajo**.

### Qué no hacer aquí
- No repetir el morph constelación→plano→otra silueta abstracta.
- No robar el CTA final del Acto VI.

---

## Acto V — La configuración (despertar) · 50/50

### Función narrativa
La máquina ya se arma; aquí se **despierta y se valida** antes de entregarla.  
“Nada se va casi listo.”

### Layout
**Split screen 50/50** (acordado desde el masterplan):

| Lado | Contenido |
| --- | --- |
| **Izquierda** | Texto: estándares de armado, cableado limpio, pruebas de estrés, estabilidad, garantía real del trabajo |
| **Derecha** | Monitor / BIOS / setup: POST, drivers, stress; toggle **Thermal View** |

### Transición IV → V
Más suave que el rasgado: el playground “enciende” o la cámara pasa del gabinete abierto al monitor encendido.  
Sin otra metáfora de papel.

### Tone
- Confianza técnica, no marketing agresivo.
- Garantía aquí = **cobertura del trabajo**, no teaser lejano del Acto II.

---

## Acto VI — El encuentro y cierre · “¿Empezamos?”

### Función narrativa
La misma PC, por fin **materia**: encendida, en el escritorio del cliente.  
Cierre emocional + CTA.

### Continuidad con II / III
- **Misma silueta / mismo ángulo** que constelación y plano (si el asset lo permite).
- Material nuevo: volumen, cristal, luz spark (`#facc15`) en el panel.
- El ojo debe leer: “era esa, ahora es real”.

### Layout
- **Izquierda (~30%):** PC isométrica / render encendida.
- **Derecha:** tipografía cinética:

  > *Podrías ser tú,*  
  > *¿Empezamos?*

- CTA magnetizado (WhatsApp) + teléfono secundario.
- Footer delgado: marca, dirección, redes.

### Transición V → VI
Del monitor de pruebas al escritorio cálido del cliente (cambio de escena de taller → hogar/setup personal).  
La chispa/amarillo vuelve como luz de la máquina, no como destello de deseo.

### Qué no va
- No reabrir el plano ni la constelación.
- Un solo CTA fuerte (aquí).

---

## Mapa rápido de transiciones

```
Acto II  constelación (estrellas + glow)
    │  morph de material (calmado)
    ▼
Acto III  blueprint (líneas negras, nodos off, fondo azul + grilla)
    │  sello al final
    │  papel se arranca / rasga
    ▼
Acto IV  taller (cajas → playground)  ← módulo colaborativo
    │  encendido / paso a monitor
    ▼
Acto V   50/50 config + thermal
    │  escena a escritorio
    ▼
Acto VI  PC real + ¿Empezamos? + CTA
```

---

## Estado en código (hoy)

| Narrativa | Shell actual | Notas |
| --- | --- | --- |
| I + II | `ActSpark` | En desarrollo |
| III Plan | *(aún no)* | Hoy `ActUnbox` está mal etiquetado como “Acto III” |
| IV Taller | `ActUnbox` + `ActPlayground` | Shells; renumerar / fusionar cuando se implemente |
| V Config | `ActConfig` | Shell 50/50 + thermal |
| VI CTA | `ActCta` | Shell PC + ¿Empezamos? |

Placeholders de marca/contacto: `src/data/content.ts`.

---

## Principios para no romper lo ya ganado

1. **Misma PC, otro material** en II → III → VI.
2. Acto III = **re-skin + copy + sello**, no nueva escena 3D.
3. Una sola transición espectacular en este tramo: **el rasgado** hacia el IV.
4. Acto IV = el bloque más repartible (“más gente”).
5. CTA fuerte solo en el VI.
6. No reabrir el clímax frágil del Acto I–II desde estos actos; el III arranca **después** de la constelación ya resuelta.
