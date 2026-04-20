import * as functions from 'firebase-functions'
import { adminAuth, checkAndIncrementScanCount } from './lib/firestore'
import { getClaudeClient, CLAUDE_MODEL } from './lib/claude'
import { getCorsHeaders } from './lib/cors'
import { IDENTIFY_PIECE_SYSTEM, IDENTIFY_PIECE_USER } from './prompts/identifyPiece'
import type { IdentifyPieceRequest, IdentifyPieceResponse, PieceIdentification } from './types'

export const identifyPiece = functions
  .runWith({ memory: '512MB', timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    const corsHeaders = getCorsHeaders(req.headers.origin)

    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.set(corsHeaders).status(204).send('')
      return
    }

    res.set(corsHeaders)

    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' })
      return
    }

    // ── 1. Verify Firebase ID token ───────────────────────────────────────────
    const authHeader = req.headers.authorization ?? ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!idToken) {
      res.status(401).json({ success: false, error: 'Missing authorization token' })
      return
    }

    let uid: string
    try {
      const decoded = await adminAuth.verifyIdToken(idToken)
      uid = decoded.uid
    } catch {
      res.status(401).json({ success: false, error: 'Invalid authorization token' })
      return
    }

    // ── 2. Validate request body ──────────────────────────────────────────────
    const body = req.body as Partial<IdentifyPieceRequest>
    if (!body.imageBase64 || typeof body.imageBase64 !== 'string') {
      res.status(400).json({ success: false, error: 'imageBase64 is required' })
      return
    }

    // ── 3. Check and increment scan limit (server-side, in transaction) ───────
    let scanResult: Awaited<ReturnType<typeof checkAndIncrementScanCount>>
    try {
      scanResult = await checkAndIncrementScanCount(uid)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      res.status(500).json({ success: false, error: `Scan check failed: ${msg}` })
      return
    }

    if (!scanResult.allowed) {
      const response: IdentifyPieceResponse = {
        success: false,
        data: null,
        remainingScans: 0,
        error: 'Monthly scan limit reached. Your limit resets in 30 days.',
      }
      res.status(429).json(response)
      return
    }

    // ── 4. Call Claude API ────────────────────────────────────────────────────
    try {
      const client = getClaudeClient()

      // Determine media type from base64 header if present
      let mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' = 'image/jpeg'
      let imageData = body.imageBase64
      if (imageData.startsWith('data:')) {
        const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/)
        if (match) {
          mediaType = match[1] as typeof mediaType
          imageData = match[2]
        }
      }

      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        system: IDENTIFY_PIECE_SYSTEM,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: imageData },
              },
              { type: 'text', text: IDENTIFY_PIECE_USER },
            ],
          },
        ],
      })

      const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
      const identification = JSON.parse(rawText) as PieceIdentification

      const response: IdentifyPieceResponse = {
        success: true,
        data: identification,
        remainingScans: scanResult.remaining,
      }
      res.status(200).json(response)
    } catch (err) {
      // If Claude fails, we already incremented scanCount — that's acceptable
      // (don't refund on Claude errors to prevent abuse via repeated failures)
      functions.logger.error('[identifyPiece] Claude error', err)
      const response: IdentifyPieceResponse = {
        success: false,
        data: null,
        remainingScans: scanResult.remaining,
        error: 'Piece identification failed. Please try again.',
      }
      res.status(500).json(response)
    }
  })
