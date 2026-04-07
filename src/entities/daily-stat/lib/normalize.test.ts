import { describe, expect, it } from 'vitest'
import { normalizeDailyStats } from './normalize'

describe('normalizeDailyStats', () => {
  it('normalizes format, clamps negative revenue, and merges duplicate dates', () => {
    const result = normalizeDailyStats([
      {
        id: 's1',
        campaignId: 'cmp-1',
        date: '2026/03/01',
        impressions: '100',
        clicks: '10',
        conversions: '2',
        cost: '1000',
        conversionsValue: null,
      },
      {
        id: 's2',
        campaignId: 'cmp-1',
        date: '2026-03-01',
        impressions: 50,
        clicks: 5,
        conversions: 1,
        cost: 500,
        conversionsValue: null,
        revenue: -900,
      },
      {
        id: 'invalid',
        campaignId: 'cmp-1',
        date: '2026-99-99',
        impressions: 1,
        clicks: 1,
        conversions: 1,
        cost: 1,
        conversionsValue: 1,
      },
    ])

    expect(result.droppedCount).toBe(1)
    expect(result.mergedCount).toBe(1)
    expect(result.dailyStats).toHaveLength(1)

    const row = result.dailyStats[0]
    expect(row?.date).toBe('2026-03-01')
    expect(row?.impressions).toBe(150)
    expect(row?.clicks).toBe(15)
    expect(row?.cost).toBe(1500)
    expect(row?.conversionsValue).toBe(0)
  })
})
