import type { CampaignPlatform } from "../../../entities/campaign/model/types"

export type DonutMetric = "cost" | "impressions" | "clicks" | "conversions"

export const DONUT_METRIC_KEYS: DonutMetric[] = ["cost", "impressions", "clicks", "conversions"]

export const DONUT_METRIC_LABEL: Record<DonutMetric, string> = {
  cost: "비용",
  impressions: "노출수",
  clicks: "클릭수",
  conversions: "전환수",
}

export const PLATFORM_COLORS: Record<CampaignPlatform, string> = {
  Google: "#818cf8",
  Meta: "#f472b6",
  Naver: "#34d399",
}
