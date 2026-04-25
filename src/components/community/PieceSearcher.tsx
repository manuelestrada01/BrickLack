import { useState, useRef } from 'react'
import { usePieceSearch } from '@/hooks/queries/usePieceSearch'
import { debounce } from '@/utils/debounce'
import { SOLID_COLORS, TRANS_COLORS, SPECIAL_COLORS } from '@/data/legoColors'
import type { MocPieceDoc } from '@/types'
import type { LegoColor } from '@/data/legoColors'

const COLOR_GROUPS = [
  { label: 'Solid', colors: SOLID_COLORS },
  { label: 'Transparent', colors: TRANS_COLORS },
  { label: 'Pearl / Chrome / Special', colors: SPECIAL_COLORS },
]

interface PieceSearcherProps {
  onAdd: (piece: Omit<MocPieceDoc, 'id'>) => void
}

export function PieceSearcher({ onAdd }: PieceSearcherProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedColor, setSelectedColor] = useState<LegoColor>(SOLID_COLORS[14]) // White
  const [quantity, setQuantity] = useState(1)
  const [showDropdown, setShowDropdown] = useState(false)
  const [colorSearch, setColorSearch] = useState('')

  const { data, isFetching } = usePieceSearch(debouncedQuery)

  const debouncedSet = useRef(
    debounce((val: string) => setDebouncedQuery(val), 350),
  ).current

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    debouncedSet(val)
    setShowDropdown(true)
  }

  const handleSelect = (part: { part_num: string; name: string; part_img_url: string | null }) => {
    onAdd({
      partNum: part.part_num,
      name: part.name,
      color: selectedColor.name,
      colorCode: selectedColor.hex,
      imageUrl: part.part_img_url ?? '',
      quantityRequired: quantity,
    })
    setQuery('')
    setDebouncedQuery('')
    setQuantity(1)
    setShowDropdown(false)
  }

  return (
    <div className="space-y-3 p-4 rounded-brick border border-navy/8 bg-navy/[0.02] overflow-hidden">
      <p className="text-xs font-display font-semibold text-navy/50 uppercase tracking-wider">
        Add piece
      </p>

      <div className="flex gap-2">
        {/* Search field */}
        <div className="relative flex-1">
          <input
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by name or part number…"
            className="h-9 w-full rounded-brick px-3 bg-white border border-navy/10 text-navy text-sm font-body placeholder:text-navy/30 outline-none focus:border-lego-yellow/60 transition-colors"
          />

          {/* Dropdown */}
          {showDropdown && (query.length >= 2) && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-navy/8 rounded-brick shadow-brick max-h-56 overflow-y-auto overflow-x-hidden">
              {isFetching && (
                <p className="text-xs text-navy/40 font-body px-3 py-2">Searching…</p>
              )}
              {!isFetching && (!data?.pages[0]?.results?.length) && (
                <p className="text-xs text-navy/40 font-body px-3 py-2">No results</p>
              )}
              {data?.pages.flatMap((p) => p.results).map((part) => (
                <button
                  key={part.part_num}
                  type="button"
                  onClick={() => handleSelect(part)}
                  className="flex items-center gap-3 w-full px-3 py-2 hover:bg-navy/3 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded bg-navy/5 flex-shrink-0 overflow-hidden">
                    {part.part_img_url && (
                      <img src={part.part_img_url} alt={part.name} className="w-full h-full object-contain p-0.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="text-xs font-body text-navy truncate">{part.name.length > 32 ? part.name.slice(0, 32) + '…' : part.name}</p>
                    <p className="font-mono text-[10px] text-navy/40">{part.part_num}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity */}
        <input
          type="number"
          min={1}
          max={999}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="h-9 w-16 rounded-brick px-2 bg-white border border-navy/10 text-navy text-sm font-mono text-center outline-none focus:border-lego-yellow/60 transition-colors"
        />
      </div>

      {/* Color selector */}
      <div className="space-y-2">
        {/* Selected color display + search */}
        <div className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10"
            style={{ backgroundColor: `#${selectedColor.hex}` }}
          />
          <input
            value={colorSearch}
            onChange={(e) => setColorSearch(e.target.value)}
            placeholder={`Color: ${selectedColor.name}`}
            className="flex-1 h-7 px-2 rounded-lg bg-white border border-navy/10 text-navy text-xs font-body placeholder:text-navy/40 outline-none focus:border-lego-yellow/60 transition-colors"
          />
        </div>

        {/* Color swatches grouped */}
        <div className="max-h-36 overflow-y-auto overflow-x-hidden space-y-2 w-full">
          {COLOR_GROUPS.map((group) => {
            const filtered = colorSearch
              ? group.colors.filter((c) => c.name.toLowerCase().includes(colorSearch.toLowerCase()))
              : group.colors
            if (filtered.length === 0) return null
            return (
              <div key={group.label} className="w-full">
                <p className="text-[9px] font-mono text-navy/30 uppercase tracking-wider mb-1">{group.label}</p>
                <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 20px))' }}>
                  {filtered.map((color) => (
                    <button
                      key={`${color.id}-${color.name}`}
                      type="button"
                      title={color.name}
                      onClick={() => { setSelectedColor(color); setColorSearch('') }}
                      className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                      style={{
                        backgroundColor: `#${color.hex}`,
                        boxShadow: selectedColor.id === color.id
                          ? '0 0 0 2px #fff, 0 0 0 4px #0A1628'
                          : 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
