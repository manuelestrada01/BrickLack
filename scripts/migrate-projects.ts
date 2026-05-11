/**
 * Migration: users/{uid}/projects/* → projects/* (top-level)
 *
 * Run once with:
 *   npx ts-node --project tsconfig.scripts.json scripts/migrate-projects.ts
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON
 *     with Firestore read+write permissions on the target project
 *   - Or run inside a Firebase emulator if testing locally
 *
 * What it does:
 *   1. Reads all docs under users/{uid}/projects/{pid}
 *   2. For each project, reads its pieces subcollection
 *   3. Writes project + pieces to top-level projects/{pid} (same ID preserved)
 *   4. Marks old project doc with { _migrated: true } — does NOT delete
 *      (run a cleanup pass manually after verifying the migration is correct)
 */

import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

async function migrate() {
  console.log('Starting migration: users/*/projects/* → projects/*')

  const usersSnap = await db.collection('users').get()
  console.log(`Found ${usersSnap.size} users`)

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

    for (const oldProjectDoc of projectsSnap.docs) {
      const projectId = oldProjectDoc.id
      const projectData = oldProjectDoc.data()

      // Skip already migrated
      if (projectData._migrated) {
        skipped++
        continue
      }

      // Check if top-level doc already exists (idempotent)
      const existingDoc = await db.collection('projects').doc(projectId).get()
      if (existingDoc.exists) {
        console.log(`  [SKIP] projects/${projectId} already exists`)
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

      // Write new top-level project doc (same ID)
      const newProjectData = {
        ...projectData,
        ownerId: userId,
        members: [ownerMember],
        memberIds: [userId],
        // preserve clonedFrom if present, otherwise omit
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
              assignedTo: null,   // new field, default unassigned
            })
          }
          await batch.commit()
        }
        piecesMigrated += piecesSnap.docs.length
      }

      // Mark old doc as migrated (soft — do NOT delete yet)
      await oldProjectDoc.ref.update({ _migrated: true })

      projectsMigrated++
      console.log(`  ✓ Migrated project ${projectId} (${piecesSnap.size} pieces) for user ${userId}`)
    }
  }

  console.log('\n=== Migration complete ===')
  console.log(`Projects migrated: ${projectsMigrated}`)
  console.log(`Pieces migrated:   ${piecesMigrated}`)
  console.log(`Skipped:           ${skipped}`)
  console.log('\nNext steps:')
  console.log('  1. Verify data in Firestore console under projects/')
  console.log('  2. Run the app and confirm projects load correctly')
  console.log('  3. Once confirmed, delete old users/*/projects/* manually')
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
