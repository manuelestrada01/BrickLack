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
        opacity: 0.5,
        duration: 0.9,
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
        'bg-navy-100',
        rounded === 'brick' && 'rounded-brick',
        rounded === 'full' && 'rounded-full',
        className,
      )}
    />
  )
}

// Skeleton presets para layouts comunes
export function SkeletonCard() {
  return (
    <div className="bg-navy-50 border border-cream/10 rounded-brick p-4 space-y-3">
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-1.5 w-full" />
    </div>
  )
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')}
        />
      ))}
    </div>
  )
}
