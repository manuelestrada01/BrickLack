import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useIdentifyPiece } from '@/hooks/mutations/useIdentifyPiece'
import { CameraCapture } from '@/components/identify/CameraCapture'
import { IdentifyResult } from '@/components/identify/IdentifyResult'

export default function IdentifyPage() {
  const { user } = useAuth()
  const identifyMutation = useIdentifyPiece(user?.uid)
  const [hasResult, setHasResult] = useState(false)

  const handleCapture = async (imageBase64: string) => {
    const result = await identifyMutation.mutateAsync(imageBase64)
    if (result.success) setHasResult(true)
  }

  const handleReset = () => {
    identifyMutation.reset()
    setHasResult(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-navy">
          Identify piece
        </h1>
        <p className="text-sm text-navy/40 font-body mt-2">
          Upload a photo of a loose piece and we'll identify it instantly.
        </p>
      </div>

      {hasResult && identifyMutation.data?.data ? (
        <IdentifyResult
          result={identifyMutation.data.data}
          onReset={handleReset}
        />
      ) : (
        <div className="space-y-4">
          <CameraCapture
            onCapture={(base64) => void handleCapture(base64)}
            isLoading={identifyMutation.isPending}
          />

          {identifyMutation.isError && (
            <p className="text-sm text-status-error font-body text-center">
              {identifyMutation.error?.message ?? 'Failed to identify the piece. Please try again.'}
            </p>
          )}

          {identifyMutation.data && !identifyMutation.data.success && (
            <p className="text-sm text-status-warning font-body text-center">
              {identifyMutation.data.error ?? 'Could not identify the piece. Try a clearer photo.'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
