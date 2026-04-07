import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCampaignTableState } from './useCampaignTableState'
import type { CampaignTableRowData } from './types'

const BASE_ROWS: CampaignTableRowData[] = [
  {
    id: 'a',
    name: 'A Campaign',
    status: 'active',
    platform: 'Google',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    totalCost: 1000,
    ctr: 1.11,
    cpc: 100,
    roas: 120,
    hasStats: true,
  },
  {
    id: 'b',
    name: 'B Campaign',
    status: 'paused',
    platform: 'Meta',
    startDate: '2026-03-01',
    endDate: '2026-03-31',
    totalCost: 800,
    ctr: 2.22,
    cpc: 80,
    roas: 130,
    hasStats: true,
  },
]

describe('useCampaignTableState', () => {
  it('cycles sort as asc -> desc -> none', () => {
    const { result } = renderHook(() => useCampaignTableState(BASE_ROWS))

    expect(result.current.getSortDirection('period')).toBe('asc')

    act(() => {
      result.current.toggleSort('period')
    })
    expect(result.current.getSortDirection('period')).toBe('desc')

    act(() => {
      result.current.toggleSort('period')
    })
    expect(result.current.getSortDirection('period')).toBeNull()
  })

  it('supports multi-column sort priority order', () => {
    const { result } = renderHook(() => useCampaignTableState(BASE_ROWS))

    expect(result.current.getSortPriority('period')).toBe(1)

    act(() => {
      result.current.toggleSort('totalCost')
      result.current.toggleSort('ctr')
    })

    expect(result.current.getSortDirection('totalCost')).toBe('asc')
    expect(result.current.getSortDirection('ctr')).toBe('asc')
    expect(result.current.getSortPriority('period')).toBe(1)
    expect(result.current.getSortPriority('totalCost')).toBe(2)
    expect(result.current.getSortPriority('ctr')).toBe(3)
  })
})
