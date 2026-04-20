import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'

interface CounterProps {
  value: number
  className?: string
  prefix?: string
  suffix?: string
  duration?: number
}

export function Counter({
  value,
  className,
  prefix,
  suffix,
  duration = 0.8,
}: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const objRef = useRef({ val: 0 })

  useGSAP(
    () => {
      gsap.to(objRef.current, {
        val: value,
        duration,
        ease: 'power2.out',
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent =
              `${prefix ?? ''}${Math.round(objRef.current.val).toLocaleString('es-AR')}${suffix ?? ''}`
          }
        },
      })
    },
    { dependencies: [value] },
  )

  return (
    <span
      ref={ref}
      className={cn('font-mono tabular-nums', className)}
    >
      {prefix}{value.toLocaleString('es-AR')}{suffix}
    </span>
  )
}
