# MASTERPLAN & NARRATIVA UI/UX
## LANDING PAGE DE ALTO IMPACTO NIVEL AWWWARDS

**PROYECTO:** PC Studio / Reparación & Armado  
**STACK PRINCIPAL:** React + Tailwind CSS + GSAP  
**META VISUAL:** Site of the Day (Awwwards)  

---

## 1. PROPÓSITO Y OBJETIVO GENERAL

El propósito de este proyecto es diseñar y desarrollar una landing page cinemática e interactiva para una empresa de reparación y armado personalizado de computadoras de alto rendimiento. El objetivo no es construir un sitio e-commerce tradicional, sino elevar la marca a estándares internacionales reconocidos por plataformas como Awwwards (Site of the Day / Developer Award).

Se busca fusionar la utilidad comercial (venta de armado y servicios de reparación) con una experiencia inmersiva basada en narrativa visual, animaciones avanzadas de scroll y microinteracciones de alta precisión.

---

## 2. LA NARRATIVA CENTRAL: "EL DESEO QUE SE MATERIALIZA"

En lugar de estructurar la página como un catálogo de productos estático, la experiencia completa se concibe como una historia en actos impulsada 100% por el scroll del usuario. La premisa conceptual establece que una computadora no nace de componentes sueltos, sino de una idea o deseo de creación.

> **CONCEPTO ORIGINAL DEL PROYECTO**  
> *"¿Qué conlleva una PC? Es contar una historia... Nace de un deseo, luego de una idea, luego de un plan, luego comprar la PC (subproceso: abrir cada caja, sacar cada componente, conectar cada pieza y atornillar, luego configurar, luego dejar lista) y finalmente dejar libre la creatividad (usarla)."*

A través de esta premisa, la landing unifica tanto a los clientes que desean crear una PC nueva desde cero como a aquellos que buscan reparar un equipo existente (recuperar el potencial perdido para volver a crear).

---

## 3. GUION NARRATIVO PASO A PASO (ESCENA POR ESCENA)

### ACTO I: EL DESEO RONDANDO (THE SPARK)
* **Atmósfera Visual:** Lienzo oscuro minimalista (`#09090b`). Una chispa o destello amarillo neón flota en la pantalla y reacciona dinámicamente al cursor del usuario.
* **Narrativa & Revelación:** A medida que el usuario hace scroll, la chispa se mueve revelando el texto conceptual: *"Siempre hay un deseo rondando..."*. Posteriormente, la chispa entra a una silueta tridimensional y revela la palabra clave: **ENTRA**.

---

### ACTO II: LA IDEA Y EL PLAN (TRANSICIÓN A LA TIENDA)
* **Atmósfera Visual:** Cambio de escena estético. Se pasa de la penumbra del deseo a una sección nubosa conceptual ("La Idea") y de ahí al "Plan" dentro del ambiente de la tienda/taller.
* **Interacción Clave:** Se evita la representación vulgar del intercambio de dinero. En su lugar, mediante animaciones vectoriales guiadas por scroll, se representa la entrega de un Blueprint o Plan Holográfico de Trabajo firmado entre el cliente y el técnico.

---

### ACTO III: CAJAS, DESPIECE Y ZOOM A LA ARQUITECTURA
* **Atmósfera Visual:** Estética técnica metálica. Las cajas de los componentes se abren cinemáticamente y las piezas salen disparadas y flotando en parallax con profundidad de campo.
* **El Portal de Transición (Zoom al Procesador):** El procesador vuela directo hacia la cámara en un *Deep Architectural Zoom*. El scroll atraviesa el encapsulado exterior y se adentra en el die de silicio y sus transistores. Al salir del microchip, la cámara aterriza suavemente dentro del gabinete de la tarjeta madre vacía.

---

### ACTO IV: EL PLAYGROUND (EL RITUAL DE ARMADO)
* **Atmósfera Visual:** Panel de control interactivo neumórfico oscuro.
* **Actividad Drag & Drop:** El usuario toma el control activo de la experiencia. Arrastra físicamente la tarjeta de vídeo (GPU), memorias RAM, sistema de enfriamiento y fuente de poder hacia el gabinete. Se calculan dinámicamente la compatibilidad y los Watts consumidos en tiempo real. Al acoplar cada pieza se activa un feedback sonoro (Web Audio API) y la chispa amarilla empieza a fluir por las pistas de la tarjeta.

---

### ACTO V: LA CONFIGURACIÓN (EL DESPERTAR)
* **Atmósfera Visual:** Estructura dividida (Split Screen 50/50).
* **Contenido:**
  * **Lado Derecho:** Representación interactiva del monitor ejecutando el Setup/BIOS, pruebas de estrés y carga de drivers en tiempo real. Incluye un switch para visualizar el mapa térmico de aire (*Thermal View*).
  * **Lado Izquierdo:** Espacio de texto detallando los estándares de calidad de la empresa, garantías y pruebas de estabilidad previa a la entrega.

---

### ACTO VI: EL ENCUENTRO Y CIERRE (CTA)
* **Atmósfera Visual:** Cambio de escena de regreso al ambiente cálido y elegante del cliente (su escritorio personal).
* **Layout de Salida:**
  * **Lado Izquierdo (20% - 30%):** Vista isométrica perfectamente balanceada de la PC armada, encendida con la luz amarilla neón fluyendo en el cristal templado.
  * **Lado Derecho:** Las frases en tipografía cinética:
    > *"Podrías ser tú,"*  
    > *"¿Empezamos?"*  
    Seguido del botón de contacto principal magnetizado y el número telefónico.
  * **Footer:** Ultra delgado, discreto y conciso con accesos a redes y taller.

---

## 4. ARQUITECTURA TECNOLÓGICA Y DINAMISMO

Para ejecutar la visión cinemática planteada en la narrativa sin comprometer el rendimiento, se utiliza la siguiente pila tecnológica:

| TECNOLOGÍA | ROL EN EL PROYECTO | IMPLEMENTACIÓN NARRATIVA |
| :--- | :--- | :--- |
| **React** | Estructura y Lógica de Estado | Manejo de componentes modulares, estado del Playground Drag & Drop y calculadora de compatibilidad. |
| **Tailwind CSS** | Sistema de Diseño y Layout | Estilizado ultra rápido, layouts responsivos, tipografía adaptativa y paleta de color nocturna (`#09090b` / `#facc15`). |
| **GSAP & ScrollTrigger** | Motor de Animación Cinematográfico | Control de líneas de tiempo asociadas al scroll, efecto "Pinning" de pantalla, morphing de vectores y Zoom al procesador. |
| **GSAP Flip API** | Animación FLIP de Componentes | Transiciones ultra fluidas al soltar los componentes dentro del gabinete en el Playground. |
| **Web Audio API** | Capa Micro-Sensorial | Sonidos mecánicos sutiles al encajar piezas, zumbido estático de la chispa y tono de arranque POST. |

> *"El monolito de diseño se aborda construyendo y puliendo cada acto como una tarjeta/componente independiente en React. Una vez validado el layout y la accesibilidad en Tailwind, se inyecta la capa narrativa y dinámica con GSAP."*