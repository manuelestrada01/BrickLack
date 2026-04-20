import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-[2px]',
  md: 'w-6 h-6 border-[2px]',
  lg: 'w-10 h-10 border-[3px]',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to(ref.current, {
        rotation: 360,
        duration: 0.9,
        ease: 'none',
        repeat: -1,
      })
    },
    { scope: ref },
  )

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-full border-cream/20 border-t-lego-yellow flex-shrink-0',
        sizeClasses[size],
        className,
      )}
    />
  )
}
