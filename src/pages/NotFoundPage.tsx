import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/router/routePaths'

export default function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 gap-6">
      <p className="font-mono text-lego-yellow text-6xl font-bold">404</p>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-semibold text-navy">
          {t('notFound.title')}
        </h1>
        <p className="text-navy/40 text-sm font-body">
          {t('notFound.desc')}
        </p>
      </div>
      <Link to={ROUTES.HOME}>
        <Button variant="secondary" size="md">{t('notFound.back')}</Button>
      </Link>
    </div>
  )
}
