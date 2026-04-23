import { useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { ROUTES } from '@/router/routePaths'

export default function LoginPage() {
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const from = searchParams.get('from') ?? ROUTES.DASHBOARD

  // Redirect once authenticated
  useEffect(() => {
    if (!isLoading && user) {
      void navigate(from, { replace: true })
    }
  }, [user, isLoading, navigate, from])

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">

        {/* Logo */}
        <Link to={ROUTES.HOME} className="inline-block font-display text-3xl font-bold text-navy tracking-tight">
          Brick
          <span style={{ color: '#E3000B' }}>l</span>
          <span style={{ color: '#006CB7' }}>a</span>
          <span style={{ color: '#FFD700' }}>c</span>
          <span style={{ color: '#00A650' }}>k</span>
        </Link>

        {/* Card */}
        <div className="bg-white border border-navy/8 rounded-brick p-8 space-y-6 shadow-brick">
          <div className="space-y-2">
            <h1 className="font-display text-xl font-bold text-navy">Sign in to continue</h1>
            <p className="text-sm text-navy/40 font-body">
              Track your LEGO sets and identify missing pieces.
            </p>
          </div>

          <GoogleSignInButton size="md" className="w-full" />

          <p className="text-xs text-navy/30 font-body">
            By signing in you agree to our{' '}
            <span className="text-navy/50">Terms of Service</span>.
          </p>
        </div>

      </div>
    </div>
  )
}
