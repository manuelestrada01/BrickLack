import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-cream/60 uppercase tracking-widest font-body"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-10 w-full rounded-brick px-3',
            'bg-navy-50 border text-cream text-sm font-body',
            'placeholder:text-cream/30',
            'outline-none transition-colors',
            error
              ? 'border-status-error/60 focus:border-status-error'
              : 'border-cream/10 focus:border-lego-yellow/50',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {error && (
          <p className="text-xs text-status-error font-body">{error}</p>
        )}
        {helper && !error && (
          <p className="text-xs text-cream/40 font-body">{helper}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
