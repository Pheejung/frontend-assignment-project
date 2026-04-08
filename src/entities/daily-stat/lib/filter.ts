import type { DailyStat } from '../model/types'
import { type DateRange, isDateWithinRange } from '../../../shared/lib/date'

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
