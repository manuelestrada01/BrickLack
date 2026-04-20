import { useRef } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function PageTransition() {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useGSAP(
    () => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' },
      )
    },
    { dependencies: [location.pathname], scope: ref },
  )

  return (
    <div ref={ref}>
      <Outlet />
    </div>
  )
}
