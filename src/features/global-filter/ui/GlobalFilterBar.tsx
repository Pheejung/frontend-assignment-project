import type { CampaignPlatform, CampaignStatus } from "../../../entities/campaign/model/types"
import { Button } from "../../../shared/ui/Button"
import { Chip } from "../../../shared/ui/Chip"
import { Input } from "../../../shared/ui/Input"
import type { DateRange } from "../../../shared/lib/date"

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "진행중",
  paused: "일시중지",
  ended: "종료",
}

const statusOptions: CampaignStatus[] = ["active", "paused", "ended"]
const platformOptions: CampaignPlatform[] = ["Google", "Meta", "Naver"]

interface GlobalFilterBarProps {
  dateRange: DateRange
  statuses: CampaignStatus[]
  platforms: CampaignPlatform[]
  onDateRangeChange: (next: DateRange) => void
  onToggleStatus: (status: CampaignStatus) => void
  onTogglePlatform: (platform: CampaignPlatform) => void
  onReset: () => void
  onNotice: (message: string) => void
}

export function GlobalFilterBar({
  dateRange,
  statuses,
  platforms,
  onDateRangeChange,
  onToggleStatus,
  onTogglePlatform,
  onReset,
  onNotice,
}: GlobalFilterBarProps) {
  return (
    <section className="card filter-card" aria-label="글로벌 필터">
      <h2 className="sr-only">글로벌 필터</h2>
      <div className="filter-toolbar">
        <div className="filter-group period-group">
          <span className="group-label">집행기간</span>
          <label className="date-pill">
            <Input
              type="date"
              aria-label="집행 시작일"
              value={dateRange.from}
              onChange={(e) => {
                const from = e.target.value
                const to = from > dateRange.to ? from : dateRange.to
                onDateRangeChange({ from, to })
              }}
            />
          </label>
          <span className="range-separator">~</span>
          <label className="date-pill">
            <Input
              type="date"
              aria-label="집행 종료일"
              value={dateRange.to}
              min={dateRange.from}
              onChange={(e) => {
                const to = e.target.value
                const from = to < dateRange.from ? to : dateRange.from
                onDateRangeChange({ from, to })
              }}
            />
          </label>
        </div>

        <span className="toolbar-divider" aria-hidden="true" />

        <div className="filter-group" role="group" aria-label="상태 필터">
          <span className="group-label">상태</span>
          <div className="chip-group compact">
            {statusOptions.map((status) => {
              const isActive = statuses.includes(status)
              return (
                <Chip
                  key={status}
                  active={isActive}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (isActive && statuses.length === 1) {
                      onNotice("상태는 최소 1개 이상 선택해야 합니다.")
                      return
                    }
                    onToggleStatus(status)
                  }}
                >
                  {STATUS_LABEL[status]}
                </Chip>
              )
            })}
          </div>
        </div>

        <span className="toolbar-divider" aria-hidden="true" />

        <div className="filter-group" role="group" aria-label="매체 필터">
          <span className="group-label">매체</span>
          <div className="chip-group compact">
            {platformOptions.map((platform) => {
              const isActive = platforms.includes(platform)
              return (
                <Chip
                  key={platform}
                  active={isActive}
                  aria-pressed={isActive}
                  onClick={() => {
                    if (isActive && platforms.length === 1) {
                      onNotice("매체는 최소 1개 이상 선택해야 합니다.")
                      return
                    }
                    onTogglePlatform(platform)
                  }}
                >
                  {platform}
                </Chip>
              )
            })}
          </div>
        </div>

        <span className="toolbar-divider" aria-hidden="true" />

        <Button variant="secondary" className="reset-inline" onClick={onReset} aria-label="필터 초기화">
          초기화
        </Button>
      </div>
    </section>
  )
}
