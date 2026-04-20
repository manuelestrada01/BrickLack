export function ScanLimitReached() {
  // Calcular el primer día del próximo mes
  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const formatter = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long' })
  const resetDateStr = formatter.format(resetDate)

  return (
    <div className="flex flex-col items-center text-center py-12 px-6 gap-5">
      <div className="w-16 h-16 rounded-full bg-status-warning/10 border border-status-warning/20 flex items-center justify-center">
        <svg className="w-7 h-7 text-status-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>

      <div className="space-y-2 max-w-xs">
        <h3 className="font-display text-lg font-semibold text-cream">
          Límite mensual alcanzado
        </h3>
        <p className="text-sm text-cream/50 font-body leading-relaxed">
          Usaste tus 3 escaneos gratuitos de este mes. Se renuevan el{' '}
          <span className="text-cream/80 font-semibold">{resetDateStr}</span>.
        </p>
      </div>

      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-cream/15" />
        ))}
      </div>
    </div>
  )
}
