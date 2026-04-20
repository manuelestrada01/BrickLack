import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { buildSearchPath } from '@/router/routePaths'
import { cn } from '@/utils/cn'

const PLACEHOLDERS = [
  'Buscar set 75192 Millennium Falcon…',
  'Buscar pieza 3001 brick 2x4…',
  'Buscar set 10305 Lion Knights Castle…',
  'Buscar pieza 6141 round plate 1x1…',
]

export function SearchBar() {
  const [query, setQuery] = useState('')
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
          'bg-navy-50 border rounded-brick overflow-hidden',
          'transition-[border-color,box-shadow] duration-200',
          focused
            ? 'border-lego-yellow/60 shadow-[0_0_0_3px_rgba(255,215,0,0.12)]'
            : 'border-cream/10',
        )}
      >
        {/* Search icon */}
        <div className="pl-4 pr-2 flex-shrink-0 text-cream/30">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { setFocused(true); onFocus() }}
          onBlur={() => { setFocused(false); onBlur() }}
          placeholder={PLACEHOLDERS[placeholderIdx]}
          className={cn(
            'flex-1 h-14 bg-transparent outline-none',
            'text-cream placeholder:text-cream/25 font-body text-base',
            'min-w-0 pr-2',
          )}
          autoComplete="off"
        />

        {/* Submit button */}
        <button
          ref={buttonRef}
          type="submit"
          className={cn(
            'flex-shrink-0 h-10 px-5 mx-2 rounded-brick',
            'bg-lego-yellow text-navy font-semibold font-body text-sm',
            'shadow-[0_3px_0_0_rgba(0,0,0,0.4)] active:shadow-none active:translate-y-[3px]',
            'hover:brightness-105 transition-[filter] duration-150',
            'flex items-center gap-2',
          )}
        >
          <span>Buscar</span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-cream/25 font-mono mt-3">
        Busca por número de set, nombre o número de pieza
      </p>
    </form>
  )
}
