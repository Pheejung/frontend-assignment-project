import {
  type DailyStat,
  type DailyStatApi,
  type DailyStatNormalizationResult,
} from '../model/types'
import { normalizeDateInput } from '../../../shared/lib/date'
import { toNonNegativeInteger, toNonNegativeNumber } from '../../../shared/lib/number'

function normalizeDailyStat(api: DailyStatApi): DailyStat | null {
  const campaignId =
    typeof api.campaignId === 'string' && api.campaignId.trim().length > 0
      ? api.campaignId.trim()
      : null
  if (campaignId === null) {
    return null
  }

  const date = normalizeDateInput(api.date)
  if (date === null) {
    return null
  }

  const id =
    typeof api.id === 'string' && api.id.trim().length > 0
      ? api.id.trim()
      : `${campaignId}:${date}`

  const rawRevenue = api.conversionsValue ?? api.revenue

  return {
    id,
    campaignId,
    date,
    impressions: toNonNegativeInteger(api.impressions),
    clicks: toNonNegativeInteger(api.clicks),
    conversions: toNonNegativeInteger(api.conversions),
    cost: toNonNegativeNumber(api.cost),
    conversionsValue: toNonNegativeNumber(rawRevenue),
  }
}

export function normalizeDailyStats(
  rawDailyStats: DailyStatApi[],
): DailyStatNormalizationResult {
  const deduped = new Map<string, DailyStat>()

  let droppedCount = 0
  let mergedCount = 0

  for (const row of rawDailyStats) {
    const normalized = normalizeDailyStat(row)
    if (normalized === null) {
      droppedCount += 1
      continue
    }

    const key = `${normalized.campaignId}:${normalized.date}`
    const current = deduped.get(key)

    if (!current) {
      deduped.set(key, normalized)
      continue
    }

    mergedCount += 1
    deduped.set(key, {
      ...current,
      id: current.id,
      impressions: current.impressions + normalized.impressions,
      clicks: current.clicks + normalized.clicks,
      conversions: current.conversions + normalized.conversions,
      cost: current.cost + normalized.cost,
      conversionsValue: current.conversionsValue + normalized.conversionsValue,
    })
  }

  const dailyStats = [...deduped.values()].sort((a, b) => {
    if (a.date === b.date) {
      return a.campaignId.localeCompare(b.campaignId)
    }
    return a.date.localeCompare(b.date)
  })

  return { dailyStats, droppedCount, mergedCount }
}
