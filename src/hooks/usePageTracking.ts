import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { logEvent } from 'firebase/analytics'
import { analyticsPromise } from '@/config/firebase'

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    analyticsPromise.then((analytics) => {
      if (!analytics) return
      logEvent(analytics, 'page_view', {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
      })
    })
  }, [location])
}
