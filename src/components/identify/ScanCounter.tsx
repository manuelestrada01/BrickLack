const MAX_SCANS = 3

interface ScanCounterProps {
  usedScans: number
}

export function ScanCounter({ usedScans }: ScanCounterProps) {
  const remaining = Math.max(0, MAX_SCANS - usedScans)

  return (
    <div className="flex items-center gap-3 p-3 rounded-brick bg-navy-50 border border-cream/8">
      <div className="flex gap-1">
        {[...Array(MAX_SCANS)].map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < usedScans ? 'bg-cream/20' : 'bg-lego-yellow'
            }`}
          />
        ))}
      </div>
      <p className="text-xs font-mono text-cream/50">
        <span className="text-lego-yellow">{remaining}</span> escaneos restantes este mes
      </p>
    </div>
  )
}
