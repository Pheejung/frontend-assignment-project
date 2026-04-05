export type CampaignStatus = 'active' | 'paused' | 'ended'

export type CampaignPlatform = 'Google' | 'Meta' | 'Naver'

export interface CampaignApi {
  id: unknown
  name: unknown
  platform: unknown
  status: unknown
  budget: unknown
  startDate: unknown
  endDate: unknown
}

export interface Campaign {
  id: string
  name: string
  platform: CampaignPlatform
  status: CampaignStatus
  budget: number
  startDate: string
  endDate: string | null
}

export interface CampaignNormalizationResult {
  campaigns: Campaign[]
  droppedCount: number
}
