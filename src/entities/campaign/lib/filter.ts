import type { Campaign, CampaignPlatform, CampaignStatus } from '../model/types'
import { type DateRange, doesDateRangeOverlap } from '../../../shared/lib/date'

export interface GlobalFilters {
  dateRange: DateRange
  statuses: CampaignStatus[]
  platforms: CampaignPlatform[]
}

export function filterCampaigns(
  campaigns: Campaign[],
  filters: GlobalFilters,
): Campaign[] {
  const statusSet = new Set(filters.statuses)
  const platformSet = new Set(filters.platforms)

  return campaigns.filter((campaign) => {
    if (statusSet.size > 0 && !statusSet.has(campaign.status)) {
      return false
    }

    if (platformSet.size > 0 && !platformSet.has(campaign.platform)) {
      return false
    }

    const campaignRange: DateRange = {
      from: campaign.startDate,
      to: campaign.endDate ?? '9999-12-31',
    }

    return doesDateRangeOverlap(campaignRange, filters.dateRange)
  })
}
