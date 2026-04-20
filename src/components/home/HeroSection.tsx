import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { SearchBar } from './SearchBar'
import { STAGGER } from '@/styles/animations'

export function HeroSection() {
  const { user, isLoading } = useAuth()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const elements = containerRef.current?.querySelectorAll('[data-hero]')
      if (!elements?.length) return

      gsap.fromTo(
        elements,
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'power3.out',
          stagger: STAGGER.HERO,
        },
      )
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className="text-center space-y-8">

      {/* Heading */}
      <div data-hero className="space-y-3">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-cream leading-tight tracking-tight">
          Brick<span className="text-lego-yellow">lack</span>
        </h1>
        <p className="font-body text-lg sm:text-xl text-cream/50 max-w-lg mx-auto leading-relaxed">
          Elige tu set, importa las piezas y marca cada una que encuentres.
          Tu inventario, siempre al día.
        </p>
      </div>

      {/* Search bar */}
      <div data-hero className="w-full">
        <SearchBar />
      </div>

      {/* CTA */}
      {!isLoading && !user && (
        <div data-hero className="flex items-center justify-center gap-4 flex-wrap">
          <GoogleSignInButton size="md" />
          <p className="text-xs text-cream/30 font-body">
            Gratis. Solo con Google.
          </p>
        </div>
      )}
    </div>
  )
}
