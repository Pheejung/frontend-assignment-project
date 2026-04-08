import { normalizeCampaigns } from '../lib/normalize'
import type { Campaign, CampaignApi } from '../model/types'
import { fetchJson } from '../../../shared/api/client'

export interface CampaignQueryData {
  campaigns: Campaign[]
  rawCount: number
  droppedCount: number
}

export async function fetchCampaigns(): Promise<CampaignQueryData> {
  const raw = await fetchJson<CampaignApi[]>('/campaigns')
  const { campaigns, droppedCount } = normalizeCampaigns(raw)

  return {
    campaigns,
    rawCount: raw.length,
    droppedCount,
  }
}
