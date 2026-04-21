import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useProject } from '@/hooks/queries/useProject'
import { useProjectPieces } from '@/hooks/queries/useProjectPieces'
import { useTogglePiece } from '@/hooks/mutations/useTogglePiece'
import { useUpdateProject } from '@/hooks/mutations/useUpdateProject'
import { useDeleteProject } from '@/hooks/mutations/useDeleteProject'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ROUTES } from '@/router/routePaths'
import type { ProjectPiece } from '@/types'

// ─── Piece Card ───────────────────────────────────────────────────────────────

function PieceCard({ piece, userId, projectId }: { piece: ProjectPiece; userId: string; projectId: string }) {
  const toggle = useTogglePiece()
  const colorHex = piece.colorCode ? `#${piece.colorCode}` : '#aaa'
  const found = piece.quantityFound
  const required = piece.quantityRequired
  const done = piece.isComplete

  const mutate = (qty: number) =>
    toggle.mutate({ userId, projectId, pieceId: piece.id, quantityFound: qty, quantityRequired: required })

  return (
    <div className={`relative flex flex-col rounded-xl border overflow-hidden select-none transition-colors ${done ? 'bg-green-50/60 border-green-200' : 'bg-white border-navy/10'}`}>
      {/* Checkbox */}
      <div
        onClick={() => mutate(done ? 0 : required)}
        className={`absolute top-2 right-2 w-5 h-5 rounded border flex items-center justify-center z-10 cursor-pointer transition-colors ${done ? 'bg-green-500 border-green-500' : 'border-navy/20 bg-white/90 hover:border-navy/40'}`}
      >
        {done && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-navy/[0.04] flex items-center justify-center overflow-hidden">
        {piece.imageUrl
          ? <img src={piece.imageUrl} alt={piece.name} className={`w-full h-full object-contain p-3 transition-opacity ${done ? 'opacity-40' : ''}`} loading="lazy" />
          : <div className="w-8 h-8 rounded bg-navy/10" />
        }
      </div>

      {/* Info */}
      <div className="px-2.5 pt-2 pb-1.5 flex-1 space-y-0.5">
        <p className={`text-xs leading-snug line-clamp-2 font-medium ${done ? 'text-navy/35 line-through' : 'text-navy'}`}>{piece.name}</p>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full border border-navy/10 flex-shrink-0" style={{ backgroundColor: colorHex }} />
          <span className="text-[10px] text-navy/50 truncate">{piece.color}</span>
        </div>
        <p className="font-mono text-[10px] text-navy/35">{piece.partNum}</p>
      </div>

      {/* Counter */}
      <div className="flex items-center border-t border-navy/8">
        <button onClick={() => found > 0 && mutate(found - 1)} disabled={found <= 0}
          className="flex-1 py-2 flex items-center justify-center text-navy/40 hover:text-navy hover:bg-navy/5 disabled:opacity-20 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M5 12h14" /></svg>
        </button>
        <div className="px-2 py-2 border-x border-navy/8 flex items-baseline gap-0.5">
          <span className={`font-mono text-sm font-semibold leading-none ${done ? 'text-green-500' : found > 0 ? 'text-navy' : 'text-navy/30'}`}>{found}</span>
          <span className="font-mono text-[10px] text-navy/30 leading-none">/{required}</span>
        </div>
        <button onClick={() => found < required && mutate(found + 1)} disabled={found >= required}
          className="flex-1 py-2 flex items-center justify-center text-navy/40 hover:text-navy hover:bg-navy/5 disabled:opacity-20 transition-colors">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const GRID = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3'

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: project } = useProject(user?.uid, projectId)
  const { data: pieces } = useProjectPieces(user?.uid, projectId)

  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const [showDelete, setShowDelete] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'missing' | 'found'>('all')

  // Refs for GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const animatedProject = useRef(false)
  const animatedPieces = useRef(false)

  // Animate header + progress once project loads
  useEffect(() => {
    if (project && !animatedProject.current) {
      animatedProject.current = true
      gsap.fromTo(
        [headerRef.current, progressRef.current],
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
      )
    }
  }, [project])

  // Animate piece list + grid once pieces load
  useEffect(() => {
    if (pieces && !animatedPieces.current) {
      animatedPieces.current = true
      gsap.fromTo(
        listRef.current,
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', delay: 0.15 },
      )
      const cards = gridRef.current?.children
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { y: 20, opacity: 0, scale: 0.96 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, stagger: 0.02, ease: 'power3.out', clearProps: 'transform,opacity', delay: 0.25 },
        )
      }
    }
  }, [pieces])

  const progress = project && project.totalPieces > 0 ? (project.foundPieces / project.totalPieces) * 100 : 0
  const remaining = project ? project.totalPieces - project.foundPieces : 0

  const filtered = (pieces ?? []).filter((p) => {
    const q = search.toLowerCase()
    const match = p.name.toLowerCase().includes(q) || p.partNum.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
    if (filter === 'missing') return match && !p.isComplete
    if (filter === 'found') return match && p.isComplete
    return match
  })

  return (
    <div className="w-full max-w-[90rem] mx-auto px-6 py-8 space-y-8">

      {/* ── Header ── */}
      {project && (
        <div ref={headerRef} className="flex items-center gap-4" style={{ opacity: 0 }}>
          {project.setImageUrl && (
            <div className="w-20 h-20 flex-shrink-0 rounded-xl border border-navy/10 bg-white overflow-hidden flex items-center justify-center">
              <img src={project.setImageUrl} alt={project.name} className="w-full h-full object-contain p-1" />
            </div>
          )}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lego-yellow/20 text-lego-yellow border border-lego-yellow/30 font-body">
                {project.status === 'in_progress' ? 'In progress' : project.status === 'paused' ? 'Paused' : 'Completed'}
              </span>
              {project.setId && <span className="text-sm text-navy/40 font-mono">{project.setId}</span>}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy leading-tight">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {project.status !== 'completed' && (
              <button
                onClick={() => updateProject.mutate({ userId: user!.uid, projectId: project.id, data: { status: project.status === 'in_progress' ? 'paused' : 'in_progress' } })}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body text-navy/60 hover:text-navy hover:bg-navy/5 transition-colors border border-navy/10"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  {project.status === 'in_progress'
                    ? <><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></>
                    : <polygon points="5 3 19 12 5 21 5 3" />}
                </svg>
                {project.status === 'in_progress' ? 'Pause' : 'Resume'}
              </button>
            )}
            <button
              onClick={() => setShowDelete(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-body bg-status-error text-white hover:bg-status-error/90 transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ── Progress ── */}
      {project && (
        <div ref={progressRef} className="p-5 rounded-xl border border-navy/8 bg-white space-y-4" style={{ opacity: 0 }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-navy/40 font-body uppercase tracking-wider">Progress</p>
              <p className="font-mono text-3xl font-bold text-lego-yellow mt-0.5">{Math.round(progress)}%</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg font-semibold text-navy">
                {project.foundPieces.toLocaleString()}
                <span className="text-navy/30 font-normal text-sm"> / {project.totalPieces.toLocaleString()}</span>
              </p>
              <p className="text-xs text-navy/40 font-body mt-0.5">
                {remaining > 0 ? `${remaining.toLocaleString()} remaining` : 'Complete!'}
              </p>
            </div>
          </div>
          <ProgressBar value={progress} size="md" />
        </div>
      )}

      {/* Width anchor — keeps container full-width while pieces load */}
      {!pieces && <div className="w-full min-h-[40vh]" />}

      {/* ── Piece list ── */}
      {pieces && (
        <div ref={listRef} className="space-y-4" style={{ opacity: 0 }}>
          <div className="border-t border-navy/8" />
          <h2 className="font-display text-lg font-semibold text-navy">Piece list</h2>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by name, number, or color…"
                className="w-full h-9 pl-9 pr-3 rounded-lg bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/25 outline-none focus:border-lego-yellow/40 transition-colors"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white border border-navy/8 w-fit">
              {(['all', 'missing', 'found'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs transition-colors ${filter === f ? 'bg-lego-yellow text-navy font-semibold' : 'text-navy/50 hover:text-navy'}`}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs font-mono text-navy/35">{filtered.length} of {pieces.length} pieces</p>

          {filtered.length === 0
            ? <p className="py-12 text-center text-sm text-navy/30">No pieces match your filter.</p>
            : <div ref={gridRef} className={GRID}>
                {filtered.map(piece => (
                  <PieceCard key={piece.id} piece={piece} userId={user!.uid} projectId={projectId!} />
                ))}
              </div>
          }
        </div>
      )}

      {/* ── Delete dialog ── */}
      {project && (
        <ConfirmDialog
          isOpen={showDelete}
          onClose={() => setShowDelete(false)}
          onConfirm={async () => {
            await deleteProject.mutateAsync({ userId: user!.uid, projectId: project.id })
            void navigate(ROUTES.DASHBOARD)
          }}
          title="Delete project"
          message={`Are you sure you want to delete "${project.name}"? This action cannot be undone.`}
          confirmLabel="Yes, delete"
          isLoading={deleteProject.isPending}
        />
      )}
    </div>
  )
}
