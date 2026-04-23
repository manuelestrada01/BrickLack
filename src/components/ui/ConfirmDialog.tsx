import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isLoading?: boolean
  variant?: 'danger' | 'primary'
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isLoading = false,
}: ConfirmDialogProps) {
  const [shouldRender, setShouldRender] = useState(isOpen)
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setShouldRender(true)
  }, [isOpen])

  useGSAP(
    () => {
      if (!shouldRender) return

      if (isOpen) {
        // Backdrop: solo opacity, sin blur animado
        gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: 'none' })
        // Card: solo y + opacity — sin scale para evitar repaints
        gsap.fromTo(
          cardRef.current,
          { y: 12, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.25, ease: 'power3.out', delay: 0.05 },
        )
      } else {
        gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.15, ease: 'none' })
        gsap.to(cardRef.current, {
          y: 8,
          autoAlpha: 0,
          duration: 0.15,
          ease: 'power2.in',
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
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ willChange: 'opacity' }}
    >
      <div className="absolute inset-0 bg-navy/40" />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[320px] bg-white rounded-xl px-6 py-5 space-y-4"
        style={{
          boxShadow: '0 0 0 1px rgba(10,22,40,0.07), 0 16px 40px -8px rgba(10,22,40,0.22)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Title */}
        <h2 className="font-display text-base font-semibold text-navy">{title}</h2>

        {/* Message */}
        <p className="text-sm text-navy/55 font-body leading-relaxed">{message}</p>

        {/* Divider */}
        <div className="border-t border-navy/8" />

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-sm text-navy/45 font-body hover:text-navy transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="text-sm font-semibold font-body text-status-error hover:opacity-70 transition-opacity disabled:opacity-40"
          >
            {isLoading ? 'Deleting…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
