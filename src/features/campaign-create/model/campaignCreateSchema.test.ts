import { describe, expect, it } from 'vitest'
import { campaignCreateSchema } from './campaignCreateSchema'

function valid(overrides = {}) {
  return {
    name: '테스트 캠페인',
    platform: 'Google' as const,
    budget: 100000,
    initialSpend: 50000,
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    ...overrides,
  }
}

describe('campaignCreateSchema', () => {
  describe('name', () => {
    it('rejects names shorter than 2 chars', () => {
      const result = campaignCreateSchema.safeParse(valid({ name: 'A' }))
      expect(result.success).toBe(false)
    })

    it('rejects names longer than 100 chars', () => {
      const result = campaignCreateSchema.safeParse(valid({ name: 'A'.repeat(101) }))
      expect(result.success).toBe(false)
    })

    it('accepts names between 2 and 100 chars', () => {
      expect(campaignCreateSchema.safeParse(valid({ name: 'AB' })).success).toBe(true)
      expect(campaignCreateSchema.safeParse(valid({ name: 'A'.repeat(100) })).success).toBe(true)
    })
  })

  describe('budget', () => {
    it('rejects budget below 100', () => {
      const result = campaignCreateSchema.safeParse(valid({ budget: 99 }))
      expect(result.success).toBe(false)
    })

    it('rejects budget above 1 billion', () => {
      const result = campaignCreateSchema.safeParse(valid({ budget: 1_000_000_001 }))
      expect(result.success).toBe(false)
    })

    it('rejects non-integer budget', () => {
      const result = campaignCreateSchema.safeParse(valid({ budget: 1000.5 }))
      expect(result.success).toBe(false)
    })

    it('accepts 100 and 1 billion', () => {
      expect(campaignCreateSchema.safeParse(valid({ budget: 100, initialSpend: 0 })).success).toBe(true)
      expect(campaignCreateSchema.safeParse(valid({ budget: 1_000_000_000 })).success).toBe(true)
    })
  })

  describe('initialSpend', () => {
    it('rejects spend exceeding budget', () => {
      const result = campaignCreateSchema.safeParse(valid({ budget: 10000, initialSpend: 10001 }))
      expect(result.success).toBe(false)
    })

    it('accepts spend equal to budget', () => {
      const result = campaignCreateSchema.safeParse(valid({ budget: 10000, initialSpend: 10000 }))
      expect(result.success).toBe(true)
    })

    it('accepts 0 spend', () => {
      const result = campaignCreateSchema.safeParse(valid({ initialSpend: 0 }))
      expect(result.success).toBe(true)
    })
  })

  describe('dates', () => {
    it('rejects endDate before startDate', () => {
      const result = campaignCreateSchema.safeParse(valid({ startDate: '2026-03-10', endDate: '2026-03-09' }))
      expect(result.success).toBe(false)
    })

    it('rejects endDate equal to startDate (same-day campaign)', () => {
      const result = campaignCreateSchema.safeParse(valid({ startDate: '2026-03-10', endDate: '2026-03-10' }))
      expect(result.success).toBe(false)
    })

    it('rejects empty startDate', () => {
      const result = campaignCreateSchema.safeParse(valid({ startDate: '' }))
      expect(result.success).toBe(false)
    })

    it('rejects empty endDate', () => {
      const result = campaignCreateSchema.safeParse(valid({ endDate: '' }))
      expect(result.success).toBe(false)
    })
  })

  describe('platform', () => {
    it('rejects invalid platform value', () => {
      const result = campaignCreateSchema.safeParse(valid({ platform: 'TikTok' }))
      expect(result.success).toBe(false)
    })

    it('accepts all valid platforms', () => {
      expect(campaignCreateSchema.safeParse(valid({ platform: 'Google' })).success).toBe(true)
      expect(campaignCreateSchema.safeParse(valid({ platform: 'Meta' })).success).toBe(true)
      expect(campaignCreateSchema.safeParse(valid({ platform: 'Naver' })).success).toBe(true)
    })
  })
})
