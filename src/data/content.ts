export const PLACEHOLDERS = {
  brand: 'CompuLab',
  tagline: 'Armado & reparación de computadoras de alto rendimiento',
  phone: '+52 813 041 6824',
  phoneHref: 'tel:+528130416824',
  whatsapp: 'https://wa.me/528130416824',
  email: 'hola@compulab.com',
  address: 'Softtek — Monterrey, NL',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/compulab' },
    { label: 'Facebook', href: 'https://www.facebook.com/compulab' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@compulab' },
  ],
} as const

/** Acto II — la idea: para qué la quieres (solo conceptos) */
export const IDEA_COPY = {
  kicker: 'Acto II',
  /** Continúa la lectura del Acto 1 (“Y que al final…” → ENTRA). Temporal. */
  title: 'sabes para qué la quieres',
  items: ['Crear', 'Jugar', 'Trabajar', 'Recuperar'] as const,
} as const

/** Acto III — el plan: por qué con CompuLab (pragmático) + sello = transacción */
export const PLAN_COPY = {
  kicker: 'Acto III',
  title: 'Con nosotros, queda claro',
  lead: 'Armar aquí es una decisión con reglas — no un salto a ciegas.',
  items: [
    { title: 'Piezas compatibles', body: 'Nada a prueba y error.' },
    { title: 'Tiempo claro', body: 'Fecha de entrega desde el inicio.' },
    { title: 'Pruebas reales', body: 'Estrés y temperatura antes de soltarla.' },
    { title: 'Garantía 1 mes', body: 'Si algo falla, respondemos.' },
  ],
} as const

export const SERVICES = [
  {
    title: 'Armado de PCs',
    body: 'Diseñamos y montamos tu equipo desde cero según uso, presupuesto y estética.',
  },
  {
    title: 'Reparación',
    body: 'Diagnóstico, cambio de piezas y recuperación de rendimiento en equipos existentes.',
  },
  {
    title: 'Cotización',
    body: 'Te armamos un plan claro de componentes y costos antes de tocar una sola caja.',
  },
  {
    title: 'Garantía 1 mes',
    body: 'Pruebas de estabilidad previas a la entrega y soporte durante el primer mes.',
  },
] as const
