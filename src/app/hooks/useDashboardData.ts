import { useMemo } from "react"
import { useCampaignsQuery } from "../../entities/campaign/model/useCampaignsQuery"
import { useDailyStatsQuery } from "../../entities/daily-stat/model/useDailyStatsQuery"
import type { CampaignPlatform, CampaignStatus } from "../../entities/campaign/model/types"
import type { CampaignTableRowData } from "../../features/campaign-table/ui/CampaignManagementTable"
import { useDashboardStore } from "../../features/global-filter/model/store"
import {
  aggregateByCampaignId,
  aggregateByDate,
  aggregateTotals,
  createEmptyTotals,
} from "../../shared/lib/aggregate"
import type { DateRange } from "../../shared/lib/date"
import { filterCampaigns, filterDailyStats } from "../../shared/lib/filter"
import { calculateDerivedMetrics } from "../../shared/lib/metrics"

export interface QueryMeta {
  isLoading: boolean
  error: Error | null
  campaigns: { rawCount: number; droppedCount: number }
  dailyStats: { rawCount: number; droppedCount: number; mergedCount: number }
}

interface FilterParams {
  dateRange: DateRange
  statuses: CampaignStatus[]
  platforms: CampaignPlatform[]
}

export function useDashboardData(filters: FilterParams) {
  const campaignsQuery = useCampaignsQuery()
  const dailyStatsQuery = useDailyStatsQuery()

  const localCampaigns = useDashboardStore((state) => state.localCampaigns)
  const localDailyStats = useDashboardStore((state) => state.localDailyStats)
  const statusOverrides = useDashboardStore((state) => state.statusOverrides)
  const spendOverrides = useDashboardStore((state) => state.spendOverrides)

  const { dateRange, statuses, platforms } = filters

  const mergedCampaigns = useMemo(() => {
    const combined = [...(campaignsQuery.data?.campaigns ?? []), ...localCampaigns]
    return combined.map((campaign) => {
      const overriddenStatus = statusOverrides[campaign.id]
      return overriddenStatus ? { ...campaign, status: overriddenStatus } : campaign
    })
  }, [campaignsQuery.data?.campaigns, localCampaigns, statusOverrides])

  const mergedDailyStats = useMemo(
    () => [...(dailyStatsQuery.data?.dailyStats ?? []), ...localDailyStats],
    [dailyStatsQuery.data?.dailyStats, localDailyStats],
  )

  const filteredCampaigns = useMemo(
    () => filterCampaigns(mergedCampaigns, { dateRange, statuses, platforms }),
    [mergedCampaigns, dateRange, statuses, platforms],
  )

  const filteredCampaignIds = useMemo(
    () => new Set(filteredCampaigns.map((c) => c.id)),
    [filteredCampaigns],
  )

  const filteredStats = useMemo(
    () => filterDailyStats(mergedDailyStats, filteredCampaignIds, dateRange),
    [mergedDailyStats, filteredCampaignIds, dateRange],
  )

  const totals = useMemo(() => aggregateTotals(filteredStats), [filteredStats])
  const derivedMetrics = useMemo(() => calculateDerivedMetrics(totals), [totals])
  const dailySeries = useMemo(() => aggregateByDate(filteredStats), [filteredStats])
  const campaignTotals = useMemo(() => aggregateByCampaignId(filteredStats), [filteredStats])

  const campaignTableRows = useMemo<CampaignTableRowData[]>(() => {
    return filteredCampaigns.map((campaign) => {
      const stat = campaignTotals.get(campaign.id)
      const metrics = calculateDerivedMetrics(stat ?? createEmptyTotals())
      const fallbackSpend = spendOverrides[campaign.id] ?? 0
      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        platform: campaign.platform,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalCost: stat ? stat.cost : fallbackSpend,
        ctr: metrics.ctr,
        cpc: metrics.cpc,
        roas: metrics.roas,
        hasStats: Boolean(stat),
      }
    })
  }, [filteredCampaigns, campaignTotals, spendOverrides])

  const queryMeta: QueryMeta = {
    isLoading: campaignsQuery.isLoading || dailyStatsQuery.isLoading,
    error:
      campaignsQuery.error instanceof Error
        ? campaignsQuery.error
        : dailyStatsQuery.error instanceof Error
          ? dailyStatsQuery.error
          : null,
    campaigns: {
      rawCount: campaignsQuery.data?.rawCount ?? 0,
      droppedCount: campaignsQuery.data?.droppedCount ?? 0,
    },
    dailyStats: {
      rawCount: dailyStatsQuery.data?.rawCount ?? 0,
      droppedCount: dailyStatsQuery.data?.droppedCount ?? 0,
      mergedCount: dailyStatsQuery.data?.mergedCount ?? 0,
    },
  }

  const isDataReady =
    !queryMeta.isLoading &&
    !queryMeta.error &&
    campaignsQuery.data != null &&
    dailyStatsQuery.data != null

  return {
    queryMeta,
    isDataReady,
    mergedCampaigns,
    mergedDailyStats,
    filteredCampaigns,
    filteredStats,
    totals,
    derivedMetrics,
    dailySeries,
    campaignTableRows,
  }
}
