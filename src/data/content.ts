export const PLACEHOLDERS = {
  brand: 'PC Studio',
  tagline: 'Armado & reparación de alto rendimiento',
  phone: '+52 000 000 0000',
  phoneHref: 'tel:+520000000000',
  whatsapp: 'https://wa.me/520000000000',
  email: 'hola@pcstudio.placeholder',
  address: 'Taller — Ciudad, MX (placeholder)',
  socials: [
    { label: 'Instagram', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'TikTok', href: '#' },
  ],
} as const

/** Copy del Acto II: la idea (aún no el plano / transacción) */
export const IDEA_COPY = {
  kicker: 'Acto II',
  title: 'La idea toma forma',
  lead: 'Todavía no es un pedido. Es la silueta de lo que quieres crear — o de lo que hay que recuperar.',
  items: [
    {
      title: 'Armado',
      body: 'Una máquina nueva, pensada para lo que vas a hacer con ella.',
    },
    {
      title: 'Reparación',
      body: 'La que ya tienes: devolverle el potencial que se quedó a medias.',
    },
    {
      title: 'Cotización',
      body: 'Bajar la idea a piezas y números, sin compromiso todavía.',
    },
    {
      title: 'Garantía 1 mes',
      body: 'Cuando se materialice, el trabajo se sostiene el primer mes.',
    },
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
