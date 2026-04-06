export interface DailyStatApi {
  id: unknown
  campaignId: unknown
  date: unknown
  impressions: unknown
  clicks: unknown
  conversions: unknown
  cost: unknown
  conversionsValue: unknown
  revenue?: unknown
}

export interface DailyStat {
  id: string
  campaignId: string
  date: string
  impressions: number
  clicks: number
  conversions: number
  cost: number
  conversionsValue: number
}

export interface DailyStatNormalizationResult {
  dailyStats: DailyStat[]
  droppedCount: number
  mergedCount: number
}
