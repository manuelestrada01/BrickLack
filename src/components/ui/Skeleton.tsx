import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  rounded?: 'none' | 'brick' | 'full'
}

export function Skeleton({ className, rounded = 'brick' }: SkeletonProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to(ref.current, {
        opacity: 0.45,
        duration: 1.0,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    },
    { scope: ref },
  )

  return (
    <div
      ref={ref}
      className={cn(
        'bg-navy/[0.12]',
        rounded === 'brick' && 'rounded-brick',
        rounded === 'full' && 'rounded-full',
        className,
      )}
    />
  )
}
