import { useMemo } from 'react'
import { useCampaignsQuery } from '../entities/campaign/model/useCampaignsQuery'
import type { CampaignPlatform, CampaignStatus } from '../entities/campaign/model/types'
import { useDailyStatsQuery } from '../entities/daily-stat/model/useDailyStatsQuery'
import { useDashboardStore } from '../features/global-filter/model/store'
import {
  aggregateByDate,
  aggregateByCampaignId,
  aggregateTotals,
  createEmptyTotals,
} from '../shared/lib/aggregate'
import { filterCampaigns, filterDailyStats } from '../shared/lib/filter'
import { calculateDerivedMetrics } from '../shared/lib/metrics'
import { formatCurrency, formatNumber, formatPercent } from '../shared/lib/number'
import { ErrorFallback } from '../shared/ui/ErrorFallback'
import { Loading } from '../shared/ui/Loading'
import { DailyTrendChart } from '../widgets/daily-trend-chart/ui/DailyTrendChart'

const statusOptions: CampaignStatus[] = ['active', 'paused', 'ended']
const platformOptions: CampaignPlatform[] = ['Google', 'Meta', 'Naver']

export default function DashboardApp() {
  const campaignsQuery = useCampaignsQuery()
  const dailyStatsQuery = useDailyStatsQuery()

  const dateRange = useDashboardStore((state) => state.dateRange)
  const statuses = useDashboardStore((state) => state.statuses)
  const platforms = useDashboardStore((state) => state.platforms)
  const trendMetrics = useDashboardStore((state) => state.trendMetrics)
  const localCampaigns = useDashboardStore((state) => state.localCampaigns)
  const localDailyStats = useDashboardStore((state) => state.localDailyStats)
  const setDateRange = useDashboardStore((state) => state.setDateRange)
  const toggleStatus = useDashboardStore((state) => state.toggleStatus)
  const togglePlatform = useDashboardStore((state) => state.togglePlatform)
  const toggleTrendMetric = useDashboardStore((state) => state.toggleTrendMetric)
  const resetFilters = useDashboardStore((state) => state.resetFilters)

  const campaignsData = campaignsQuery.data
  const dailyStatsData = dailyStatsQuery.data

  const mergedCampaigns = useMemo(
    () => [...(campaignsData?.campaigns ?? []), ...localCampaigns],
    [campaignsData?.campaigns, localCampaigns],
  )

  const mergedDailyStats = useMemo(
    () => [...(dailyStatsData?.dailyStats ?? []), ...localDailyStats],
    [dailyStatsData?.dailyStats, localDailyStats],
  )

  const filteredCampaigns = useMemo(
    () => filterCampaigns(mergedCampaigns, { dateRange, statuses, platforms }),
    [mergedCampaigns, dateRange, statuses, platforms],
  )

  const filteredCampaignIds = useMemo(
    () => new Set(filteredCampaigns.map((campaign) => campaign.id)),
    [filteredCampaigns],
  )

  const filteredStats = useMemo(
    () => filterDailyStats(mergedDailyStats, filteredCampaignIds, dateRange),
    [mergedDailyStats, filteredCampaignIds, dateRange],
  )

  const totals = useMemo(() => aggregateTotals(filteredStats), [filteredStats])
  const derivedMetrics = useMemo(() => calculateDerivedMetrics(totals), [totals])
  const dailySeries = useMemo(() => aggregateByDate(filteredStats), [filteredStats])
  const campaignTotals = useMemo(() => aggregateByCampaignId(filteredStats), [filteredStats])

  const previewRows = useMemo(
    () =>
      filteredCampaigns.slice(0, 8).map((campaign) => {
        const stat = campaignTotals.get(campaign.id) ?? createEmptyTotals()
        return {
          id: campaign.id,
          name: campaign.name,
          platform: campaign.platform,
          status: campaign.status,
          cost: stat.cost,
          ...calculateDerivedMetrics(stat),
        }
      }),
    [campaignTotals, filteredCampaigns],
  )

  if (campaignsQuery.isLoading || dailyStatsQuery.isLoading) {
    return (
      <main className="app-shell">
        <h1>Campaign Dashboard - Day1 Foundation</h1>
        <Loading />
      </main>
    )
  }

  if (campaignsQuery.error || dailyStatsQuery.error) {
    const message =
      campaignsQuery.error instanceof Error
        ? campaignsQuery.error.message
        : dailyStatsQuery.error instanceof Error
          ? dailyStatsQuery.error.message
          : 'Failed to load data.'

    return (
      <main className="app-shell">
        <h1>Campaign Dashboard - Day1 Foundation</h1>
        <ErrorFallback message={message} />
      </main>
    )
  }

  if (!campaignsData || !dailyStatsData) {
    return (
      <main className="app-shell">
        <h1>Campaign Dashboard - Day1 Foundation</h1>
        <ErrorFallback message="No data returned from API." />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header>
        <h1>Campaign Dashboard - Day1 Foundation</h1>
        <p className="muted">
          Async API + normalization + global filter pipeline are connected.
        </p>
      </header>

      <section className="card filter-card">
        <h2>Global Filter (Store)</h2>
        <div className="filter-grid">
          <label>
            <span>From</span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(event) =>
                setDateRange({
                  from: event.target.value,
                  to: dateRange.to,
                })
              }
            />
          </label>

          <label>
            <span>To</span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(event) =>
                setDateRange({
                  from: dateRange.from,
                  to: event.target.value,
                })
              }
            />
          </label>

          <div>
            <span>Status</span>
            <div className="chip-group">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={statuses.includes(status) ? 'chip active' : 'chip'}
                  onClick={() => toggleStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span>Platform</span>
            <div className="chip-group">
              {platformOptions.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  className={platforms.includes(platform) ? 'chip active' : 'chip'}
                  onClick={() => togglePlatform(platform)}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="secondary" onClick={resetFilters}>
            Reset
          </button>
        </div>
      </section>

      <section className="stats-grid">
        <article className="card">
          <h3>Campaigns</h3>
          <p className="metric">{formatNumber(filteredCampaigns.length)}</p>
          <p className="muted">
            raw {formatNumber(campaignsData.rawCount)} / dropped {formatNumber(campaignsData.droppedCount)}
          </p>
        </article>

        <article className="card">
          <h3>Daily Stats Rows</h3>
          <p className="metric">{formatNumber(filteredStats.length)}</p>
          <p className="muted">
            raw {formatNumber(dailyStatsData.rawCount)} / dropped {formatNumber(dailyStatsData.droppedCount)} /
            merged {formatNumber(dailyStatsData.mergedCount)}
          </p>
        </article>

        <article className="card">
          <h3>Total Cost</h3>
          <p className="metric">{formatCurrency(totals.cost)}</p>
          <p className="muted">Filtered period spend</p>
        </article>

        <article className="card">
          <h3>Derived Metrics</h3>
          <p className="muted">
            CTR {formatPercent(derivedMetrics.ctr)} / CPC {formatCurrency(derivedMetrics.cpc)} / ROAS{' '}
            {formatPercent(derivedMetrics.roas)}
          </p>
        </article>
      </section>

      <DailyTrendChart
        data={dailySeries}
        selectedMetrics={trendMetrics}
        onToggleMetric={toggleTrendMetric}
      />

      <section className="card">
        <h2>Campaign Preview (Top 8)</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Platform</th>
              <th>Cost</th>
              <th>CTR</th>
              <th>CPC</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {previewRows.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.status}</td>
                <td>{row.platform}</td>
                <td>{formatCurrency(row.cost)}</td>
                <td>{formatPercent(row.ctr)}</td>
                <td>{formatCurrency(row.cpc)}</td>
                <td>{formatPercent(row.roas)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </main>
  )
}
