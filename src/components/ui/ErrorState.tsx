import { cn } from '@/utils/cn'
import { Button } from './Button'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 gap-4',
        className,
      )}
    >
      <div className="rounded-full bg-status-error/10 border border-status-error/20 w-20 h-20 flex items-center justify-center">
        <svg
          className="w-9 h-9 text-status-error/70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" />
        </svg>
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h3 className="font-display font-semibold text-navy/80">{title}</h3>
        <p className="text-sm text-navy/40 font-body leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
    </div>
  )
}
