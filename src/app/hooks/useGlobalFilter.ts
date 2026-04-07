import { useShallow } from "zustand/react/shallow"
import { useDashboardStore } from "../../features/global-filter/model/store"

export function useGlobalFilter() {
  return useDashboardStore(
    useShallow((state) => ({
      dateRange: state.dateRange,
      statuses: state.statuses,
      platforms: state.platforms,
      trendMetrics: state.trendMetrics,
      setDateRange: state.setDateRange,
      toggleStatus: state.toggleStatus,
      togglePlatform: state.togglePlatform,
      toggleTrendMetric: state.toggleTrendMetric,
      resetFilters: state.resetFilters,
      addLocalCampaign: state.addLocalCampaign,
      bulkUpdateCampaignStatus: state.bulkUpdateCampaignStatus,
    })),
  )
}
