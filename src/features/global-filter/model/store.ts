import { create } from 'zustand'
import type { Campaign, CampaignPlatform, CampaignStatus } from '../../../entities/campaign/model/types'
import type { DailyStat } from '../../../entities/daily-stat/model/types'
import { getCurrentMonthRange, type DateRange } from '../../../shared/lib/date'

const ALL_STATUSES: CampaignStatus[] = ['active', 'paused', 'ended']
const ALL_PLATFORMS: CampaignPlatform[] = ['Google', 'Meta', 'Naver']
export type TrendMetric = 'impressions' | 'clicks'
const DEFAULT_TREND_METRICS: TrendMetric[] = ['impressions', 'clicks']

interface DashboardStoreState {
  dateRange: DateRange
  statuses: CampaignStatus[]
  platforms: CampaignPlatform[]
  trendMetrics: TrendMetric[]
  localCampaigns: Campaign[]
  localDailyStats: DailyStat[]
  setDateRange: (next: DateRange) => void
  toggleStatus: (status: CampaignStatus) => void
  togglePlatform: (platform: CampaignPlatform) => void
  toggleTrendMetric: (metric: TrendMetric) => void
  resetFilters: () => void
  addLocalCampaign: (campaign: Campaign) => void
  addLocalDailyStats: (stats: DailyStat[]) => void
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

  addLocalCampaign: (campaign) =>
    set((state) => ({
      localCampaigns: [...state.localCampaigns, campaign],
    })),

  addLocalDailyStats: (stats) =>
    set((state) => ({
      localDailyStats: [...state.localDailyStats, ...stats],
    })),
}))
