import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { compressImage } from '@/utils/imageCompression'
import { cn } from '@/utils/cn'

interface CameraCaptureProps {
  onCapture: (imageBase64: string) => void
  isLoading: boolean
}

export function CameraCapture({ onCapture, isLoading }: CameraCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropzoneRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLImageElement>(null)

  const { contextSafe } = useGSAP({ scope: dropzoneRef })

  const onDragEnter = contextSafe(() => {
    gsap.to(dropzoneRef.current, { scale: 1.02, borderColor: 'rgba(255,215,0,0.5)', duration: 0.15 })
  })

  const onDragLeave = contextSafe(() => {
    gsap.to(dropzoneRef.current, { scale: 1, borderColor: 'rgba(10,22,40,0.1)', duration: 0.15 })
  })

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return

    const base64 = await compressImage(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setTimeout(() => {
      if (previewRef.current) {
        gsap.fromTo(previewRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.5)' })
      }
    }, 50)

    onCapture(base64)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    onDragLeave()
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!dragOver) { setDragOver(true); onDragEnter() }
  }

  const handleDragLeaveEvent = () => {
    setDragOver(false)
    onDragLeave()
  }

  return (
    <div className="space-y-4">
      <div
        ref={dropzoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeaveEvent}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        className={cn(
          'relative w-full aspect-square max-w-sm mx-auto rounded-brick overflow-hidden',
          'border-2 border-dashed border-navy/10',
          'flex flex-col items-center justify-center gap-4',
          'cursor-pointer transition-colors',
          !isLoading && 'hover:border-lego-yellow/30 hover:bg-lego-yellow/2',
          isLoading && 'cursor-wait',
        )}
      >
        {/* Preview */}
        {preview && (
          <img
            ref={previewRef}
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain"
          />
        )}

        {/* Overlay when loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#F5F0E8]/80 flex flex-col items-center justify-center gap-3 z-10">
            <Spinner size="lg" />
            <p className="text-sm font-body text-navy/60">Analyzing piece…</p>
          </div>
        )}

        {/* Empty state */}
        {!preview && !isLoading && (
          <>
            <div className="w-14 h-14 rounded-full bg-navy/5 border border-navy/10 flex items-center justify-center text-navy/30">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="text-center px-4">
              <p className="text-sm font-body text-navy/50">
                Drag a photo or <span className="text-navy underline">choose a file</span>
              </p>
              <p className="text-xs text-navy/25 font-body mt-1">JPG, PNG, WEBP · max. 10MB</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="sr-only"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="w-full sm:w-auto mx-auto flex"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
        {preview ? 'Change photo' : 'Take photo'}
      </Button>
    </div>
  )
}
