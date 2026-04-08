import { describe, expect, it } from 'vitest'
import { filterCampaigns } from './filter'
import type { Campaign } from '../model/types'

const base: Campaign = {
  id: 'c1',
  name: 'Test',
  platform: 'Google',
  status: 'active',
  budget: 100000,
  startDate: '2026-03-01',
  endDate: '2026-03-31',
}

const dateRange = { from: '2026-03-01', to: '2026-03-31' }

describe('filterCampaigns', () => {
  it('returns campaign that matches all filters', () => {
    const result = filterCampaigns([base], {
      dateRange,
      statuses: ['active'],
      platforms: ['Google'],
    })
    expect(result).toHaveLength(1)
  })

  it('filters out campaign with non-matching status', () => {
    const result = filterCampaigns([base], {
      dateRange,
      statuses: ['paused'],
      platforms: ['Google'],
    })
    expect(result).toHaveLength(0)
  })

  it('filters out campaign with non-matching platform', () => {
    const result = filterCampaigns([base], {
      dateRange,
      statuses: ['active'],
      platforms: ['Meta'],
    })
    expect(result).toHaveLength(0)
  })

  it('filters out campaign whose period does not overlap date range', () => {
    const result = filterCampaigns([base], {
      dateRange: { from: '2026-04-01', to: '2026-04-30' },
      statuses: ['active'],
      platforms: ['Google'],
    })
    expect(result).toHaveLength(0)
  })

  it('includes campaign whose period partially overlaps date range', () => {
    const result = filterCampaigns([base], {
      dateRange: { from: '2026-03-15', to: '2026-04-15' },
      statuses: ['active'],
      platforms: ['Google'],
    })
    expect(result).toHaveLength(1)
  })

  it('treats endDate=null as ongoing (9999-12-31)', () => {
    const ongoing: Campaign = { ...base, endDate: null }
    const result = filterCampaigns([ongoing], {
      dateRange: { from: '2030-01-01', to: '2030-12-31' },
      statuses: ['active'],
      platforms: ['Google'],
    })
    expect(result).toHaveLength(1)
  })

  it('applies AND condition across status and platform', () => {
    const campaigns: Campaign[] = [
      { ...base, id: 'c1', status: 'active', platform: 'Google' },
      { ...base, id: 'c2', status: 'paused', platform: 'Google' },
      { ...base, id: 'c3', status: 'active', platform: 'Meta' },
    ]
    const result = filterCampaigns(campaigns, {
      dateRange,
      statuses: ['active'],
      platforms: ['Google'],
    })
    expect(result.map((c) => c.id)).toEqual(['c1'])
  })
})
