import { useEffect, useMemo, useRef, useState } from "react"
import { useCampaignsQuery } from "../entities/campaign/model/useCampaignsQuery"
import type { Campaign, CampaignPlatform, CampaignStatus } from "../entities/campaign/model/types"
import { useDailyStatsQuery } from "../entities/daily-stat/model/useDailyStatsQuery"
import { CampaignCreateModal } from "../features/campaign-create/ui/CampaignCreateModal"
import { CampaignManagementTable, type CampaignTableRowData } from "../features/campaign-table/ui/CampaignManagementTable"
import { useDashboardStore } from "../features/global-filter/model/store"
import {
  aggregateByCampaignId,
  aggregateByDate,
  aggregateTotals,
  createEmptyTotals,
} from "../shared/lib/aggregate"
import { filterCampaigns, filterDailyStats } from "../shared/lib/filter"
import { calculateDerivedMetrics } from "../shared/lib/metrics"
import { formatCurrency, formatNumber, formatPercent } from "../shared/lib/number"
import { ErrorFallback } from "../shared/ui/ErrorFallback"
import { Loading } from "../shared/ui/Loading"
import { DailyTrendChart } from "../widgets/daily-trend-chart/ui/DailyTrendChart"
import {
  PlatformPerformanceDonut,
  type PlatformPerformanceDatum,
} from "../widgets/platform-performance-donut/ui/PlatformPerformanceDonut"
import { TopCampaignRankingChart } from "../widgets/top-campaign-ranking/ui/TopCampaignRankingChart"

const statusOptions: CampaignStatus[] = ["active", "paused", "ended"]
const platformOptions: CampaignPlatform[] = ["Google", "Meta", "Naver"]

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "진행중",
  paused: "일시중지",
  ended: "종료",
}

function createLocalCampaignId(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function DashboardApp() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filterNotice, setFilterNotice] = useState<string | null>(null)
  const filterNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const campaignsQuery = useCampaignsQuery()
  const dailyStatsQuery = useDailyStatsQuery()

  const dateRange = useDashboardStore((state) => state.dateRange)
  const statuses = useDashboardStore((state) => state.statuses)
  const platforms = useDashboardStore((state) => state.platforms)
  const trendMetrics = useDashboardStore((state) => state.trendMetrics)
  const localCampaigns = useDashboardStore((state) => state.localCampaigns)
  const localDailyStats = useDashboardStore((state) => state.localDailyStats)
  const statusOverrides = useDashboardStore((state) => state.statusOverrides)
  const spendOverrides = useDashboardStore((state) => state.spendOverrides)
  const setDateRange = useDashboardStore((state) => state.setDateRange)
  const toggleStatus = useDashboardStore((state) => state.toggleStatus)
  const togglePlatform = useDashboardStore((state) => state.togglePlatform)
  const toggleTrendMetric = useDashboardStore((state) => state.toggleTrendMetric)
  const resetFilters = useDashboardStore((state) => state.resetFilters)
  const addLocalCampaign = useDashboardStore((state) => state.addLocalCampaign)
  const bulkUpdateCampaignStatus = useDashboardStore((state) => state.bulkUpdateCampaignStatus)

  const showFilterNotice = (message: string) => {
    setFilterNotice(message)

    if (filterNoticeTimerRef.current) {
      clearTimeout(filterNoticeTimerRef.current)
    }

    filterNoticeTimerRef.current = setTimeout(() => {
      setFilterNotice(null)
    }, 1800)
  }

  useEffect(() => {
    return () => {
      if (filterNoticeTimerRef.current) {
        clearTimeout(filterNoticeTimerRef.current)
      }
    }
  }, [])

  const campaignsData = campaignsQuery.data
  const dailyStatsData = dailyStatsQuery.data

  const mergedCampaigns = useMemo(() => {
    const combined = [...(campaignsData?.campaigns ?? []), ...localCampaigns]

    return combined.map((campaign) => {
      const overriddenStatus = statusOverrides[campaign.id]
      if (!overriddenStatus) {
        return campaign
      }

      return {
        ...campaign,
        status: overriddenStatus,
      }
    })
  }, [campaignsData?.campaigns, localCampaigns, statusOverrides])

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

  const campaignsForDonut = useMemo(
    () =>
      filterCampaigns(mergedCampaigns, {
        dateRange,
        statuses,
        platforms: platformOptions,
      }),
    [mergedCampaigns, dateRange, statuses],
  )

  const campaignIdsForDonut = useMemo(
    () => new Set(campaignsForDonut.map((campaign) => campaign.id)),
    [campaignsForDonut],
  )

  const statsForDonut = useMemo(
    () => filterDailyStats(mergedDailyStats, campaignIdsForDonut, dateRange),
    [mergedDailyStats, campaignIdsForDonut, dateRange],
  )

  const campaignTableRows = useMemo<CampaignTableRowData[]>(() => {
    return filteredCampaigns.map((campaign) => {
      const stat = campaignTotals.get(campaign.id)
      const totalsForCampaign = stat ?? createEmptyTotals()
      const metrics = calculateDerivedMetrics(totalsForCampaign)
      const fallbackSpend = spendOverrides[campaign.id] ?? 0

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        platform: campaign.platform,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        totalCost: stat ? stat.cost : fallbackSpend,
        ctr: metrics.ctr,
        cpc: metrics.cpc,
        roas: metrics.roas,
        hasStats: Boolean(stat),
      }
    })
  }, [filteredCampaigns, campaignTotals, spendOverrides])

  const platformPerformanceData = useMemo<PlatformPerformanceDatum[]>(() => {
    const campaignPlatformMap = new Map(campaignsForDonut.map((campaign) => [campaign.id, campaign.platform]))

    const buckets: Record<CampaignPlatform, Omit<PlatformPerformanceDatum, "platform">> = {
      Google: { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
      Meta: { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
      Naver: { cost: 0, impressions: 0, clicks: 0, conversions: 0 },
    }

    for (const stat of statsForDonut) {
      const platform = campaignPlatformMap.get(stat.campaignId)
      if (!platform) {
        continue
      }

      const target = buckets[platform]
      target.cost += stat.cost
      target.impressions += stat.impressions
      target.clicks += stat.clicks
      target.conversions += stat.conversions
    }

    return platformOptions.map((platform) => ({
      platform,
      ...buckets[platform],
    }))
  }, [campaignsForDonut, statsForDonut])

  function handleCreateCampaign(payload: {
    name: string
    platform: CampaignPlatform
    budget: number
    initialSpend: number
    startDate: string
    endDate: string
  }) {
    const newCampaign: Campaign = {
      id: createLocalCampaignId(),
      name: payload.name,
      platform: payload.platform,
      status: "active",
      budget: payload.budget,
      startDate: payload.startDate,
      endDate: payload.endDate,
    }

    addLocalCampaign(newCampaign, payload.initialSpend)
    setIsCreateModalOpen(false)
  }

  if (campaignsQuery.isLoading || dailyStatsQuery.isLoading) {
    return (
      <main className="app-shell">
        <h1>마케팅 캠페인 대시보드</h1>
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
          : "Failed to load data."

    return (
      <main className="app-shell">
        <h1>마케팅 캠페인 대시보드</h1>
        <ErrorFallback message={message} />
      </main>
    )
  }

  if (!campaignsData || !dailyStatsData) {
    return (
      <main className="app-shell">
        <h1>마케팅 캠페인 대시보드</h1>
        <ErrorFallback message="No data returned from API." />
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <h1>마케팅 캠페인 대시보드</h1>
          <p className="muted">필터 변경 시 차트와 테이블이 동일한 데이터 파이프라인으로 동기화됩니다.</p>
        </div>
        <button type="button" className="primary" onClick={() => setIsCreateModalOpen(true)}>
          캠페인 등록
        </button>
      </header>

      <section className="card filter-card">
        <h2 className="sr-only">글로벌 필터</h2>
        <div className="filter-toolbar">
          <div className="filter-group period-group">
            <span className="group-label">집행기간</span>
            <label className="date-pill">
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
            <span className="range-separator">~</span>
            <label className="date-pill">
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
          </div>

          <span className="toolbar-divider" aria-hidden="true" />

          <div className="filter-group">
            <span className="group-label">상태</span>
            <div className="chip-group compact">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={statuses.includes(status) ? "chip active" : "chip"}
                  onClick={() => {
                    if (statuses.includes(status) && statuses.length === 1) {
                      showFilterNotice("상태는 최소 1개 이상 선택해야 합니다.")
                      return
                    }

                    toggleStatus(status)
                  }}
                >
                  {STATUS_LABEL[status]}
                </button>
              ))}
            </div>
          </div>

          <span className="toolbar-divider" aria-hidden="true" />

          <div className="filter-group">
            <span className="group-label">매체</span>
            <div className="chip-group compact">
              {platformOptions.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  className={platforms.includes(platform) ? "chip active" : "chip"}
                  onClick={() => {
                    if (platforms.includes(platform) && platforms.length === 1) {
                      showFilterNotice("매체는 최소 1개 이상 선택해야 합니다.")
                      return
                    }

                    togglePlatform(platform)
                  }}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <span className="toolbar-divider" aria-hidden="true" />

          <button type="button" className="secondary reset-inline" onClick={resetFilters}>
            초기화
          </button>
        </div>
      </section>

      {filterNotice ? (
        <div className="toast-message" role="status" aria-live="polite">
          {filterNotice}
        </div>
      ) : null}

      <section className="stats-grid">
        <article className="card">
          <h3>캠페인 수</h3>
          <p className="metric">{formatNumber(filteredCampaigns.length)}</p>
          <p className="muted">
            raw {formatNumber(campaignsData.rawCount)} / dropped {formatNumber(campaignsData.droppedCount)}
          </p>
        </article>

        <article className="card">
          <h3>일별 성과 행</h3>
          <p className="metric">{formatNumber(filteredStats.length)}</p>
          <p className="muted">
            raw {formatNumber(dailyStatsData.rawCount)} / dropped {formatNumber(dailyStatsData.droppedCount)} / merged{" "}
            {formatNumber(dailyStatsData.mergedCount)}
          </p>
        </article>

        <article className="card">
          <h3>총 집행금액</h3>
          <p className="metric">{formatCurrency(totals.cost)}</p>
          <p className="muted">필터 기간 기준 합계</p>
        </article>

        <article className="card">
          <h3>파생 지표</h3>
          <p className="muted">
            CTR {formatPercent(derivedMetrics.ctr)} / CPC {formatCurrency(derivedMetrics.cpc)} / ROAS{" "}
            {formatPercent(derivedMetrics.roas)}
          </p>
        </article>
      </section>

      <DailyTrendChart
        data={dailySeries}
        selectedMetrics={trendMetrics}
        onToggleMetric={toggleTrendMetric}
      />

      <section className="optional-grid">
        <PlatformPerformanceDonut
          data={platformPerformanceData}
          selectedPlatforms={platforms}
          onTogglePlatform={togglePlatform}
        />
        <TopCampaignRankingChart rows={campaignTableRows} />
      </section>

      <CampaignManagementTable
        rows={campaignTableRows}
        onBulkStatusChange={bulkUpdateCampaignStatus}
      />

      <CampaignCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />
    </main>
  )
}
