export function ScanLimitReached() {
  // Calculate the first day of next month
  const now = new Date()
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const formatter = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'long' })
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
        <h3 className="font-display text-lg font-semibold text-navy">
          Monthly limit reached
        </h3>
        <p className="text-sm text-navy/50 font-body leading-relaxed">
          You've used your 3 free scans for this month. They renew on{' '}
          <span className="text-navy/80 font-semibold">{resetDateStr}</span>.
        </p>
      </div>

      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-2.5 h-2.5 rounded-full bg-navy/15" />
        ))}
      </div>
    </div>
  )
}
