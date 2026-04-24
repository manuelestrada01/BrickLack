import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../queries/queryKeys'
import { reportMoc } from '@/lib/firestore/mocs'

interface ReportMocInput {
  projectId: string
  reporterId: string
  reason: string
}

export function useReportMoc() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ReportMocInput) => reportMoc(input),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.community.all() })
    },
  })
}
