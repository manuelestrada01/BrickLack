import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAuth } from '@/hooks/useAuth'
import { useCreateProject } from '@/hooks/mutations/useCreateProject'
import { useSetSearch } from '@/hooks/queries/useSetSearch'
import { useDebounce } from '@/utils/debounce'
import { Button } from '@/components/ui/Button'
import { buildProjectPath } from '@/router/routePaths'
import type { LegoSet } from '@/types/set'

export function NewProjectForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const createProject = useCreateProject()

  const [projectName, setProjectName] = useState('')
  const [setQuery, setSetQuery] = useState('')
  const [selectedSet, setSelectedSet] = useState<LegoSet | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const debouncedQuery = useDebounce(setQuery, 350)
  const { data: searchResults } = useSetSearch(debouncedQuery)

  const formRef = useRef<HTMLFormElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        formRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' },
      )
    },
    { scope: formRef },
  )

  const handleSelectSet = (set: LegoSet) => {
    setSelectedSet(set)
    setSetQuery(set.name)
    if (!projectName) setProjectName(set.name)
    setShowSuggestions(false)
  }

  const handleClearSet = () => {
    setSelectedSet(null)
    setSetQuery('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !projectName.trim()) return

    const projectId = await createProject.mutateAsync({
      userId: user.uid,
      name: projectName.trim(),
      setId: selectedSet?.setNum ?? null,
      setName: selectedSet?.name ?? null,
      setImageUrl: selectedSet?.setImgUrl ?? null,
    })

    void navigate(buildProjectPath(projectId))
  }

  const suggestions = showSuggestions ? searchResults?.results.slice(0, 6) : []

  return (
    <form ref={formRef} onSubmit={(e) => void handleSubmit(e)} className="space-y-6 max-w-lg">
      {/* Set selection */}
      <div className="space-y-1.5">
        <label className="text-sm font-body text-navy/60">
          LEGO Set <span className="text-navy/30">(optional)</span>
        </label>

        {selectedSet ? (
          <div className="flex items-center gap-3 p-3 rounded-brick bg-white border border-lego-yellow/30">
            {selectedSet.setImgUrl && (
              <img src={selectedSet.setImgUrl} alt={selectedSet.name} className="w-10 h-10 object-contain rounded flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-navy truncate font-body">{selectedSet.name}</p>
              <p className="text-xs font-mono text-lego-yellow/60">{selectedSet.setNum} · {selectedSet.numParts.toLocaleString()} pieces</p>
            </div>
            <button
              type="button"
              onClick={handleClearSet}
              className="text-navy/30 hover:text-navy transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="search"
              value={setQuery}
              onChange={(e) => { setSetQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setQuery.length >= 2 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search set by name or number…"
              className="w-full h-10 pl-9 pr-3 rounded-brick bg-white border border-navy/10 text-sm text-navy placeholder:text-navy/25 font-body outline-none focus:border-lego-yellow/40 transition-colors"
            />
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy/25 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>

            {suggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 z-20 bg-[#F5F0E8] border border-navy/10 rounded-brick shadow-sidebar overflow-hidden">
                {suggestions.map((set) => (
                  <button
                    key={set.setNum}
                    type="button"
                    onMouseDown={() => handleSelectSet(set)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-navy/5 transition-colors text-left"
                  >
                    {set.setImgUrl && (
                      <img src={set.setImgUrl} alt="" className="w-8 h-8 object-contain flex-shrink-0 rounded" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-navy truncate font-body">{set.name}</p>
                      <p className="text-xs font-mono text-navy/30">{set.setNum} · {set.numParts.toLocaleString()}p</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-navy/30 font-body">
          If you select a set, we'll import its complete piece inventory.
        </p>
      </div>

      {/* Project name */}
      <div className="space-y-1.5">
        <label className="text-sm font-body text-navy/60">
          Project name <span className="text-status-error">*</span>
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="My collection…"
          required
          className="w-full h-10 px-3 rounded-brick bg-white border border-navy/10 text-sm text-navy font-body outline-none focus:border-lego-yellow/40 transition-colors"
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        isLoading={createProject.isPending}
        disabled={!projectName.trim()}
        className="w-full sm:w-auto"
      >
        {selectedSet ? 'Create project and import pieces' : 'Create project'}
      </Button>

      {createProject.isError && (
        <p className="text-sm text-status-error font-body">
          Failed to create the project. Please try again.
        </p>
      )}
    </form>
  )
}
