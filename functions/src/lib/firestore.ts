import * as admin from 'firebase-admin'

// Initialize once — safe to call multiple times due to guard
if (!admin.apps.length) {
  admin.initializeApp()
}

export const db = admin.firestore()
export const adminAuth = admin.auth()

// ── Scan limit helpers ────────────────────────────────────────────────────────

const SCAN_LIMIT = 3
const RESET_INTERVAL_DAYS = 30

export interface ScanCheckResult {
  allowed: boolean
  remaining: number
  scanCount: number
}

/**
 * Verifies the user's scan limit and increments the counter if allowed.
 * Resets the counter automatically if RESET_INTERVAL_DAYS have passed.
 * All logic runs server-side — never trust client-provided scanCount.
 */
export async function checkAndIncrementScanCount(uid: string): Promise<ScanCheckResult> {
  const userRef = db.collection('users').doc(uid)

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef)
    if (!snap.exists) {
      throw new Error('User document not found')
    }

    const data = snap.data()!
    const now = new Date()
    const resetDate: Date = (data.scanResetDate as admin.firestore.Timestamp).toDate()
    const daysSinceReset = (now.getTime() - resetDate.getTime()) / (1000 * 60 * 60 * 24)

    let scanCount: number = data.scanCount ?? 0

    // Auto-reset if the interval has passed
    if (daysSinceReset >= RESET_INTERVAL_DAYS) {
      scanCount = 0
      tx.update(userRef, {
        scanCount: 0,
        scanResetDate: admin.firestore.Timestamp.fromDate(now),
      })
    }

    if (scanCount >= SCAN_LIMIT) {
      return { allowed: false, remaining: 0, scanCount }
    }

    const newCount = scanCount + 1
    tx.update(userRef, { scanCount: newCount })
    return { allowed: true, remaining: SCAN_LIMIT - newCount, scanCount: newCount }
  })
}
