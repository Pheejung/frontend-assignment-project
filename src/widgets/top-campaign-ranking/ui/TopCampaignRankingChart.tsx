import { useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import type { CampaignTableRowData } from "../../../features/campaign-table/ui/CampaignManagementTable"
import { formatCurrency, formatPercent } from "../../../shared/lib/number"

type RankingMetric = "roas" | "ctr" | "cpc"

interface TopCampaignRankingChartProps {
  rows: CampaignTableRowData[]
}

const METRIC_LABEL: Record<RankingMetric, string> = {
  roas: "ROAS",
  ctr: "CTR",
  cpc: "CPC",
}

function formatRankingValue(metric: RankingMetric, value: number): string {
  if (metric === "cpc") {
    return formatCurrency(value)
  }
  return formatPercent(value)
}

export function TopCampaignRankingChart({ rows }: TopCampaignRankingChartProps) {
  const [metric, setMetric] = useState<RankingMetric>("roas")

  const rankingRows = useMemo(() => {
    const candidates = rows.filter((row) => row.hasStats)

    const sorted = [...candidates].sort((left, right) => {
      if (metric === "cpc") {
        if (left.cpc === right.cpc) {
          return right.totalCost - left.totalCost
        }
        return left.cpc - right.cpc
      }

      if (metric === "ctr") {
        if (left.ctr === right.ctr) {
          return right.totalCost - left.totalCost
        }
        return right.ctr - left.ctr
      }

      if (left.roas === right.roas) {
        return right.totalCost - left.totalCost
      }
      return right.roas - left.roas
    })

    return sorted.slice(0, 3).map((row, index) => ({
      rank: index + 1,
      name: row.name,
      value:
        metric === "cpc"
          ? row.cpc
          : metric === "ctr"
            ? row.ctr
            : row.roas,
      metric,
    }))
  }, [metric, rows])

  return (
    <section className="card">
      <div className="optional-header">
        <h2>캠페인 랭킹 Top3</h2>
        <div className="chip-group" aria-label="캠페인 랭킹 메트릭 토글">
          {(["roas", "ctr", "cpc"] as RankingMetric[]).map((key) => (
            <button
              key={key}
              type="button"
              className={metric === key ? "chip active" : "chip"}
              onClick={() => setMetric(key)}
            >
              {METRIC_LABEL[key]}
            </button>
          ))}
        </div>
      </div>

      {rankingRows.length === 0 ? (
        <p className="muted">랭킹을 계산할 캠페인 성과 데이터가 없습니다.</p>
      ) : (
        <>
          <div className="ranking-box">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={rankingRows} layout="vertical" margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f1526', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 13 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => {
                    if (typeof value !== "number") return value
                    return formatRankingValue(metric, value)
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <ol className="ranking-list">
            {rankingRows.map((row) => (
              <li key={`${row.name}-${row.rank}`}>
                <span>{row.rank}위</span>
                <span>{row.name}</span>
                <strong>{formatRankingValue(metric, row.value)}</strong>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  )
}
