import { create } from "zustand"
import type { Campaign, CampaignPlatform, CampaignStatus } from "../../../entities/campaign/model/types"
import type { DailyStat } from "../../../entities/daily-stat/model/types"
import { getCurrentMonthRange, type DateRange } from "../../../shared/lib/date"

const ALL_STATUSES: CampaignStatus[] = ["active", "paused", "ended"]
const ALL_PLATFORMS: CampaignPlatform[] = ["Google", "Meta", "Naver"]
export type TrendMetric = "impressions" | "clicks"
const DEFAULT_TREND_METRICS: TrendMetric[] = ["impressions", "clicks"]

interface DashboardStoreState {
  dateRange: DateRange
  statuses: CampaignStatus[]
  platforms: CampaignPlatform[]
  trendMetrics: TrendMetric[]
  localCampaigns: Campaign[]
  localDailyStats: DailyStat[]
  statusOverrides: Record<string, CampaignStatus>
  spendOverrides: Record<string, number>
  setDateRange: (next: DateRange) => void
  toggleStatus: (status: CampaignStatus) => void
  togglePlatform: (platform: CampaignPlatform) => void
  toggleTrendMetric: (metric: TrendMetric) => void
  resetFilters: () => void
  addLocalCampaign: (campaign: Campaign, initialSpend?: number) => void
  addLocalDailyStats: (stats: DailyStat[]) => void
  bulkUpdateCampaignStatus: (campaignIds: string[], status: CampaignStatus) => void
}

function toggleSelection<T extends string>(items: T[], value: T): T[] {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value]
}

export const useDashboardStore = create<DashboardStoreState>((set) => ({
  dateRange: getCurrentMonthRange(),
  statuses: [...ALL_STATUSES],
  platforms: [...ALL_PLATFORMS],
  trendMetrics: [...DEFAULT_TREND_METRICS],
  localCampaigns: [],
  localDailyStats: [],
  statusOverrides: {},
  spendOverrides: {},

  setDateRange: (next) => set({ dateRange: next }),

  toggleStatus: (status) =>
    set((state) => ({
      statuses: toggleSelection(state.statuses, status),
    })),

  togglePlatform: (platform) =>
    set((state) => ({
      platforms: toggleSelection(state.platforms, platform),
    })),

  toggleTrendMetric: (metric) =>
    set((state) => {
      if (state.trendMetrics.includes(metric)) {
        if (state.trendMetrics.length === 1) {
          return state
        }
        return {
          trendMetrics: state.trendMetrics.filter((item) => item !== metric),
        }
      }

      return {
        trendMetrics: [...state.trendMetrics, metric],
      }
    }),

  resetFilters: () =>
    set({
      dateRange: getCurrentMonthRange(),
      statuses: [...ALL_STATUSES],
      platforms: [...ALL_PLATFORMS],
      trendMetrics: [...DEFAULT_TREND_METRICS],
    }),

  addLocalCampaign: (campaign, initialSpend) =>
    set((state) => {
      const hasSpend =
        typeof initialSpend === "number" &&
        Number.isFinite(initialSpend) &&
        initialSpend >= 0

      return {
        localCampaigns: [...state.localCampaigns, campaign],
        statusOverrides: {
          ...state.statusOverrides,
          [campaign.id]: campaign.status,
        },
        spendOverrides: hasSpend
          ? {
              ...state.spendOverrides,
              [campaign.id]: Math.round(initialSpend),
            }
          : state.spendOverrides,
      }
    }),

  addLocalDailyStats: (stats) =>
    set((state) => ({
      localDailyStats: [...state.localDailyStats, ...stats],
    })),

  bulkUpdateCampaignStatus: (campaignIds, status) =>
    set((state) => {
      const nextOverrides = { ...state.statusOverrides }
      for (const campaignId of campaignIds) {
        nextOverrides[campaignId] = status
      }

      return {
        statusOverrides: nextOverrides,
      }
    }),
}))
