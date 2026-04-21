import { useRef, useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
  maxWidth = 'md',
}: ModalProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const backdropRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setShouldRender(true)
  }, [isOpen])

  useGSAP(
    () => {
      if (!shouldRender) return

      if (isOpen) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
        gsap.fromTo(
          contentRef.current,
          { y: 20, opacity: 0, scale: 0.97 },
          { y: 0, opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' },
        )
      } else {
        gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 })
        gsap.to(contentRef.current, {
          y: 20, opacity: 0, scale: 0.97, duration: 0.2,
          onComplete: () => setShouldRender(false),
        })
      }
    },
    { dependencies: [isOpen, shouldRender] },
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  if (!shouldRender) return null

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'w-full bg-[#F5F0E8] border border-navy/10 rounded-brick shadow-sidebar',
          maxWidthClasses[maxWidth],
          className,
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10">
            <h2 id="modal-title" className="font-display font-semibold text-navy">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-navy/40 hover:text-navy transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
