import { describe, expect, it } from 'vitest'
import { filterDailyStats } from './filter'
import type { DailyStat } from '../model/types'

const makeStat = (id: string, campaignId: string, date: string): DailyStat => ({
  id,
  campaignId,
  date,
  impressions: 100,
  clicks: 10,
  conversions: 1,
  cost: 1000,
  conversionsValue: 5000,
})

describe('filterDailyStats', () => {
  const stats = [
    makeStat('s1', 'c1', '2026-03-10'),
    makeStat('s2', 'c1', '2026-03-20'),
    makeStat('s3', 'c2', '2026-03-15'),
    makeStat('s4', 'c3', '2026-03-10'),
  ]

  it('keeps only stats whose campaignId is in the set', () => {
    const result = filterDailyStats(stats, new Set(['c1']), { from: '2026-03-01', to: '2026-03-31' })
    expect(result.map((s) => s.id)).toEqual(['s1', 's2'])
  })

  it('keeps only stats within the date range', () => {
    const result = filterDailyStats(stats, new Set(['c1', 'c2', 'c3']), { from: '2026-03-10', to: '2026-03-15' })
    expect(result.map((s) => s.id)).toEqual(['s1', 's3', 's4'])
  })

  it('applies both campaignId and date range filters together', () => {
    const result = filterDailyStats(stats, new Set(['c1']), { from: '2026-03-15', to: '2026-03-31' })
    expect(result.map((s) => s.id)).toEqual(['s2'])
  })

  it('returns empty array when no stats match', () => {
    const result = filterDailyStats(stats, new Set(['c99']), { from: '2026-03-01', to: '2026-03-31' })
    expect(result).toHaveLength(0)
  })

  it('returns empty array for empty input', () => {
    const result = filterDailyStats([], new Set(['c1']), { from: '2026-03-01', to: '2026-03-31' })
    expect(result).toHaveLength(0)
  })
})
