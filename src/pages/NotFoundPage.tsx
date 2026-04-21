import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routePaths'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
      <p className="font-mono text-lego-yellow text-6xl font-bold">404</p>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-navy">
          Page not found
        </h1>
        <p className="text-navy/40 text-sm font-body">
          Looks like this piece isn't in the inventory.
        </p>
      </div>
      <Link to={ROUTES.HOME}>
        <Button variant="secondary" size="md">Back to home</Button>
      </Link>
    </div>
  )
}
