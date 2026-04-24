import { useRef, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/queries/useProjects'
import { useUserMocs } from '@/hooks/queries/useUserMocs'
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { MyMocCard } from '@/components/dashboard/MyMocCard'
import { ROUTES } from '@/router/routePaths'
import { cn } from '@/utils/cn'

type Tab = 'sets' | 'mocs'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: projects } = useProjects(user?.uid)
  const { data: mocs } = useUserMocs(user?.uid)
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<Tab>(searchParams.get('tab') === 'mocs' ? 'mocs' : 'sets')

  const statsRef = useRef<HTMLDivElement>(null)
  const mocsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tab !== 'sets' || !projects || projects.length === 0) return
    gsap.fromTo(
      statsRef.current,
      { y: 16, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' },
    )
  }, [projects, tab])

  useEffect(() => {
    if (tab !== 'mocs' || !mocs || mocs.length === 0) return
    const cards = mocsRef.current?.querySelectorAll('[data-moc-card]')
    if (cards?.length) {
      gsap.fromTo(
        cards,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.07, ease: 'power3.out' },
      )
    }
  }, [mocs, tab])

  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">My projects</h1>
        {user && (
          <p className="text-sm text-navy/40 font-body mt-1">
            Welcome, {user.displayName?.split(' ')[0]}
          </p>
        )}
      </div>

      {/* Tab toggle */}
      <div className="flex justify-center">
        <div className="flex items-center bg-navy/[0.05] rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setTab('sets')}
            className={cn(
              'px-5 py-1.5 rounded-lg text-sm font-body font-medium transition-all duration-200',
              tab === 'sets'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/50 hover:text-navy',
            )}
          >
            My Sets
          </button>
          <button
            onClick={() => setTab('mocs')}
            className={cn(
              'px-5 py-1.5 rounded-lg text-sm font-body font-medium transition-all duration-200',
              tab === 'mocs'
                ? 'bg-white text-navy shadow-sm'
                : 'text-navy/50 hover:text-navy',
            )}
          >
            My MOCs
          </button>
        </div>
      </div>

      {/* My Sets tab */}
      {tab === 'sets' && (
        <>
          {projects && projects.length > 0 && (
            <div ref={statsRef} style={{ opacity: 0 }}>
              <DashboardStats projects={projects} />
            </div>
          )}
          <ProjectGrid projects={projects ?? []} />
        </>
      )}

      {/* My MOCs tab */}
      {tab === 'mocs' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Link
              to={ROUTES.NEW_MOC}
              className="flex items-center gap-1.5 text-sm font-display font-semibold text-navy/60 hover:text-navy transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Publish new
            </Link>
          </div>

          {mocs && mocs.length > 0 ? (
            <div
              ref={mocsRef}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {mocs.map((moc) => (
                <div key={moc.id} data-moc-card>
                  <MyMocCard moc={moc} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-brick border border-dashed border-navy/10 bg-navy/[0.02]">
              <p className="text-sm text-navy/40 font-body">No MOCs published yet.</p>
              <Link
                to={ROUTES.NEW_MOC}
                className="text-sm font-display font-semibold text-lego-yellow hover:brightness-90 transition-all"
              >
                Publish your first MOC →
              </Link>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
