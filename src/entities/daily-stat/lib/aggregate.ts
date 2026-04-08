import type { DailyStat } from '../model/types'
import type { MetricInput } from '../../../shared/lib/metrics'

export type StatTotals = MetricInput

export interface DailySeriesPoint extends StatTotals {
  date: string
}

export function createEmptyTotals(): StatTotals {
  return {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cost: 0,
    conversionsValue: 0,
  }
}

export function sumTotals(base: StatTotals, next: StatTotals): StatTotals {
  return {
    impressions: base.impressions + next.impressions,
    clicks: base.clicks + next.clicks,
    conversions: base.conversions + next.conversions,
    cost: base.cost + next.cost,
    conversionsValue: base.conversionsValue + next.conversionsValue,
  }
}

export function aggregateTotals(dailyStats: DailyStat[]): StatTotals {
  let totals = createEmptyTotals()

  for (const stat of dailyStats) {
    totals = sumTotals(totals, stat)
  }

  return totals
}

export function aggregateByDate(dailyStats: DailyStat[]): DailySeriesPoint[] {
  const byDate = new Map<string, StatTotals>()

  for (const stat of dailyStats) {
    const current = byDate.get(stat.date) ?? createEmptyTotals()
    byDate.set(stat.date, sumTotals(current, stat))
  }

  return [...byDate.entries()]
    .map(([date, totals]) => ({ date, ...totals }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateByCampaignId(dailyStats: DailyStat[]): Map<string, StatTotals> {
  const byCampaignId = new Map<string, StatTotals>()

  for (const stat of dailyStats) {
    const current = byCampaignId.get(stat.campaignId) ?? createEmptyTotals()
    byCampaignId.set(stat.campaignId, sumTotals(current, stat))
  }

  return byCampaignId
}
