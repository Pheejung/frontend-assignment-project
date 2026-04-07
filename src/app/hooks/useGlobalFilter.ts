import { useDashboardStore } from "../../features/global-filter/model/store"

export function useGlobalFilter() {
  const dateRange = useDashboardStore((state) => state.dateRange)
  const statuses = useDashboardStore((state) => state.statuses)
  const platforms = useDashboardStore((state) => state.platforms)
  const trendMetrics = useDashboardStore((state) => state.trendMetrics)
  const setDateRange = useDashboardStore((state) => state.setDateRange)
  const toggleStatus = useDashboardStore((state) => state.toggleStatus)
  const togglePlatform = useDashboardStore((state) => state.togglePlatform)
  const toggleTrendMetric = useDashboardStore((state) => state.toggleTrendMetric)
  const resetFilters = useDashboardStore((state) => state.resetFilters)
  const addLocalCampaign = useDashboardStore((state) => state.addLocalCampaign)
  const bulkUpdateCampaignStatus = useDashboardStore((state) => state.bulkUpdateCampaignStatus)

  return {
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
  }
}
