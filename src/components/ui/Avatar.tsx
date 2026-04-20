import { cn } from '@/utils/cn'

interface AvatarProps {
  src?: string | null
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name ? getInitials(name) : '?'

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center',
        'bg-navy-100 border border-cream/10',
        sizeClasses[size],
        className,
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name ?? 'Avatar'}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className="font-display font-semibold text-cream/70">{initials}</span>
      )}
    </div>
  )
}
