import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'
import { useUIStore, type Toast as ToastType } from '@/stores/uiStore'

const DISMISS_AFTER_MS = 4000

const variantConfig = {
  success: {
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 text-status-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    ),
    bar: 'bg-status-success',
  },
  error: {
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 text-status-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    ),
    bar: 'bg-status-error',
  },
  warning: {
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 text-status-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
    ),
    bar: 'bg-status-warning',
  },
  info: {
    icon: (
      <svg className="w-4 h-4 flex-shrink-0 text-lego-yellow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
      </svg>
    ),
    bar: 'bg-lego-yellow',
  },
}

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useUIStore((s) => s.removeToast)
  const ref = useRef<HTMLDivElement>(null)
  const [exiting, setExiting] = useState(false)

  const dismiss = () => setExiting(true)

  useGSAP(
    () => {
      if (exiting) {
        gsap.to(ref.current, {
          x: 110, opacity: 0, duration: 0.25, ease: 'power2.in',
          onComplete: () => removeToast(toast.id),
        })
      } else {
        gsap.fromTo(
          ref.current,
          { x: 110, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.4)' },
        )
      }
    },
    { dependencies: [exiting], scope: ref },
  )

  useEffect(() => {
    const timer = setTimeout(dismiss, DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [])

  const config = variantConfig[toast.type]

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-start gap-3 w-80 max-w-full',
        'bg-white border border-navy/10 rounded-brick shadow-brick-hover',
        'px-4 py-3 overflow-hidden',
      )}
    >
      {/* Color bar */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-0.5', config.bar)} />

      {config.icon}

      <p className="flex-1 text-sm text-navy/90 font-body leading-snug pt-px">
        {toast.message}
      </p>

      <button
        onClick={dismiss}
        className="text-navy/30 hover:text-navy/70 transition-colors mt-px"
        aria-label="Close"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body,
  )
}
