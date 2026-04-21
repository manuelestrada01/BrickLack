import { cn } from '@/utils/cn'
import type { ProjectStatus } from '@/types'

type BadgeVariant = ProjectStatus | 'high' | 'medium' | 'low' | 'default'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  in_progress: 'bg-lego-yellow/15 text-lego-yellow border-lego-yellow/30',
  completed:   'bg-status-success/15 text-status-success border-status-success/30',
  paused:      'bg-navy/8 text-navy/50 border-navy/15',
  high:        'bg-status-success/15 text-status-success border-status-success/30',
  medium:      'bg-status-warning/15 text-status-warning border-status-warning/30',
  low:         'bg-status-error/15 text-status-error border-status-error/30',
  default:     'bg-navy/8 text-navy/60 border-navy/15',
}

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  in_progress: 'In progress',
  completed: 'Completed',
  paused: 'Paused',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border font-body',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={status}>
      {variantLabels[status] ?? status}
    </Badge>
  )
}
