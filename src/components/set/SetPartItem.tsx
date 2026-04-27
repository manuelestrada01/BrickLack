import type { RebrickablePart } from '@/types/rebrickable'

interface SetPartItemProps {
  part: RebrickablePart
}

export function SetPartItem({ part }: SetPartItemProps) {
  const colorHex = `#${part.color.rgb}`

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-navy/5 last:border-0">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-10 h-10 rounded bg-navy/5 border border-navy/8 flex items-center justify-center overflow-hidden">
        {part.part.part_img_url ? (
          <img
            src={part.part.part_img_url}
            alt={part.part.name}
            className="w-full h-full object-contain p-1"
            loading="lazy"
          />
        ) : (
          <svg className="w-5 h-5 text-navy/15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3" y="8" width="18" height="12" rx="2" />
            <rect x="7" y="5" width="4" height="4" rx="1" />
          </svg>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-navy/80 font-body leading-snug break-words">{part.part.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-xs text-navy/30">{part.part.part_num}</span>
          <span className="flex items-center gap-1 text-xs text-navy/30 font-body">
            <span
              className="w-2.5 h-2.5 rounded-full border border-navy/10 flex-shrink-0"
              style={{ backgroundColor: colorHex }}
            />
            {part.color.name}
          </span>
        </div>
      </div>

      {/* Quantity */}
      <div className="flex-shrink-0 text-right">
        <span className="font-mono text-sm text-navy">×{part.quantity}</span>
      </div>
    </div>
  )
}
