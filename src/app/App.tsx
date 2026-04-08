import { useState } from 'react';
import type {
  Campaign,
  CampaignPlatform,
} from '../entities/campaign/model/types';
import { CampaignCreateModal } from '../features/campaign-create/ui/CampaignCreateModal';
import { CampaignManagementTable } from '../features/campaign-table/ui/CampaignManagementTable';
import { createLocalCampaignId } from '../shared/lib/id';
import { Button } from '../shared/ui/Button';
import { ErrorFallback } from '../shared/ui/ErrorFallback';
import { Loading } from '../shared/ui/Loading';
import { DailyTrendChart } from '../widgets/daily-trend-chart/ui/DailyTrendChart';
import { PlatformPerformanceDonut } from '../widgets/platform-performance-donut/ui/PlatformPerformanceDonut';
import { TopCampaignRankingChart } from '../widgets/top-campaign-ranking/ui/TopCampaignRankingChart';
import { useDashboardData } from './hooks/useDashboardData';
import { useFilterNotice } from './hooks/useFilterNotice';
import { useGlobalFilter } from '../features/global-filter/model/useGlobalFilter';
import { usePlatformPerformanceData } from '../widgets/platform-performance-donut/model/usePlatformPerformanceData';
import { GlobalFilterBar } from '../features/global-filter/ui/GlobalFilterBar';
import { SummaryStatsSection } from '../widgets/summary-stats/ui/SummaryStatsSection';

export default function DashboardApp() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { filterNotice, showFilterNotice } = useFilterNotice();

  const {
    dateRange,
    statuses,
    platforms,
    trendMetrics,
    setDateRange,
    toggleStatus,
    togglePlatform,
    toggleTrendMetric,
    resetFilters,
    addLocalCampaign,
    bulkUpdateCampaignStatus,
  } = useGlobalFilter();

  const {
    queryMeta,
    isDataReady,
    mergedCampaigns,
    mergedDailyStats,
    filteredCampaigns,
    totals,
    derivedMetrics,
    dailySeries,
    campaignTableRows,
  } = useDashboardData({ dateRange, statuses, platforms });

  const platformPerformanceData = usePlatformPerformanceData(
    mergedCampaigns,
    mergedDailyStats,
  );

  function handleCreateCampaign(payload: {
    name: string;
    platform: CampaignPlatform;
    budget: number;
    initialSpend: number;
    startDate: string;
    endDate: string;
  }) {
    const newCampaign: Campaign = {
      id: createLocalCampaignId(),
      name: payload.name,
      platform: payload.platform,
      status: 'active',
      budget: payload.budget,
      startDate: payload.startDate,
      endDate: payload.endDate,
    };
    addLocalCampaign(newCampaign, payload.initialSpend);
    setIsCreateModalOpen(false);
  }

  if (queryMeta.isLoading) {
    return (
      <main className="app-shell">
        <h1>마케팅 캠페인 대시보드</h1>
        <Loading />
      </main>
    );
  }

  if (queryMeta.error) {
    return (
      <main className="app-shell">
        <h1>마케팅 캠페인 대시보드</h1>
        <ErrorFallback message={queryMeta.error.message} />
      </main>
    );
  }

  if (!isDataReady) {
    return (
      <main className="app-shell">
        <h1>마케팅 캠페인 대시보드</h1>
        <ErrorFallback message="API에서 데이터를 불러오지 못했습니다." />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <div>
          <h1>마케팅 캠페인 대시보드</h1>
          <p className="muted">
            필터 변경 시 차트와 테이블이 동일한 데이터 파이프라인으로
            동기화됩니다.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
          캠페인 등록
        </Button>
      </header>

      <GlobalFilterBar
        dateRange={dateRange}
        statuses={statuses}
        platforms={platforms}
        onDateRangeChange={setDateRange}
        onToggleStatus={toggleStatus}
        onTogglePlatform={togglePlatform}
        onReset={resetFilters}
        onNotice={showFilterNotice}
      />

      {filterNotice ? (
        <div className="toast-message" role="status" aria-live="polite">
          {filterNotice}
        </div>
      ) : null}

      <SummaryStatsSection
        campaignCount={filteredCampaigns.length}
        totalCost={totals.cost}
        ctr={derivedMetrics.ctr}
        cpc={derivedMetrics.cpc}
        roas={derivedMetrics.roas}
      />

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
        onNotice={showFilterNotice}
      />

      <CampaignCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateCampaign}
      />
    </main>
  );
}
