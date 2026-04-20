import { useRef, useState, type InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { debounce } from '@/utils/debounce'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearch?: (value: string) => void
  debounceMs?: number
  defaultValue?: string
}

export function SearchInput({
  onSearch,
  debounceMs = 300,
  defaultValue = '',
  className,
  placeholder = 'Buscar sets, piezas...',
  ...props
}: SearchInputProps) {
  const [value, setValue] = useState(defaultValue)

  const debouncedSearch = useRef(
    debounce((val: string) => onSearch?.(val), debounceMs),
  ).current

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setValue(val)
    debouncedSearch(val)
  }

  const handleClear = () => {
    setValue('')
    onSearch?.('')
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      {/* Search icon */}
      <svg
        className="absolute left-3 w-4 h-4 text-cream/40 pointer-events-none flex-shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>

      <input
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-11 w-full rounded-brick pl-10 pr-10',
          'bg-navy-50 border border-cream/10 text-cream text-sm font-body',
          'placeholder:text-cream/30',
          'outline-none focus:border-lego-yellow/50',
          'transition-colors',
        )}
        {...props}
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-cream/30 hover:text-cream/70 transition-colors"
          type="button"
          aria-label="Limpiar búsqueda"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
