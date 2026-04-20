import { Navigate, Outlet } from 'react-router'
import { useAuthStore } from '@/stores/authStore'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
