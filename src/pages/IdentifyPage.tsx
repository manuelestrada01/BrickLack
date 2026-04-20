import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserProfile } from '@/hooks/queries/useUserProfile'
import { useIdentifyPiece } from '@/hooks/mutations/useIdentifyPiece'
import { CameraCapture } from '@/components/identify/CameraCapture'
import { IdentifyResult } from '@/components/identify/IdentifyResult'
import { ScanCounter } from '@/components/identify/ScanCounter'
import { ScanLimitReached } from '@/components/identify/ScanLimitReached'

const MAX_SCANS = 3

export default function IdentifyPage() {
  const { user } = useAuth()
  const { data: profile } = useUserProfile(user?.uid)
  const identifyMutation = useIdentifyPiece(user?.uid)
  const [hasResult, setHasResult] = useState(false)

  const scanCount = profile?.scanCount ?? 0
  const limitReached = scanCount >= MAX_SCANS

  const handleCapture = async (imageBase64: string) => {
    if (limitReached) return
    const result = await identifyMutation.mutateAsync(imageBase64)
    if (result.success) setHasResult(true)
  }

  const handleReset = () => {
    identifyMutation.reset()
    setHasResult(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-cream">
          Identificar pieza
        </h1>
        <p className="text-sm text-cream/40 font-body mt-2">
          Sacá una foto de una pieza suelta y la IA la identifica.
        </p>
      </div>

      {/* Scan counter */}
      <ScanCounter usedScans={scanCount} />

      {/* Limit reached */}
      {limitReached ? (
        <ScanLimitReached />
      ) : hasResult && identifyMutation.data?.data ? (
        /* Result */
        <IdentifyResult
          result={identifyMutation.data.data}
          onReset={handleReset}
        />
      ) : (
        /* Camera */
        <div className="space-y-4">
          <CameraCapture
            onCapture={(base64) => void handleCapture(base64)}
            isLoading={identifyMutation.isPending}
          />

          {identifyMutation.isError && (
            <p className="text-sm text-status-error font-body text-center">
              {identifyMutation.error?.message ?? 'Error al identificar la pieza. Intentá de nuevo.'}
            </p>
          )}

          {identifyMutation.data && !identifyMutation.data.success && (
            <p className="text-sm text-status-warning font-body text-center">
              {identifyMutation.data.error ?? 'No se pudo identificar la pieza. Intentá con una foto más clara.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
