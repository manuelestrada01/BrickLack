import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useTranslation } from 'react-i18next'
import { cn } from '@/utils/cn'

const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'pt', label: 'PT', name: 'Português' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'fr', label: 'FR', name: 'Français' },
]

interface LanguageSwitcherProps {
  variant?: 'navbar' | 'mobile'
}

export function LanguageSwitcher({ variant = 'navbar' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0]

  useGSAP(
    () => {
      if (!dropdownRef.current) return
      if (open) {
        gsap.set(dropdownRef.current, { display: 'flex' })
        gsap.fromTo(
          dropdownRef.current,
          { opacity: 0, y: -6, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: 'power2.out' },
        )
      } else {
        gsap.to(dropdownRef.current, {
          opacity: 0,
          y: -4,
          scale: 0.97,
          duration: 0.14,
          ease: 'power2.in',
          onComplete: () => gsap.set(dropdownRef.current, { display: 'none' }),
        })
      }
    },
    { scope: containerRef, dependencies: [open] },
  )

  const handleSelect = (code: string) => {
    void i18n.changeLanguage(code)
    setOpen(false)
  }

  // Click-outside close
  useGSAP(
    () => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    },
    { scope: containerRef },
  )

  if (variant === 'mobile') {
    return (
      <div className="flex items-center gap-1 flex-wrap px-3 py-2">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors',
              i18n.language === lang.code
                ? 'bg-lego-yellow text-navy'
                : 'text-navy/50 hover:text-navy hover:bg-navy/5',
            )}
          >
            {lang.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors',
          open ? 'bg-navy/8 text-navy' : 'text-navy/50 hover:text-navy hover:bg-navy/5',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          className={cn('w-3 h-3 transition-transform', open && 'rotate-180')}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <div
        ref={dropdownRef}
        style={{ display: 'none' }}
        className="absolute right-0 top-full mt-1.5 w-36 bg-white border border-navy/10 rounded-xl shadow-brick overflow-hidden flex-col z-50"
        role="listbox"
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            role="option"
            aria-selected={i18n.language === lang.code}
            onClick={() => handleSelect(lang.code)}
            className={cn(
              'flex items-center justify-between px-3 py-2.5 text-sm font-body transition-colors text-left w-full',
              i18n.language === lang.code
                ? 'bg-lego-yellow/10 text-navy font-semibold'
                : 'text-navy/60 hover:text-navy hover:bg-navy/[0.04]',
            )}
          >
            <span>{lang.name}</span>
            <span className="font-mono text-[10px] text-navy/30">{lang.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
