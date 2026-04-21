import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number      // 0-100
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
  variant?: 'light' | 'dark'   // light = track navy/10 (sobre blanco), dark = track cream/15 (sobre navy)
}

export function ProgressBar({ value, className, showLabel = false, size = 'sm', variant = 'light' }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null)
  const clampedValue = Math.min(100, Math.max(0, value))

  useGSAP(
    () => {
      gsap.to(fillRef.current, {
        width: `${clampedValue}%`,
        duration: 0.6,
        ease: 'power2.out',
      })
    },
    { dependencies: [clampedValue] },
  )

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex-1 rounded-full overflow-hidden',
          variant === 'dark' ? 'bg-cream/10' : 'bg-navy/10',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
      >
        <div
          ref={fillRef}
          style={{ width: '0%' }}
          className={cn(
            'h-full rounded-full bg-lego-yellow',
            clampedValue === 100 && 'bg-status-success',
          )}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono text-navy/60 w-9 text-right flex-shrink-0">
          {Math.round(clampedValue)}%
        </span>
      )}
    </div>
  )
}
