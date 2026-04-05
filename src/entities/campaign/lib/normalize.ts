import {
  type Campaign,
  type CampaignApi,
  type CampaignNormalizationResult,
  type CampaignPlatform,
  type CampaignStatus,
} from '../model/types'
import { normalizeDateInput } from '../../../shared/lib/date'
import { toNonNegativeInteger } from '../../../shared/lib/number'

const STATUS_MAP: Record<string, CampaignStatus> = {
  active: 'active',
  paused: 'paused',
  ended: 'ended',
  running: 'active',
  stopped: 'ended',
}

const PLATFORM_MAP: Record<string, CampaignPlatform> = {
  google: 'Google',
  meta: 'Meta',
  facebook: 'Meta',
  naver: 'Naver',
  네이버: 'Naver',
}

function normalizeStatus(value: unknown): CampaignStatus {
  const key = typeof value === 'string' ? value.toLowerCase() : ''
  return STATUS_MAP[key] ?? 'paused'
}

function normalizePlatform(value: unknown): CampaignPlatform {
  const key = typeof value === 'string' ? value.toLowerCase() : ''
  return PLATFORM_MAP[key] ?? 'Google'
}

function normalizeName(name: unknown, id: string): string {
  if (typeof name === 'string' && name.trim().length > 0) {
    return name.trim()
  }

  return `Unnamed Campaign (${id})`
}

function normalizeCampaign(api: CampaignApi): Campaign | null {
  const id = typeof api.id === 'string' && api.id.trim().length > 0 ? api.id : null
  if (id === null) {
    return null
  }

  const startDate = normalizeDateInput(api.startDate)
  if (startDate === null) {
    return null
  }

  const parsedEndDate = normalizeDateInput(api.endDate)
  const endDate = parsedEndDate && parsedEndDate >= startDate ? parsedEndDate : null

  return {
    id,
    name: normalizeName(api.name, id),
    platform: normalizePlatform(api.platform),
    status: normalizeStatus(api.status),
    budget: toNonNegativeInteger(api.budget),
    startDate,
    endDate,
  }
}

export function normalizeCampaigns(
  rawCampaigns: CampaignApi[],
): CampaignNormalizationResult {
  const campaigns: Campaign[] = []
  let droppedCount = 0

  for (const row of rawCampaigns) {
    const normalized = normalizeCampaign(row)
    if (normalized === null) {
      droppedCount += 1
      continue
    }

    campaigns.push(normalized)
  }

  return { campaigns, droppedCount }
}
