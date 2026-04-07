import type { CampaignStatus } from "../../../entities/campaign/model/types"

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "진행중",
  paused: "일시중지",
  ended: "종료",
}

const STATUS_OPTIONS: CampaignStatus[] = ["active", "paused", "ended"]

interface CampaignTableToolbarProps {
  searchInput: string
  onSearchInputChange: (value: string) => void
  bulkStatus: CampaignStatus
  onBulkStatusChange: (status: CampaignStatus) => void
  selectedCount: number
  onApplyBulkStatus: () => void
}

export function CampaignTableToolbar({
  searchInput,
  onSearchInputChange,
  bulkStatus,
  onBulkStatusChange,
  selectedCount,
  onApplyBulkStatus,
}: CampaignTableToolbarProps) {
  return (
    <div className="table-toolbar">
      <label className="field-inline">
        <span>검색</span>
        <input
          type="search"
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="캠페인명 검색"
          aria-label="캠페인명 검색"
        />
      </label>

      <label className="field-inline">
        <span>일괄 상태 변경</span>
        <select
          value={bulkStatus}
          onChange={(event) => onBulkStatusChange(event.target.value as CampaignStatus)}
          aria-label="일괄 상태"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABEL[status]}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="primary" onClick={onApplyBulkStatus}>
        적용 ({selectedCount})
      </button>
    </div>
  )
}
