import * as functions from 'firebase-functions'
import { adminAuth } from './lib/firestore'
import { callBrickognize } from './lib/brickognize'
import { getCorsHeaders } from './lib/cors'
import type { IdentifyPieceRequest, IdentifyPieceResponse } from './types'

export const identifyPiece = functions
  .runWith({ memory: '512MB', timeoutSeconds: 60 })
  .https.onRequest(async (req, res) => {
    const corsHeaders = getCorsHeaders(req.headers.origin)

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

    try {
      await adminAuth.verifyIdToken(idToken)
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

    // ── 3. Decode base64 → Buffer ─────────────────────────────────────────────
    let imageData = body.imageBase64
    let mimeType = 'image/jpeg'

    if (imageData.startsWith('data:')) {
      const match = imageData.match(/^data:(image\/\w+);base64,(.+)$/)
      if (match) {
        mimeType = match[1]
        imageData = match[2]
      }
    }

    const imageBuffer = Buffer.from(imageData, 'base64')

    // ── 4. Call Brickognize ───────────────────────────────────────────────────
    try {
      const item = await callBrickognize(imageBuffer, mimeType)

      if (!item) {
        const response: IdentifyPieceResponse = {
          success: false,
          data: null,
          error: 'No piece found. Try a clearer photo.',
        }
        res.status(200).json(response)
        return
      }

      const response: IdentifyPieceResponse = {
        success: true,
        data: {
          partNum: item.id,
          name: item.name,
          imgUrl: item.img_url,
          score: item.score,
        },
      }
      res.status(200).json(response)
    } catch (err) {
      functions.logger.error('[identifyPiece] Brickognize error', err)
      res.status(500).json({
        success: false,
        data: null,
        error: 'Piece identification failed. Please try again.',
      })
    }
  })
