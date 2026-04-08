import { describe, expect, it } from 'vitest'
import { normalizeCampaigns } from './normalize'

describe('normalizeCampaigns', () => {
  it('drops campaigns with missing id', () => {
    const result = normalizeCampaigns([
      { id: '', name: 'A', platform: 'Google', status: 'active', budget: 1000, startDate: '2026-01-01', endDate: null },
    ])
    expect(result.droppedCount).toBe(1)
    expect(result.campaigns).toHaveLength(0)
  })

  it('drops campaigns with invalid startDate', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: 'A', platform: 'Google', status: 'active', budget: 1000, startDate: '2026-99-99', endDate: null },
    ])
    expect(result.droppedCount).toBe(1)
    expect(result.campaigns).toHaveLength(0)
  })

  it('normalizes non-standard date format (YYYY/MM/DD)', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: 'A', platform: 'Google', status: 'active', budget: 1000, startDate: '2026/03/01', endDate: null },
    ])
    expect(result.campaigns[0]?.startDate).toBe('2026-03-01')
  })

  it('maps non-standard status values', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: 'X', platform: 'Google', status: 'running', budget: 1000, startDate: '2026-01-01', endDate: null },
      { id: 'c2', name: 'Y', platform: 'Google', status: 'stopped', budget: 1000, startDate: '2026-01-01', endDate: null },
    ])
    expect(result.campaigns[0]?.status).toBe('active')
    expect(result.campaigns[1]?.status).toBe('ended')
  })

  it('maps non-standard platform values', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: 'A', platform: 'facebook', status: 'active', budget: 1000, startDate: '2026-01-01', endDate: null },
      { id: 'c2', name: 'B', platform: '네이버', status: 'active', budget: 1000, startDate: '2026-01-01', endDate: null },
    ])
    expect(result.campaigns[0]?.platform).toBe('Meta')
    expect(result.campaigns[1]?.platform).toBe('Naver')
  })

  it('uses fallback name when name is null', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: null, platform: 'Google', status: 'active', budget: 1000, startDate: '2026-01-01', endDate: null },
    ])
    expect(result.campaigns[0]?.name).toBe('Unnamed Campaign (c1)')
  })

  it('sets endDate to null when endDate is before startDate', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: 'A', platform: 'Google', status: 'active', budget: 1000, startDate: '2026-03-01', endDate: '2026-01-01' },
    ])
    expect(result.campaigns[0]?.endDate).toBeNull()
  })

  it('clamps negative budget to 0', () => {
    const result = normalizeCampaigns([
      { id: 'c1', name: 'A', platform: 'Google', status: 'active', budget: -500, startDate: '2026-01-01', endDate: null },
    ])
    expect(result.campaigns[0]?.budget).toBe(0)
  })
})
