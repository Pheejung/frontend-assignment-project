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

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100
}

export function calculateDerivedMetrics(input: MetricInput): DerivedMetrics {
  const ctrRaw = input.impressions > 0 ? (input.clicks / input.impressions) * 100 : 0
  const cpcRaw = input.clicks > 0 ? input.cost / input.clicks : 0
  const roasRaw = input.cost > 0 ? (input.conversionsValue / input.cost) * 100 : 0

  return {
    ctr: roundToTwo(ctrRaw),
    cpc: roundToTwo(cpcRaw),
    roas: roundToTwo(roasRaw),
  }
}
