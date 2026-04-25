import { HeroSection } from '@/components/home/HeroSection'
import { OriginSection } from '@/components/home/OriginSection'
import { useUIStore } from '@/stores/uiStore'

export default function HomePage() {
  const heroMode = useUIStore((s) => s.heroMode)

  return (
    <div className="flex flex-col w-full">
      {/* ── Hero — full viewport height ── */}
      <div
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ minHeight: 'calc(100vh - 3.5rem)' }}
      >
        {/* Background */}
        {heroMode === 'video' ? (
          <video
            key="video"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '20% 72%' }}
            autoPlay
            muted
            playsInline
            aria-hidden="true"
          >
            <source src="/video/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            key="image"
            src="/video/hero-image.jpg"
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '20% center' }}
            aria-hidden="true"
          />
        )}

        {/* Content */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-16 -translate-y-[18%]">
          <HeroSection />
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-navy/30 animate-bounce">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      {/* ── Origin + How it works ── */}
      <OriginSection />
    </div>
  )
}
