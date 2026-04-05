import type { Campaign, CampaignPlatform, CampaignStatus } from '../../entities/campaign/model/types'
import type { DailyStat } from '../../entities/daily-stat/model/types'
import { type DateRange, doesDateRangeOverlap, isDateWithinRange } from './date'

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

export function filterDailyStats(
  dailyStats: DailyStat[],
  campaignIds: Set<string>,
  dateRange: DateRange,
): DailyStat[] {
  return dailyStats.filter((stat) => {
    if (!campaignIds.has(stat.campaignId)) {
      return false
    }

    return isDateWithinRange(stat.date, dateRange)
  })
}
