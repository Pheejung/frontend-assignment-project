export function createLocalCampaignId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
