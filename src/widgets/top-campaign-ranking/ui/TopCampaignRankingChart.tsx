import { useMemo, useState } from "react"
import type { CampaignTableRowData } from "../../../features/campaign-table/model/types"
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

    const topRows = sorted.slice(0, 3).map((row, index) => ({
      id: row.id,
      rank: index + 1,
      name: row.name,
      platform: row.platform,
      totalCost: row.totalCost,
      value: metric === "cpc" ? row.cpc : metric === "ctr" ? row.ctr : row.roas,
    }))

    const values = topRows.map((row) => row.value)
    if (values.length === 0) {
      return []
    }

    if (metric === "cpc") {
      const best = Math.min(...values)
      const worst = Math.max(...values)
      const span = worst - best

      return topRows.map((row) => ({
        ...row,
        barPercent: span === 0 ? 100 : ((worst - row.value) / span) * 100,
      }))
    }

    const best = Math.max(...values)
    return topRows.map((row) => ({
      ...row,
      barPercent: best <= 0 ? 0 : (row.value / best) * 100,
    }))
  }, [metric, rows])

  return (
    <section className="card top3-card">
      <div className="top3-header">
        <h2>캠페인 랭킹 Top 3</h2>
        <div className="top3-toggle" aria-label="캠페인 랭킹 메트릭 토글">
          {(["roas", "ctr", "cpc"] as RankingMetric[]).map((key) => (
            <button
              key={key}
              type="button"
              className={metric === key ? "top3-segment active" : "top3-segment"}
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
        <ol className="top3-list">
          {rankingRows.map((row) => (
            <li key={row.id} className="top3-item">
              <div className="top3-row">
                <span className="top3-rank">{row.rank}</span>
                <div className="top3-name-wrap">
                  <strong className="top3-name">{row.name}</strong>
                  <span className="top3-platform">{row.platform}</span>
                </div>
                <strong className="top3-value">{formatRankingValue(metric, row.value)}</strong>
              </div>
              <div className="top3-track" aria-hidden="true">
                <span className="top3-fill" style={{ width: `${Math.max(8, row.barPercent)}%` }} />
              </div>
              <p className="top3-sub">집행금액 {formatCurrency(row.totalCost)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
