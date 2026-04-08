import { useMemo } from "react"
import type { Campaign } from "../../../entities/campaign/model/types"
import type { DailyStat } from "../../../entities/daily-stat/model/types"
import type { CampaignPlatform } from "../../../entities/campaign/model/types"
import { useDashboardStore } from "../../../features/global-filter/model/store"
import { filterCampaigns } from "../../../entities/campaign/lib/filter"
import { filterDailyStats } from "../../../entities/daily-stat/lib/filter"
import type { PlatformPerformanceDatum } from "../ui/PlatformPerformanceDonut"

const ALL_PLATFORMS: CampaignPlatform[] = ["Google", "Meta", "Naver"]

export function usePlatformPerformanceData(
  mergedCampaigns: Campaign[],
  mergedDailyStats: DailyStat[],
): PlatformPerformanceDatum[] {
  const dateRange = useDashboardStore((state) => state.dateRange)
  const statuses = useDashboardStore((state) => state.statuses)
  const platforms = useDashboardStore((state) => state.platforms)

  const campaignsForDonut = useMemo(
    () => filterCampaigns(mergedCampaigns, { dateRange, statuses, platforms }),
    [mergedCampaigns, dateRange, statuses, platforms],
  )

  const campaignIdsForDonut = useMemo(
    () => new Set(campaignsForDonut.map((c) => c.id)),
    [campaignsForDonut],
  )

  const statsForDonut = useMemo(
    () => filterDailyStats(mergedDailyStats, campaignIdsForDonut, dateRange),
    [mergedDailyStats, campaignIdsForDonut, dateRange],
  )

  return useMemo(() => {
    const campaignPlatformMap = new Map(campaignsForDonut.map((c) => [c.id, c.platform]))

    const buckets: Record<CampaignPlatform, Omit<PlatformPerformanceDatum, "platform">> = {
      Google: { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
      Meta: { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
      Naver: { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
    }

    for (const stat of statsForDonut) {
      const platform = campaignPlatformMap.get(stat.campaignId)
      if (!platform) continue
      const target = buckets[platform]
      target.cost += stat.cost
      target.impressions += stat.impressions
      target.clicks += stat.clicks
      target.conversions += stat.conversions
    }

    return ALL_PLATFORMS.map((platform) => ({ platform, ...buckets[platform] }))
  }, [campaignsForDonut, statsForDonut])
}
