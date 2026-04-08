import { describe, expect, it } from 'vitest'
import { aggregateByCampaignId, aggregateByDate, aggregateTotals, createEmptyTotals } from './aggregate'
import type { DailyStat } from '../model/types'

const makeStat = (
  campaignId: string,
  date: string,
  impressions: number,
  clicks: number,
  cost: number,
  conversionsValue: number,
): DailyStat => ({
  id: `${campaignId}-${date}`,
  campaignId,
  date,
  impressions,
  clicks,
  conversions: 1,
  cost,
  conversionsValue,
})

describe('aggregateTotals', () => {
  it('returns empty totals for empty input', () => {
    expect(aggregateTotals([])).toEqual(createEmptyTotals())
  })

  it('sums all numeric fields across stats', () => {
    const stats = [
      makeStat('c1', '2026-03-01', 100, 10, 1000, 5000),
      makeStat('c1', '2026-03-02', 200, 20, 2000, 8000),
    ]
    const result = aggregateTotals(stats)
    expect(result.impressions).toBe(300)
    expect(result.clicks).toBe(30)
    expect(result.cost).toBe(3000)
    expect(result.conversionsValue).toBe(13000)
  })
})

describe('aggregateByDate', () => {
  it('groups stats by date and sorts ascending', () => {
    const stats = [
      makeStat('c1', '2026-03-03', 30, 3, 300, 0),
      makeStat('c1', '2026-03-01', 10, 1, 100, 0),
      makeStat('c2', '2026-03-01', 20, 2, 200, 0),
    ]
    const result = aggregateByDate(stats)
    expect(result).toHaveLength(2)
    expect(result[0]?.date).toBe('2026-03-01')
    expect(result[0]?.impressions).toBe(30)
    expect(result[1]?.date).toBe('2026-03-03')
    expect(result[1]?.impressions).toBe(30)
  })

  it('returns empty array for empty input', () => {
    expect(aggregateByDate([])).toEqual([])
  })
})

describe('aggregateByCampaignId', () => {
  it('groups stats by campaignId and sums values', () => {
    const stats = [
      makeStat('c1', '2026-03-01', 100, 10, 1000, 5000),
      makeStat('c1', '2026-03-02', 50, 5, 500, 2000),
      makeStat('c2', '2026-03-01', 200, 20, 2000, 8000),
    ]
    const result = aggregateByCampaignId(stats)
    expect(result.get('c1')?.impressions).toBe(150)
    expect(result.get('c1')?.cost).toBe(1500)
    expect(result.get('c2')?.impressions).toBe(200)
  })

  it('returns empty map for empty input', () => {
    expect(aggregateByCampaignId([])).toEqual(new Map())
  })
})
