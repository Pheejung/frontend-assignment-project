import { normalizeDailyStats } from '../lib/normalize'
import type { DailyStat, DailyStatApi } from '../model/types'
import { fetchJson } from '../../../shared/api/client'

export interface DailyStatsQueryData {
  dailyStats: DailyStat[]
  rawCount: number
  droppedCount: number
  mergedCount: number
}

export async function fetchDailyStats(): Promise<DailyStatsQueryData> {
  const raw = await fetchJson<DailyStatApi[]>('/daily_stats')
  const { dailyStats, droppedCount, mergedCount } = normalizeDailyStats(raw)

  return {
    dailyStats,
    rawCount: raw.length,
    droppedCount,
    mergedCount,
  }
}
