import { FloatingBricks } from '@/components/home/FloatingBricks'
import { HeroSection } from '@/components/home/HeroSection'
import { FeatureCards } from '@/components/home/FeatureCards'

export default function HomePage() {
  return (
    <>
      {/* Hero — fondo navy con piezas flotantes */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-navy px-4">
        {/* Gradiente radial sutil desde el centro */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,215,0,0.04) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />

        {/* Piezas animadas en el fondo */}
        <FloatingBricks />

        {/* Contenido del hero */}
        <div className="relative z-10 w-full max-w-3xl mx-auto py-20">
          <HeroSection />
        </div>

        {/* Degradado inferior para transición suave a la siguiente sección */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, #0A1628)',
          }}
          aria-hidden="true"
        />
      </section>

      {/* Features */}
      <section className="relative bg-navy px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* Separador decorativo con studs */}
          <div className="flex items-center justify-center gap-2 mb-16" aria-hidden="true">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-cream/10"
                style={{ opacity: 1 - Math.abs(i - 2.5) * 0.2 }}
              />
            ))}
          </div>

          <FeatureCards />
        </div>
      </section>
    </>
  )
}
