import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrendMetric } from '../../../features/global-filter/model/store'
import type { DailySeriesPoint } from '../../../shared/lib/aggregate'
import { formatNumber } from '../../../shared/lib/number'

interface DailyTrendChartProps {
  data: DailySeriesPoint[]
  selectedMetrics: TrendMetric[]
  onToggleMetric: (metric: TrendMetric) => void
}

const metricConfig: Record<
  TrendMetric,
  { label: string; color: string; dataKey: TrendMetric }
> = {
  impressions: {
    label: '노출수',
    color: '#818cf8',
    dataKey: 'impressions',
  },
  clicks: {
    label: '클릭수',
    color: '#34d399',
    dataKey: 'clicks',
  },
}

export function DailyTrendChart({
  data,
  selectedMetrics,
  onToggleMetric,
}: DailyTrendChartProps) {
  return (
    <section className="card">
      <div className="chart-header">
        <h2>일별 추이 차트</h2>
        <div className="chip-group" aria-label="일별 추이 메트릭 토글">
          {(['impressions', 'clicks'] as TrendMetric[]).map((metric) => {
            const isActive = selectedMetrics.includes(metric)
            const isOnlyOneSelected =
              isActive && selectedMetrics.length === 1

            return (
              <button
                key={metric}
                type="button"
                className={isActive ? 'chip active' : 'chip'}
                onClick={() => onToggleMetric(metric)}
                disabled={isOnlyOneSelected}
                aria-pressed={isActive}
              >
                {metricConfig[metric].label}
              </button>
            )
          })}
        </div>
      </div>

      {data.length === 0 ? (
        <p className="muted">선택한 필터 조건에 해당하는 일별 데이터가 없습니다.</p>
      ) : (
        <div className="chart-box">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 16, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={72} />
              <Tooltip
                contentStyle={{ background: '#0f1526', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                itemStyle={{ color: '#e2e8f0' }}
                formatter={(value) => {
                  if (typeof value === 'number') return formatNumber(value)
                  if (typeof value === 'string') {
                    const numeric = Number(value)
                    return Number.isFinite(numeric) ? formatNumber(numeric) : value
                  }
                  return ''
                }}
              />
              <Legend wrapperStyle={{ fontSize: 13, color: '#94a3b8' }} />

              {selectedMetrics.map((metric) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metricConfig[metric].dataKey}
                  name={metricConfig[metric].label}
                  stroke={metricConfig[metric].color}
                  dot={false}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}
