import * as functions from 'firebase-functions'
import BadWords from 'bad-words'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Filter = (BadWords as any).default ?? BadWords
import { adminAuth } from './lib/firestore'
import { getCorsHeaders } from './lib/cors'
import type { ModerateMocRequest, ModerateMocResponse } from './types'

// Spanish offensive words not covered by bad-words default list
const SPANISH_WORDS = [
  'puta', 'puto', 'putas', 'putos',
  'mierda', 'mierdas',
  'coño', 'coños',
  'pendejo', 'pendeja', 'pendejos', 'pendejas',
  'cabrón', 'cabrona', 'cabrones',
  'joder', 'hostia', 'hostias',
  'culo', 'culos',
  'verga', 'vergas',
  'chingar', 'chingada', 'chingado', 'chingadera',
  'culero', 'culera',
  'maricón', 'marica',
  'pinche', 'pinches',
  'wey', 'guey', // context-neutral but flagging common combos via filter
  'cabron', 'cabrona',
  'maldito', 'maldita',
  'idiota', 'idiotas',
  'imbécil', 'imbecil',
  'estúpido', 'estupido', 'estúpida', 'estupida',
]

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
const filter = new Filter()
// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
filter.addWords(...SPANISH_WORDS)

function containsOffensiveContent(text: string): boolean {
  if (!text.trim()) return false
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return filter.isProfane(text) as boolean
  } catch {
    return false
  }
}

export const moderateMoc = functions
  .runWith({ memory: '256MB', timeoutSeconds: 10 })
  .https.onRequest(async (req, res) => {
    const corsHeaders = getCorsHeaders(req.headers.origin)

    if (req.method === 'OPTIONS') {
      res.set(corsHeaders).status(204).send('')
      return
    }

    res.set(corsHeaders)

    if (req.method !== 'POST') {
      res.status(405).json({ allowed: false, reason: 'Method not allowed' })
      return
    }

    // ── 1. Verify Firebase ID token ───────────────────────────────────────────
    const authHeader = req.headers.authorization ?? ''
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!idToken) {
      res.status(401).json({ allowed: false, reason: 'Missing authorization token' })
      return
    }

    try {
      await adminAuth.verifyIdToken(idToken)
    } catch {
      res.status(401).json({ allowed: false, reason: 'Invalid authorization token' })
      return
    }

    // ── 2. Validate body ──────────────────────────────────────────────────────
    const body = req.body as Partial<ModerateMocRequest>
    if (typeof body.name !== 'string') {
      res.status(400).json({ allowed: false, reason: 'name is required' })
      return
    }

    // ── 3. Check content ──────────────────────────────────────────────────────
    const nameOffensive = containsOffensiveContent(body.name)
    const descOffensive = body.description ? containsOffensiveContent(body.description) : false

    if (nameOffensive || descOffensive) {
      const field = nameOffensive ? 'nombre' : 'descripción'
      const response: ModerateMocResponse = {
        allowed: false,
        reason: `El ${field} contiene contenido inapropiado.`,
      }
      res.status(200).json(response)
      return
    }

    const response: ModerateMocResponse = { allowed: true }
    res.status(200).json(response)
  })
