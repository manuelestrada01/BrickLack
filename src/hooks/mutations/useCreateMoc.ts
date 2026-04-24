import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { createMoc, getUserMocCount } from '@/lib/firestore/mocs'
import { uploadMocCoverImage } from '@/lib/storage'
import { doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { MocPieceDoc } from '@/types'

const MOC_LIMIT = 5

interface CreateMocInput {
  userId: string
  authorName: string
  authorPhotoURL: string
  name: string
  description: string
  coverImage: File
  pieces: Omit<MocPieceDoc, 'id'>[]
}

export function useCreateMoc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMocInput) => {
      const { userId, authorName, authorPhotoURL, name, description, coverImage, pieces } = input


      // Check MOC limit
      const count = await getUserMocCount(userId)
      if (count >= MOC_LIMIT) {
        throw new Error(`Has alcanzado el límite de ${MOC_LIMIT} MOCs publicados.`)
      }

      const totalPieces = pieces.reduce((sum, p) => sum + p.quantityRequired, 0)

      // Create MOC doc first to get the ID for storage path
      const mocId = await createMoc(
        {
          authorId: userId,
          authorName,
          authorPhotoURL,
          name,
          description,
          imageUrl: '', // placeholder, updated after upload
          totalPieces,
        },
        pieces,
      )

      // Upload cover image using the real mocId
      const imageUrl = await uploadMocCoverImage(mocId, coverImage)

      // Update imageUrl on the MOC doc
      const { updateDoc } = await import('firebase/firestore')
      await updateDoc(doc(db, 'community_projects', mocId), { imageUrl })

      return mocId
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() })
    },
  })
}
