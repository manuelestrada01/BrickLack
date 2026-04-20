import * as functions from 'firebase-functions'
import { adminAuth } from './lib/firestore'
import { getClaudeClient, CLAUDE_MODEL } from './lib/claude'
import { getCorsHeaders } from './lib/cors'
import { SUGGEST_SETS_SYSTEM, buildSuggestSetsPrompt } from './prompts/suggestSets'
import type { SuggestSetsRequest, SuggestSetsResponse, SetSuggestion } from './types'

export const suggestSets = functions
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
    const body = req.body as Partial<SuggestSetsRequest>
    if (!Array.isArray(body.pieces) || body.pieces.length === 0) {
      res.status(400).json({ success: false, error: 'pieces array is required' })
      return
    }

    // ── 3. Call Claude API ────────────────────────────────────────────────────
    try {
      const client = getClaudeClient()
      const prompt = buildSuggestSetsPrompt(body.pieces)

      const message = await client.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 1024,
        system: SUGGEST_SETS_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      })

      const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
      const parsed = JSON.parse(rawText) as { suggestions: SetSuggestion[] }

      const response: SuggestSetsResponse = {
        success: true,
        suggestions: parsed.suggestions ?? [],
      }
      res.status(200).json(response)
    } catch (err) {
      functions.logger.error('[suggestSets] Claude error', err)
      const response: SuggestSetsResponse = {
        success: false,
        suggestions: [],
        error: 'Set suggestion failed. Please try again.',
      }
      res.status(500).json(response)
    }
  })
