import { useRef } from 'react'
import { Link } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ROUTES } from '@/router/routePaths'

export function NewProjectCard() {
  const cardRef = useRef<HTMLAnchorElement>(null)

  const { contextSafe } = useGSAP({ scope: cardRef })

  const onEnter = contextSafe(() => {
    gsap.to(cardRef.current, { scale: 1.02, duration: 0.18, ease: 'power2.out' })
    const icon = cardRef.current?.querySelector('[data-icon]')
    if (icon) gsap.to(icon, { rotation: 90, scale: 1.2, duration: 0.2, ease: 'back.out(2)' })
  })

  const onLeave = contextSafe(() => {
    gsap.to(cardRef.current, { scale: 1, duration: 0.18, ease: 'power2.out' })
    const icon = cardRef.current?.querySelector('[data-icon]')
    if (icon) gsap.to(icon, { rotation: 0, scale: 1, duration: 0.2, ease: 'power2.out' })
  })

  return (
    <Link
      ref={cardRef}
      to={ROUTES.NEW_PROJECT}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex flex-col items-center justify-center gap-3 p-5 rounded-brick border border-dashed border-cream/15 hover:border-lego-yellow/30 hover:bg-lego-yellow/3 transition-[border-color,background] duration-200 min-h-[180px]"
    >
      <div
        data-icon
        className="w-10 h-10 rounded-full border border-cream/20 flex items-center justify-center text-cream/30"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <p className="text-sm font-body text-cream/40">Nuevo proyecto</p>
    </Link>
  )
}
