import { useQuery } from '@tanstack/react-query'
import { fetchCampaigns } from '../api/campaigns'
import { queryKeys } from '../../../shared/api/queryKeys'

export function useCampaignsQuery() {
  return useQuery({
    queryKey: queryKeys.campaigns,
    queryFn: fetchCampaigns,
  })
}
