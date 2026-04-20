import { useMutation } from '@tanstack/react-query'
import { callSuggestSets } from '@/lib/cloudFunctions'
import type { SuggestSetsResponse } from '@/types'

type SuggestSetsInput = Array<{ partNum: string; color: string; quantity: number }>

export function useSuggestSets() {
  return useMutation<SuggestSetsResponse, Error, SuggestSetsInput>({
    mutationFn: (pieces) => callSuggestSets(pieces),
  })
}
