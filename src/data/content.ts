export const PLACEHOLDERS = {
  brand: 'CompuLab',
  tagline: 'Armado & reparación de alto rendimiento',
  phone: '+52 81 2697 6226',
  phoneHref: 'tel:+528126976226',
  whatsapp: 'https://wa.me/528126976226',
  email: 'hola@compulab.com',
  address: 'Pamplona 218, Iturbide — San Nicolas de los Garza, NL.',
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'TikTok', href: '#' },
  ],
} as const

/** Acto II — la idea: para qué la quieres (solo conceptos) */
export const IDEA_COPY = {
  kicker: 'Acto II',
  /** Continúa la lectura del Acto 1 (“Y que al final…” → ENTRA). Temporal. */
  title: '¿Para qué la usarías?',
  items: ['Crear', 'Jugar', 'Trabajar', 'Tu compañera de batalla.'] as const,
} as const

/** Acto III — el plan: por qué con CompuLab (pragmático) + sello = transacción */
export const PLAN_COPY = {
  kicker: 'Acto III',
  title: 'Con nosotros, queda claro',
  lead: 'Armar aquí es una decisión con reglas — no un salto a ciegas.',
  items: [
    { title: 'Piezas compatibles', body: 'Nada a prueba y error.' },
    { title: 'Tiempo claro', body: 'Sabes cuándo la tienes.' },
    { title: 'Pruebas reales', body: 'Estabilidad antes de entregar.' },
    { title: 'Garantía 1 mes', body: 'El trabajo se sostiene.' },
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
