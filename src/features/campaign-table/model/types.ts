import type { CampaignPlatform, CampaignStatus } from "../../../entities/campaign/model/types"

export interface CampaignTableRowData {
  id: string
  name: string
  status: CampaignStatus
  platform: CampaignPlatform
  startDate: string
  endDate: string | null
  totalCost: number
  ctr: number
  cpc: number
  roas: number
  hasStats: boolean
}

export type SortKey = "period" | "totalCost" | "ctr" | "cpc" | "roas"
export type SortDirection = "asc" | "desc"
