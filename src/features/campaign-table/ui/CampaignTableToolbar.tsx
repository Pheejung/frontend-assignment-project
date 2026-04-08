import type { CampaignStatus } from "../../../entities/campaign/model/types"
import { Button } from "../../../shared/ui/Button"
import { Input } from "../../../shared/ui/Input"
import { Select } from "../../../shared/ui/Select"

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
      <div className="toolbar-fields">
        <label className="field-inline">
          <span>검색</span>
          <Input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="캠페인명 검색"
            aria-label="캠페인명 검색"
          />
        </label>

        <label className="field-inline">
          <span>일괄 상태 변경</span>
          <Select
            value={bulkStatus}
            onChange={(e) => onBulkStatusChange(e.target.value as CampaignStatus)}
            aria-label="일괄 상태"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABEL[status]}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <Button
        variant="primary"
        className="toolbar-apply-btn"
        onClick={onApplyBulkStatus}
        disabled={selectedCount === 0}
      >
        일괄 적용
      </Button>
    </div>
  )
}
