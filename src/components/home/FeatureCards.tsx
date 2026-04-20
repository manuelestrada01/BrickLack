import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import { CARD_HOVER_VARS, CARD_UNHOVER_VARS, STAGGER, REVEAL_FROM_BOTTOM } from '@/styles/animations'

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'Busca cualquier set',
    description: 'Accede a más de 20.000 sets y 50.000 piezas del catálogo completo de LEGO vía Rebrickable.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: 'Rastrea tu progreso',
    description: 'Marca cada pieza encontrada. La barra de progreso se actualiza en tiempo real con animaciones fluidas.',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    title: 'Identifica con IA',
    description: 'Saca una foto de una pieza suelta y la IA la identifica: tipo, color, dimensiones y número de parte.',
    badge: '3 escaneos / mes',
  },
  {
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
    title: 'Siempre sincronizado',
    description: 'Tu colección en la nube. Accede desde cualquier dispositivo — próximamente disponible en mobile.',
  },
]

export function FeatureCards() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const cards = containerRef.current?.querySelectorAll('[data-card]')
      if (!cards?.length) return

      gsap.fromTo(
        cards,
        REVEAL_FROM_BOTTOM.from,
        {
          ...REVEAL_FROM_BOTTOM.to,
          stagger: STAGGER.CARDS,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            once: true,
          },
        },
      )
    },
    { scope: containerRef },
  )

  const { contextSafe } = useGSAP({ scope: containerRef })

  const onEnter = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, CARD_HOVER_VARS)
  })

  const onLeave = contextSafe((e: React.MouseEvent<HTMLDivElement>) => {
    gsap.to(e.currentTarget, CARD_UNHOVER_VARS)
  })

  return (
    <div ref={containerRef}>
      {/* Section header */}
      <div className="text-center mb-10">
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-cream">
          Todo lo que necesitas
        </h2>
        <p className="text-cream/40 font-body text-sm mt-2">
          Para volver a armar cualquier set, pieza por pieza.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature, i) => (
          <div
            key={i}
            data-card
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="relative p-5 rounded-brick bg-navy-50 border border-cream/8 shadow-brick cursor-default"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-brick bg-lego-yellow/10 border border-lego-yellow/20 flex items-center justify-center text-lego-yellow mb-4">
              {feature.icon}
            </div>

            {/* Badge */}
            {feature.badge && (
              <span className="absolute top-4 right-4 text-xs font-mono text-lego-yellow/70 bg-lego-yellow/10 border border-lego-yellow/20 px-2 py-0.5 rounded-full">
                {feature.badge}
              </span>
            )}

            <h3 className="font-display text-base font-semibold text-cream mb-1.5">
              {feature.title}
            </h3>
            <p className="text-sm text-cream/45 font-body leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
