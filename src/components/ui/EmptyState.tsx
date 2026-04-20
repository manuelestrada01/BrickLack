import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

const DefaultIcon = () => (
  <svg
    className="w-10 h-10 text-cream/20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* LEGO brick outline */}
    <rect x="3" y="8" width="18" height="12" rx="2" />
    <rect x="7" y="5" width="4" height="4" rx="1" />
    <rect x="13" y="5" width="4" height="4" rx="1" />
  </svg>
)

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6 gap-4',
        className,
      )}
    >
      <div className="rounded-full bg-navy-100 border border-cream/10 w-20 h-20 flex items-center justify-center">
        {icon ?? <DefaultIcon />}
      </div>
      <div className="space-y-1.5 max-w-xs">
        <h3 className="font-display font-semibold text-cream/80">{title}</h3>
        {description && (
          <p className="text-sm text-cream/40 font-body leading-relaxed">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
