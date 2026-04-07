import { formatCurrency, formatNumber, formatPercent } from "../../shared/lib/number"

interface SummaryStatsSectionProps {
  campaignCount: number
  campaignRawCount: number
  campaignDroppedCount: number
  dailyStatCount: number
  dailyStatRawCount: number
  dailyStatDroppedCount: number
  dailyStatMergedCount: number
  totalCost: number
  ctr: number
  cpc: number
  roas: number
}

export function SummaryStatsSection({
  campaignCount,
  campaignRawCount,
  campaignDroppedCount,
  dailyStatCount,
  dailyStatRawCount,
  dailyStatDroppedCount,
  dailyStatMergedCount,
  totalCost,
  ctr,
  cpc,
  roas,
}: SummaryStatsSectionProps) {
  return (
    <section className="stats-grid">
      <article className="card">
        <h3>캠페인 수</h3>
        <p className="metric">{formatNumber(campaignCount)}</p>
        <p className="muted">
          raw {formatNumber(campaignRawCount)} / dropped {formatNumber(campaignDroppedCount)}
        </p>
      </article>

      <article className="card">
        <h3>일별 성과 행</h3>
        <p className="metric">{formatNumber(dailyStatCount)}</p>
        <p className="muted">
          raw {formatNumber(dailyStatRawCount)} / dropped {formatNumber(dailyStatDroppedCount)} / merged {" "}
          {formatNumber(dailyStatMergedCount)}
        </p>
      </article>

      <article className="card">
        <h3>총 집행금액</h3>
        <p className="metric">{formatCurrency(totalCost)}</p>
        <p className="muted">필터 기간 기준 합계</p>
      </article>

      <article className="card">
        <h3>파생 지표</h3>
        <p className="muted">
          CTR {formatPercent(ctr)} / CPC {formatCurrency(cpc)} / ROAS {formatPercent(roas)}
        </p>
      </article>
    </section>
  )
}
