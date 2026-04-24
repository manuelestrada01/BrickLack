import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { buildSearchPath } from '@/router/routePaths'
import { cn } from '@/utils/cn'

const PLACEHOLDERS = [
  'Search set 75192 Millennium Falcon…',
  'Search part 3001 brick 2x4…',
  'Search set 10305 Lion Knights Castle…',
  'Search part 6141 round plate 1x1…',
]

interface SearchBarProps {
  defaultValue?: string
}

export function SearchBar({ defaultValue = '' }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue)
  const [focused, setFocused] = useState(false)
  const [placeholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length))
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const { contextSafe } = useGSAP({ scope: wrapperRef })

  const onFocus = contextSafe(() => {
    gsap.to(wrapperRef.current, {
      scale: 1.02,
      duration: 0.2,
      ease: 'power2.out',
    })
  })

  const onBlur = contextSafe(() => {
    if (!query) {
      gsap.to(wrapperRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.out',
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      // Shake animation
      contextSafe(() => {
        gsap.fromTo(
          wrapperRef.current,
          { x: 0 },
          { x: 8, duration: 0.06, ease: 'power1.inOut', yoyo: true, repeat: 5 },
        )
      })()
      inputRef.current?.focus()
      return
    }
    void navigate(buildSearchPath(query.trim()))
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div
        ref={wrapperRef}
        className={cn(
          'relative flex items-center gap-0',
          'bg-white/60 backdrop-blur-sm border rounded-full overflow-hidden',
          'transition-[border-color,box-shadow] duration-200',
          focused
            ? 'border-lego-yellow/70 shadow-[0_0_0_3px_rgba(255,215,0,0.15)]'
            : 'border-navy/15',
        )}
      >
        {/* Search icon */}
        <div className="pl-4 pr-2 flex-shrink-0 text-navy/35">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); onFocus() }}
          onBlur={() => { setFocused(false); onBlur() }}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          className={cn(
            'flex-1 h-14 bg-transparent outline-none',
            'text-navy placeholder:text-navy/30 font-body text-base',
            'min-w-0',
          )}
          autoComplete="off"
        />

        {/* Clear button — always reserves space, visible only when there's text */}
        <button
          type="button"
          onClick={() => { setQuery(''); inputRef.current?.focus() }}
          aria-label="Clear search"
          className={cn(
            'flex-shrink-0 w-8 flex items-center justify-center text-navy/35 hover:text-navy/70 transition-colors',
            query ? 'visible' : 'invisible',
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Submit button */}
        <button
          ref={buttonRef}
          type="submit"
          className={cn(
            'flex-shrink-0 h-9 w-9 mx-2 rounded-full',
            'bg-navy/10 text-navy hover:bg-navy/20',
            'transition-colors duration-150',
            'flex items-center justify-center',
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-navy font-mono mt-3">
        Search by set number, name, or part number
      </p>
    </form>
  )
}
