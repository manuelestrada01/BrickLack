import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { useCreateMoc } from '@/hooks/mutations/useCreateMoc'
import { PieceSearcher } from '@/components/community/PieceSearcher'
import { buildCommunityDetailPath, ROUTES } from '@/router/routePaths'
import type { MocPieceDoc } from '@/types'

async function resizeImageToFile(file: File, maxDimension = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Failed to compress image'))
          resolve(new File([blob], file.name, { type: 'image/jpeg' }))
        },
        'image/jpeg',
        0.88,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')) }
    img.src = objectUrl
  })
}

export default function NewMocPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const createMoc = useCreateMoc()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pieces, setPieces] = useState<Omit<MocPieceDoc, 'id'>[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const compressed = await resizeImageToFile(file, 1200)
    setCoverFile(compressed)
    setCoverPreview(URL.createObjectURL(compressed))
  }

  const handleAddPiece = (piece: Omit<MocPieceDoc, 'id'>) => {
    setPieces((prev) => [...prev, piece])
  }

  const handleRemovePiece = (index: number) => {
    setPieces((prev) => prev.filter((_, i) => i !== index))
  }

  const totalPieces = pieces.reduce((sum, p) => sum + p.quantityRequired, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Give your MOC a name.')
    if (!coverFile) return setError('A photo of your MOC is required.')
    if (pieces.length === 0) return setError('Add at least one piece.')

    try {
      const mocId = await createMoc.mutateAsync({
        userId: user!.uid,
        authorName: user!.displayName ?? 'Anonymous',
        authorPhotoURL: user!.photoURL ?? '',
        name: name.trim(),
        description: description.trim(),
        coverImage: coverFile,
        pieces,
      })

      navigate(buildCommunityDetailPath(mocId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish MOC.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm font-body">
        <Link to={ROUTES.COMMUNITY} className="text-navy/40 hover:text-navy transition-colors">
          Community
        </Link>
        <svg className="w-3.5 h-3.5 text-navy/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
        <span className="text-navy/70">Publish MOC</span>
      </nav>

      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">Publish your MOC</h1>
        <p className="text-sm text-navy/40 font-body mt-2">
          Share your LEGO creation with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cover image */}
        <div className="space-y-2">
          <label className="text-xs font-display font-semibold text-navy/50 uppercase tracking-wider block">
            Photo <span className="text-status-error">*</span>
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-56 rounded-brick border-2 border-dashed border-navy/15 bg-navy/3 hover:border-lego-yellow/60 hover:bg-lego-yellow/5 transition-all flex items-center justify-center overflow-hidden"
          >
            {coverPreview ? (
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center space-y-2 text-navy/40">
                <svg className="w-10 h-10 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
                <p className="text-sm font-body">Click to upload a photo of your MOC</p>
                <p className="text-xs">JPG, PNG, WebP — max 5MB</p>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-display font-semibold text-navy/50 uppercase tracking-wider block">
            Name <span className="text-status-error">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mini Eiffel Tower"
            maxLength={80}
            className="h-10 w-full rounded-brick px-3 bg-white border border-navy/10 text-navy text-sm font-body placeholder:text-navy/30 outline-none focus:border-lego-yellow/60 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-display font-semibold text-navy/50 uppercase tracking-wider block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your creation, inspiration, difficulty…"
            rows={3}
            maxLength={500}
            className="w-full rounded-brick px-3 py-2.5 bg-white border border-navy/10 text-navy text-sm font-body placeholder:text-navy/30 outline-none focus:border-lego-yellow/60 transition-colors resize-none"
          />
        </div>

        {/* Pieces */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-display font-semibold text-navy/50 uppercase tracking-wider">
              Pieces <span className="text-status-error">*</span>
            </label>
            {pieces.length > 0 && (
              <span className="font-mono text-xs text-navy/40">
                {pieces.length} types · {totalPieces} total
              </span>
            )}
          </div>

          <PieceSearcher onAdd={handleAddPiece} />

          {/* Pieces list */}
          {pieces.length > 0 && (
            <div className="divide-y divide-navy/5 rounded-brick border border-navy/8 bg-white overflow-hidden">
              {pieces.map((piece, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="w-8 h-8 rounded bg-navy/5 flex-shrink-0 overflow-hidden">
                    {piece.imageUrl && (
                      <img src={piece.imageUrl} alt={piece.name} className="w-full h-full object-contain p-0.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-body text-navy truncate">{piece.name.length > 32 ? piece.name.slice(0, 32) + '…' : piece.name}</p>
                    <p className="font-mono text-[10px] text-navy/40">
                      {piece.partNum} ·{' '}
                      <span
                        className="inline-block w-2 h-2 rounded-full align-middle mr-0.5"
                        style={{ backgroundColor: `#${piece.colorCode}` }}
                      />
                      {piece.color}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-navy/70 flex-shrink-0">
                    ×{piece.quantityRequired}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePiece(i)}
                    className="text-navy/25 hover:text-status-error transition-colors"
                    aria-label="Remove"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-status-error font-body bg-status-error/5 border border-status-error/20 rounded-brick px-4 py-3">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={createMoc.isPending}
          className="w-full h-11 bg-lego-yellow text-navy font-display font-semibold rounded-brick shadow-brick hover:brightness-105 transition-all disabled:opacity-50"
        >
          {createMoc.isPending ? 'Publishing…' : 'Publish MOC'}
        </button>

        <p className="text-center text-xs text-navy/30 font-body">
          MOCs are subject to community guidelines.
        </p>
      </form>
    </div>
  )
}
