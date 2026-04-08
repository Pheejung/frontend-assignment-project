import { useQuery } from '@tanstack/react-query'
import { fetchDailyStats } from '../api/dailyStats'
import { queryKeys } from '../../../shared/api/queryKeys'

export function useDailyStatsQuery() {
  return useQuery({
    queryKey: queryKeys.dailyStats,
    queryFn: fetchDailyStats,
  })
}
