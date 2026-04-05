export interface MetricInput {
  impressions: number
  clicks: number
  conversions: number
  cost: number
  conversionsValue: number
}

export interface DerivedMetrics {
  ctr: number
  cpc: number
  roas: number
}

export function calculateDerivedMetrics(input: MetricInput): DerivedMetrics {
  const ctr = input.impressions > 0 ? (input.clicks / input.impressions) * 100 : 0
  const cpc = input.clicks > 0 ? input.cost / input.clicks : 0
  const roas = input.cost > 0 ? (input.conversionsValue / input.cost) * 100 : 0

  return { ctr, cpc, roas }
}
