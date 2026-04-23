import { useRef, type ButtonHTMLAttributes } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-lego-yellow text-navy font-semibold hover:brightness-105 ' +
    'shadow-[0_3px_0_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[3px]',
  secondary:
    'border border-navy/20 text-navy bg-transparent ' +
    'hover:border-navy/40 hover:bg-navy/5',
  ghost:
    'text-navy/60 bg-transparent hover:text-navy hover:bg-navy/5',
  danger:
    'bg-status-error text-cream font-semibold ' +
    'shadow-[0_3px_0_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[3px]',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)

  const { contextSafe } = useGSAP({ scope: ref })

  const onMouseEnter = contextSafe(() => {
    if (disabled || isLoading) return
    gsap.to(ref.current, { scale: 1.03, duration: 0.18, ease: 'power2.out' })
  })

  const onMouseLeave = contextSafe(() => {
    gsap.to(ref.current, { scale: 1, duration: 0.18, ease: 'power2.out' })
  })

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'inline-flex items-center justify-center rounded-brick font-body',
        'transition-colors outline-none',
        'focus-visible:ring-2 focus-visible:ring-lego-yellow/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F0E8]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span className="opacity-70">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
