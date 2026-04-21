const MAX_SCANS = 3

interface ScanCounterProps {
  usedScans: number
}

export function ScanCounter({ usedScans }: ScanCounterProps) {
  const remaining = Math.max(0, MAX_SCANS - usedScans)

  return (
    <div className="flex items-center gap-3 p-3 rounded-brick bg-white border border-navy/8">
      <div className="flex gap-1">
        {[...Array(MAX_SCANS)].map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < usedScans ? 'bg-navy/15' : 'bg-lego-yellow'
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-mono text-navy/50">
        <span className="text-lego-yellow">{remaining}</span> scans remaining this month
      </p>
    </div>
  )
}
