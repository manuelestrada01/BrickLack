// Constantes de animación GSAP reutilizables en toda la app.
// Importar desde acá para mantener consistencia visual.

export const DURATION = {
  FAST: 0.2,
  NORMAL: 0.4,
  SLOW: 0.8,
  PAGE: 0.5,
} as const

export const EASE = {
  ENTER: 'power2.out',
  EXIT: 'power2.in',
  BOUNCE: 'back.out(1.7)',
  SMOOTH: 'power3.inOut',
  ELASTIC: 'elastic.out(1, 0.5)',
} as const

export const STAGGER = {
  CARDS: 0.08,
  LIST: 0.05,
  HERO: 0.15,
} as const

// Hover de cards
export const CARD_HOVER_VARS = {
  scale: 1.03,
  boxShadow: '0 6px 0 0 rgba(0, 0, 0, 0.25), 0 12px 32px -4px rgba(0, 0, 0, 0.35)',
  duration: DURATION.FAST,
  ease: EASE.ENTER,
} as const

export const CARD_UNHOVER_VARS = {
  scale: 1,
  boxShadow: '0 4px 0 0 rgba(0, 0, 0, 0.25), 0 8px 24px -4px rgba(0, 0, 0, 0.3)',
  duration: DURATION.FAST,
  ease: EASE.ENTER,
} as const

// Reveal de elementos al entrar en viewport
export const REVEAL_FROM_BOTTOM = {
  from: { y: 32, opacity: 0 },
  to: { y: 0, opacity: 1, duration: DURATION.NORMAL, ease: EASE.ENTER },
} as const

export const REVEAL_FROM_LEFT = {
  from: { x: -32, opacity: 0 },
  to: { x: 0, opacity: 1, duration: DURATION.NORMAL, ease: EASE.ENTER },
} as const

// Fade de página
export const PAGE_FADE_IN = {
  from: { opacity: 0 },
  to: { opacity: 1, duration: DURATION.PAGE, ease: EASE.ENTER },
} as const

export const PAGE_FADE_OUT = {
  to: { opacity: 0, duration: DURATION.FAST, ease: EASE.EXIT },
} as const
