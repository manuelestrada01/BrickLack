import { useRef, type HTMLAttributes } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'
import { CARD_HOVER_VARS, CARD_UNHOVER_VARS } from '@/styles/animations'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export function Card({ hoverable = false, children, className, ...props }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { contextSafe } = useGSAP({ scope: ref })

  const onMouseEnter = contextSafe(() => {
    if (!hoverable) return
    gsap.to(ref.current, CARD_HOVER_VARS)
  })

  const onMouseLeave = contextSafe(() => {
    if (!hoverable) return
    gsap.to(ref.current, CARD_UNHOVER_VARS)
  })

  return (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'bg-navy-50 border border-cream/10 rounded-brick shadow-brick',
        hoverable && 'cursor-pointer',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
