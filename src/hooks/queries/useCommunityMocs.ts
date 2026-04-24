import { useQuery } from '@tanstack/react-query'
import { queryKeys } from './queryKeys'
import { getCommunityMocs } from '@/lib/firestore/mocs'

export function useCommunityMocs() {
  return useQuery({
    queryKey: queryKeys.community.all(),
    queryFn: () => getCommunityMocs(),
    staleTime: 1000 * 60 * 5, // 5 min — contenido público cambia con menos frecuencia
  })
}
