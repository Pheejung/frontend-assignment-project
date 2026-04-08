import { formatCurrency, formatNumber, formatPercent } from "../../../shared/lib/number"

interface SummaryStatsSectionProps {
  campaignCount: number
  totalCost: number
  ctr: number
  cpc: number
  roas: number
}

export function SummaryStatsSection({
  campaignCount,
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
        <p className="muted">필터 조건 기준</p>
      </article>

      <article className="card">
        <h3>총 집행금액</h3>
        <p className="metric">{formatCurrency(totalCost)}</p>
        <p className="muted">필터 기간 기준 합계</p>
      </article>

      <article className="card">
        <h3>CTR / CPC</h3>
        <p className="metric">{formatPercent(ctr)}</p>
        <p className="muted">CPC {formatCurrency(cpc)}</p>
      </article>

      <article className="card">
        <h3>ROAS</h3>
        <p className="metric">{formatPercent(roas)}</p>
        <p className="muted">전환 가치 / 집행 비용</p>
      </article>
    </section>
  )
}
