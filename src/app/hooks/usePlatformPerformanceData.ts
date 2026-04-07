import { useMemo } from "react"
import type { Campaign } from "../../entities/campaign/model/types"
import type { DailyStat } from "../../entities/daily-stat/model/types"
import type { CampaignPlatform } from "../../entities/campaign/model/types"
import { useDashboardStore } from "../../features/global-filter/model/store"
import { filterCampaigns, filterDailyStats } from "../../shared/lib/filter"
import type { PlatformPerformanceDatum } from "../../widgets/platform-performance-donut/ui/PlatformPerformanceDonut"

const ALL_PLATFORMS: CampaignPlatform[] = ["Google", "Meta", "Naver"]

// 도넛 차트는 platform 필터를 무시하고 전체 플랫폼을 표시해야
// 세그먼트 클릭으로 글로벌 필터를 토글하는 양방향 연동이 가능하다.
export function usePlatformPerformanceData(
  mergedCampaigns: Campaign[],
  mergedDailyStats: DailyStat[],
): PlatformPerformanceDatum[] {
  const dateRange = useDashboardStore((state) => state.dateRange)
  const statuses = useDashboardStore((state) => state.statuses)

  const campaignsForDonut = useMemo(
    () => filterCampaigns(mergedCampaigns, { dateRange, statuses, platforms: ALL_PLATFORMS }),
    [mergedCampaigns, dateRange, statuses],
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
