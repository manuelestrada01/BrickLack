import { cn } from '@/utils/cn'

export type SearchTab = 'sets' | 'pieces'

interface SearchFiltersProps {
  activeTab: SearchTab
  onTabChange: (tab: SearchTab) => void
  setCount?: number
  pieceCount?: number
}

export function SearchFilters({ activeTab, onTabChange, setCount, pieceCount }: SearchFiltersProps) {
  const tabs: { key: SearchTab; label: string; count?: number }[] = [
    { key: 'sets', label: 'Sets', count: setCount },
    { key: 'pieces', label: 'Piezas', count: pieceCount },
  ]

  return (
    <div className="flex items-center gap-1 p-1 rounded-brick bg-navy-50 border border-cream/8 w-fit">
      {tabs.map(({ key, label, count }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-[4px] text-sm font-body transition-colors',
            activeTab === key
              ? 'bg-lego-yellow text-navy font-semibold shadow-[0_1px_0_0_rgba(0,0,0,0.2)]'
              : 'text-cream/50 hover:text-cream',
          )}
        >
          {label}
          {count !== undefined && (
            <span
              className={cn(
                'text-xs font-mono px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center',
                activeTab === key
                  ? 'bg-navy/20 text-navy/70'
                  : 'bg-navy-100 text-cream/30',
              )}
            >
              {count > 999 ? '999+' : count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
