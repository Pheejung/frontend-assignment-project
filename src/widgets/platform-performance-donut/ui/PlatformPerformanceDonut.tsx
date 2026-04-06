import { useMemo, useState } from "react"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { CampaignPlatform } from "../../../entities/campaign/model/types"
import { formatCurrency, formatNumber, formatPercent } from "../../../shared/lib/number"

export interface PlatformPerformanceDatum {
  platform: CampaignPlatform
  cost: number
  impressions: number
  clicks: number
  conversions: number
}

type DonutMetric = "cost" | "impressions" | "clicks" | "conversions"

interface PlatformPerformanceDonutProps {
  data: PlatformPerformanceDatum[]
  selectedPlatforms: CampaignPlatform[]
  onTogglePlatform: (platform: CampaignPlatform) => void
}

const METRIC_CONFIG: Record<DonutMetric, { label: string }> = {
  cost: { label: "비용" },
  impressions: { label: "노출수" },
  clicks: { label: "클릭수" },
  conversions: { label: "전환수" },
}

const PLATFORM_COLORS: Record<CampaignPlatform, string> = {
  Google: "#2563eb",
  Meta: "#ef4444",
  Naver: "#16a34a",
}

function formatMetricValue(metric: DonutMetric, value: number): string {
  if (metric === "cost") {
    return formatCurrency(value)
  }
  return formatNumber(value)
}

export function PlatformPerformanceDonut({
  data,
  selectedPlatforms,
  onTogglePlatform,
}: PlatformPerformanceDonutProps) {
  const [metric, setMetric] = useState<DonutMetric>("cost")

  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item[metric], 0)

    return data.map((item) => {
      const value = item[metric]
      const ratio = total > 0 ? (value / total) * 100 : 0

      return {
        ...item,
        value,
        ratio,
      }
    })
  }, [data, metric])

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="card">
      <div className="optional-header">
        <h2>플랫폼별 성과</h2>
        <div className="chip-group" aria-label="플랫폼별 성과 메트릭 토글">
          {(["cost", "impressions", "clicks", "conversions"] as DonutMetric[]).map((key) => (
            <button
              key={key}
              type="button"
              className={metric === key ? "chip active" : "chip"}
              onClick={() => setMetric(key)}
            >
              {METRIC_CONFIG[key].label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <p className="muted">표시할 플랫폼 데이터가 없습니다.</p>
      ) : (
        <div className="donut-layout">
          <div className="donut-box">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="platform"
                  innerRadius={72}
                  outerRadius={108}
                  paddingAngle={2}
                  onClick={(_, index) => {
                    if (typeof index !== "number") {
                      return
                    }

                    const target = chartData[index]
                    if (!target) {
                      return
                    }

                    onTogglePlatform(target.platform)
                  }}
                >
                  {chartData.map((item) => {
                    const isActive = selectedPlatforms.includes(item.platform)
                    return (
                      <Cell
                        key={item.platform}
                        fill={PLATFORM_COLORS[item.platform]}
                        opacity={isActive ? 1 : 0.28}
                        stroke={isActive ? "#0f172a" : "#ffffff"}
                        strokeWidth={isActive ? 2 : 1}
                        cursor="pointer"
                      />
                    )
                  })}
                </Pie>
                <Tooltip
                  formatter={(value) => {
                    if (typeof value !== "number") {
                      return value
                    }
                    return formatMetricValue(metric, value)
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="platform-summary">
            <p className="summary-total">
              총 {METRIC_CONFIG[metric].label}: {formatMetricValue(metric, totalValue)}
            </p>
            <ul className="platform-list" aria-label="플랫폼별 수치와 비중">
              {chartData.map((item) => {
                const isActive = selectedPlatforms.includes(item.platform)
                return (
                  <li key={item.platform} className={isActive ? "platform-item active" : "platform-item"}>
                    <button type="button" className="platform-toggle" onClick={() => onTogglePlatform(item.platform)}>
                      <span className="platform-dot" style={{ backgroundColor: PLATFORM_COLORS[item.platform] }} />
                      <span>{item.platform}</span>
                    </button>
                    <span>{formatMetricValue(metric, item.value)}</span>
                    <span>{formatPercent(item.ratio)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
