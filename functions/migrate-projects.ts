/**
 * Migration: users/{uid}/projects/* → projects/* (top-level)
 *
 * Run from functions/ directory:
 *   npx tsx migrate-projects.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS pointing to the serviceAccount.json
 * at the root of the project (one level up from functions/).
 *
 * Example (from functions/ dir):
 *   GOOGLE_APPLICATION_CREDENTIALS=../serviceAccount.json npx tsx migrate-projects.ts
 */

import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

async function migrate() {
  console.log('Starting migration: users/*/projects/* → projects/*\n')

  const usersSnap = await db.collection('users').get()
  console.log(`Found ${usersSnap.size} users\n`)

  let projectsMigrated = 0
  let piecesMigrated = 0
  let skipped = 0

  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id
    const userData = userDoc.data()
    const displayName: string = userData.displayName ?? ''
    const photoURL: string = userData.photoURL ?? ''

    const projectsSnap = await db
      .collection('users')
      .doc(userId)
      .collection('projects')
      .get()

    if (projectsSnap.empty) continue

    console.log(`User ${userId} (${displayName}) — ${projectsSnap.size} projects`)

    for (const oldProjectDoc of projectsSnap.docs) {
      const projectId = oldProjectDoc.id
      const projectData = oldProjectDoc.data()

      if (projectData._migrated) {
        console.log(`  [SKIP] ${projectId} already migrated`)
        skipped++
        continue
      }

      const existingDoc = await db.collection('projects').doc(projectId).get()
      if (existingDoc.exists) {
        console.log(`  [SKIP] projects/${projectId} already exists in top-level`)
        skipped++
        continue
      }

      const now = admin.firestore.Timestamp.now()
      const ownerMember = {
        userId,
        displayName,
        photoURL,
        role: 'owner',
        joinedAt: projectData.createdAt ?? now,
        assignedPieces: 0,
        foundPieces: 0,
      }

      const newProjectData: Record<string, unknown> = {
        ...projectData,
        ownerId: userId,
        members: [ownerMember],
        memberIds: [userId],
      }
      delete newProjectData._migrated

      await db.collection('projects').doc(projectId).set(newProjectData)

      // Migrate pieces subcollection
      const piecesSnap = await db
        .collection('users')
        .doc(userId)
        .collection('projects')
        .doc(projectId)
        .collection('pieces')
        .get()

      if (!piecesSnap.empty) {
        const BATCH_SIZE = 499
        for (let i = 0; i < piecesSnap.docs.length; i += BATCH_SIZE) {
          const batch = db.batch()
          const chunk = piecesSnap.docs.slice(i, i + BATCH_SIZE)
          for (const pieceDoc of chunk) {
            const newPieceRef = db
              .collection('projects')
              .doc(projectId)
              .collection('pieces')
              .doc(pieceDoc.id)
            batch.set(newPieceRef, {
              ...pieceDoc.data(),
              assignedTo: null,
            })
          }
          await batch.commit()
        }
        piecesMigrated += piecesSnap.size
      }

      // Soft-mark old doc — do NOT delete yet
      await oldProjectDoc.ref.update({ _migrated: true })

      projectsMigrated++
      console.log(`  ✓ ${projectId} "${projectData.name as string}" (${piecesSnap.size} pieces)`)
    }
  }

  console.log('\n=== Migration complete ===')
  console.log(`Projects migrated : ${projectsMigrated}`)
  console.log(`Pieces migrated   : ${piecesMigrated}`)
  console.log(`Skipped           : ${skipped}`)
  console.log('\nVerify in Firebase Console → Firestore → projects/')
  console.log('Then run the app and confirm everything loads.')
  console.log('When confirmed, delete old users/*/projects/* manually.')
}

migrate().catch((err: unknown) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
