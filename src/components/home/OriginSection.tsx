import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)


const STEPS = [
  {
    num: '01',
    title: 'Search your set',
    description: 'Find any LEGO set by name or number. Over 22,000 sets in the catalog, updated automatically.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Import the inventory',
    description: 'We pull the complete piece list automatically. Every part, color and quantity — no manual entry.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Mark what you find',
    description: 'Go piece by piece through your bins. Check off each one as you find it — progress saves in real time.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Complete the set',
    description: 'Watch the progress bar fill up piece by piece. Know exactly what you still need to rebuild.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
  },
]

// ── Story section ──────────────────────────────────────────────────────────────

function StoryBlock() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo('[data-accent-bar]', { scaleY: 0, transformOrigin: 'top' }, {
        scaleY: 1, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
      })
      gsap.fromTo('[data-line]', { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.14,
        scrollTrigger: { trigger: ref.current, start: 'top 78%', once: true },
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="max-w-2xl">
      <p data-line className="font-mono text-xs text-navy tracking-widest uppercase mb-6">
        The story
      </p>
      <div className="flex gap-5">
        <div data-accent-bar className="w-1 rounded-full bg-lego-yellow flex-shrink-0 self-stretch" />
        <div className="space-y-4">
          <p data-line className="font-display text-2xl sm:text-3xl font-bold text-navy leading-snug">
            Bricklack was born in a box of missing pieces.
          </p>
          <p data-line className="font-body text-base sm:text-lg text-navy/60 leading-relaxed">
            Growing up, sets would get taken apart, pieces would wander off — usually into a sibling's room — and years later, when you finally wanted to rebuild that castle or spaceship, half the inventory was gone.
          </p>
          <p data-line className="font-body text-base sm:text-lg text-navy/60 leading-relaxed">
            There was no way to know what you had, what you were missing, or where to even start.
          </p>
          <p data-line className="font-body text-base sm:text-lg text-navy/60 leading-relaxed">
            So we built the tool we always needed.
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Desktop zigzag roadmap ─────────────────────────────────────────────────────

function ZigzagRoadmap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current || !pathRef.current || !svgRef.current) return

      const containerEl = containerRef.current
      const containerRect = containerEl.getBoundingClientRect()

      // Measure node centers
      const nodeDots = containerEl.querySelectorAll('[data-node-dot]')
      const positions = Array.from(nodeDots).map((el) => {
        const r = el.getBoundingClientRect()
        return {
          x: r.left + r.width / 2 - containerRect.left,
          y: r.top + r.height / 2 - containerRect.top,
        }
      })

      if (positions.length < 2) return

      // S-curve through all node centers
      let d = `M ${positions[0].x} ${positions[0].y}`
      for (let i = 1; i < positions.length; i++) {
        const p = positions[i - 1]
        const c = positions[i]
        const mid = (p.y + c.y) / 2
        d += ` C ${p.x} ${mid}, ${c.x} ${mid}, ${c.x} ${c.y}`
      }

      pathRef.current.setAttribute('d', d)
      svgRef.current.setAttribute('viewBox', `0 0 ${containerRect.width} ${containerRect.height}`)

      const len = pathRef.current.getTotalLength()
      gsap.set(pathRef.current, { strokeDasharray: len, strokeDashoffset: len })

      // Draw the path on scroll — reverses when scrolling back up
      gsap.fromTo(pathRef.current,
        { strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          duration: 1.2,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: containerEl,
            start: 'top 65%',
            toggleActions: 'play reverse play reverse',
          },
        },
      )

      // Animate each step
      containerEl.querySelectorAll('[data-step]').forEach((step, i) => {
        const dot = step.querySelector('[data-node-dot]')
        const card = step.querySelector('[data-card]')
        const isLeft = i % 2 === 0
        const trigger = { trigger: step, start: 'top 74%', toggleActions: 'play reverse play reverse' }

        if (dot) {
          gsap.fromTo(dot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)', scrollTrigger: trigger },
          )
          gsap.fromTo(dot,
            { backgroundColor: '#F5F0E8', borderColor: 'rgba(10,22,40,0.2)' },
            { backgroundColor: '#FBBC05', borderColor: '#FBBC05', duration: 0.3, scrollTrigger: trigger },
          )
        }

        if (card) {
          gsap.fromTo(card,
            { x: isLeft ? 30 : -30, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.55, ease: 'power2.out', scrollTrigger: trigger },
          )
        }
      })
    },
    { scope: containerRef },
  )

  return (
    <div ref={containerRef} className="relative">
      {/* SVG connecting line */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        aria-hidden
      >
        <path
          ref={pathRef}
          fill="none"
          stroke="#FBBC05"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="8 5"
        />
      </svg>

      {/* Steps */}
      <div className="space-y-0">
        {STEPS.map((step, i) => {
          const isLeft = i % 2 === 0

          return (
            <div
              key={step.num}
              data-step
              className={`relative flex items-center gap-6 ${i < STEPS.length - 1 ? 'pb-14' : ''}`}
            >
              {isLeft ? (
                <>
                  {/* Spacer */}
                  <div className="w-1/4 flex-shrink-0" />
                  {/* Node */}
                  <Node step={step} />
                  {/* Card */}
                  <div data-card className="flex-1">
                    <StepCard step={step} />
                  </div>
                </>
              ) : (
                <>
                  {/* Card */}
                  <div data-card className="flex-1">
                    <StepCard step={step} />
                  </div>
                  {/* Node */}
                  <Node step={step} />
                  {/* Spacer */}
                  <div className="w-1/4 flex-shrink-0" />
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Mobile vertical timeline ───────────────────────────────────────────────────

function VerticalTimeline() {
  const timelineRef = useRef<HTMLDivElement>(null)
  const progressLineRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!timelineRef.current) return

      gsap.set(progressLineRef.current, { scaleY: 0 })
      gsap.to(progressLineRef.current, {
        scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 65%', end: 'bottom 85%', scrub: 0.6,
        },
      })

      timelineRef.current.querySelectorAll('[data-step]').forEach((step) => {
        const dot = step.querySelector('[data-node-dot]')
        const card = step.querySelector('[data-card]')
        const trigger = { trigger: step, start: 'top 72%', toggleActions: 'play reverse play reverse' }

        if (dot) {
          gsap.fromTo(dot, { scale: 0.5, opacity: 0 }, {
            scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)', scrollTrigger: trigger,
          })
          gsap.fromTo(dot,
            { backgroundColor: '#F5F0E8', borderColor: 'rgba(10,22,40,0.2)' },
            { backgroundColor: '#FBBC05', borderColor: '#FBBC05', duration: 0.3, scrollTrigger: trigger },
          )
        }
        if (card) {
          gsap.fromTo(card, { x: 20, opacity: 0 }, {
            x: 0, opacity: 1, duration: 0.5, ease: 'power2.out', scrollTrigger: trigger,
          })
        }
      })
    },
    { scope: timelineRef },
  )

  return (
    <div ref={timelineRef} className="relative">
      <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-navy/10 rounded-full" aria-hidden />
      <div ref={progressLineRef} className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-lego-yellow rounded-full origin-top" aria-hidden />

      <div className="space-y-0">
        {STEPS.map((step, i) => (
          <div key={step.num} data-step className={`relative flex gap-6 ${i < STEPS.length - 1 ? 'pb-10' : ''}`}>
            <div className="relative z-10 flex-shrink-0">
              <NodeDot icon={step.icon} />
            </div>
            <div data-card className="flex-1">
              <StepCard step={step} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function NodeDot({ icon }: { icon: React.ReactNode }) {
  return (
    <div
      data-node-dot
      className="w-10 h-10 rounded-full border-2 border-navy/20 bg-[#F5F0E8] flex items-center justify-center text-navy/60 [&>svg]:w-4 [&>svg]:h-4"
    >
      {icon}
    </div>
  )
}

function Node({ step }: { step: typeof STEPS[number] }) {
  return (
    <div className="relative z-10 flex-shrink-0">
      <NodeDot icon={step.icon} />
    </div>
  )
}

function StepCard({ step }: { step: typeof STEPS[number] }) {
  return (
    <div className="bg-white rounded-full border border-navy/8 shadow-brick px-6 py-5 text-center">
      <h3 className="font-display text-base font-semibold text-navy mb-1">{step.title}</h3>
      <p className="font-body text-sm text-navy/50 leading-relaxed">{step.description}</p>
    </div>
  )
}

// ── Main export ────────────────────────────────────────────────────────────────

export function OriginSection() {
  return (
    <section className="bg-[#F5F0E8] border-t border-navy/6">
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28 space-y-20 sm:space-y-28">

        <StoryBlock />

        <div>
          <p className="font-mono text-xs text-navy tracking-widest uppercase mb-2">
            How it works
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy mb-12">
            Four steps to rebuild anything.
          </h2>

          {/* Desktop zigzag */}
          <div className="hidden md:block">
            <ZigzagRoadmap />
          </div>

          {/* Mobile vertical timeline */}
          <div className="md:hidden">
            <VerticalTimeline />
          </div>
        </div>

      </div>
    </section>
  )
}
