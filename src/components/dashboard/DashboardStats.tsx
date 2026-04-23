import { Counter } from '@/components/ui/Counter'
import type { Project } from '@/types'

interface DashboardStatsProps {
  projects: Project[]
}

export function DashboardStats({ projects }: DashboardStatsProps) {
  const total = projects.length
  const completed = projects.filter((p) => p.status === 'completed').length
  const inProgress = projects.filter((p) => p.status === 'in_progress').length
  const foundPieces = projects.reduce((sum, p) => sum + p.foundPieces, 0)

  const stats = [
    { label: 'Projects', value: total },
    { label: 'In progress', value: inProgress },
    { label: 'Completed', value: completed },
    { label: 'Pieces found', value: foundPieces },
  ]

  if (total === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ label, value }) => (
        <div
          key={label}
          className="p-4 rounded-brick bg-white border border-navy/8 text-center"
        >
          <Counter
            value={value}
            className="font-mono text-2xl font-bold text-lego-yellow block"
          />
          <p className="text-xs text-navy/60 font-body mt-1">{label}</p>
        </div>
      ))}
    </div>
  )
}
