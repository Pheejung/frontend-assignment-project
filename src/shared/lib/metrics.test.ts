import { describe, expect, it } from 'vitest'
import { calculateDerivedMetrics } from './metrics'

describe('calculateDerivedMetrics', () => {
  it('handles division-by-zero safely', () => {
    const result = calculateDerivedMetrics({
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0,
      conversionsValue: 0,
    })

    expect(result).toEqual({ ctr: 0, cpc: 0, roas: 0 })
  })

  it('returns rounded values to 2 decimal places', () => {
    const result = calculateDerivedMetrics({
      impressions: 333,
      clicks: 77,
      conversions: 9,
      cost: 12345,
      conversionsValue: 45678,
    })

    expect(result.ctr).toBe(23.12)
    expect(result.cpc).toBe(160.32)
    expect(result.roas).toBe(370.01)
  })
})
