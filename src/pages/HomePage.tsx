import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { HeroSection } from '@/components/home/HeroSection'
import { OriginSection } from '@/components/home/OriginSection'
import { useUIStore } from '@/stores/uiStore'

function ScrollHint() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        ref.current,
        { y: 0, opacity: 0.7 },
        { y: 10, opacity: 1, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true },
      )
    },
    { scope: ref },
  )

  return (
    <div
      ref={ref}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer"
      onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
    >
<svg
        className="w-12 h-12 text-white drop-shadow-md"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

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
        <ScrollHint />
      </div>

      {/* ── Origin + How it works ── */}
      <OriginSection />
    </div>
  )
}
