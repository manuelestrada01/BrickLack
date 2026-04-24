import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string | undefined

export function useRecaptcha() {
  const loaded = useRef(false)

  useEffect(() => {
    if (!SITE_KEY || loaded.current || document.querySelector('#recaptcha-script')) return
    loaded.current = true

    const script = document.createElement('script')
    script.id = 'recaptcha-script'
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    document.head.appendChild(script)
  }, [])

  async function getToken(action: string): Promise<string> {
    if (!SITE_KEY) return 'dev-token' // sin key en dev, no bloquear el flujo

    return new Promise((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(SITE_KEY, { action })
          resolve(token)
        } catch (err) {
          reject(err)
        }
      })
    })
  }

  return { getToken }
}
