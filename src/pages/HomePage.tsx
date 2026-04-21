import { useEffect } from 'react'
import { HeroSection } from '@/components/home/HeroSection'
import { useUIStore } from '@/stores/uiStore'

export default function HomePage() {
  const heroMode = useUIStore((s) => s.heroMode)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <section
      className="flex-1 flex flex-col overflow-hidden relative"
      style={{ backgroundColor: '#F5F0E8' }}
    >
      {heroMode === 'video' ? (
        <video
          key="video"
          className="absolute inset-0 w-full h-full object-cover object-[20%_center] md:object-center"
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
          className="absolute inset-0 w-full h-full object-cover object-[20%_center] md:object-center"
          aria-hidden="true"
        />
      )}

      {/* Contenido del hero — centrado verticalmente */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full px-4">
        <div className="w-full max-w-3xl mx-auto py-16 -translate-y-[15%]">
          <HeroSection />
        </div>
      </div>
    </section>
  )
}
