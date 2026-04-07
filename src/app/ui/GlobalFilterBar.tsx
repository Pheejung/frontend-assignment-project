import type { CampaignPlatform, CampaignStatus } from "../../entities/campaign/model/types"
import type { DateRange } from "../../shared/lib/date"

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
            <input
              type="date"
              aria-label="집행 시작일"
              value={dateRange.from}
              onChange={(e) => onDateRangeChange({ from: e.target.value, to: dateRange.to })}
            />
          </label>
          <span className="range-separator">~</span>
          <label className="date-pill">
            <input
              type="date"
              aria-label="집행 종료일"
              value={dateRange.to}
              onChange={(e) => onDateRangeChange({ from: dateRange.from, to: e.target.value })}
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
                <button
                  key={status}
                  type="button"
                  className={isActive ? "chip active" : "chip"}
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
                </button>
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
                <button
                  key={platform}
                  type="button"
                  className={isActive ? "chip active" : "chip"}
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
                </button>
              )
            })}
          </div>
        </div>

        <span className="toolbar-divider" aria-hidden="true" />

        <button type="button" className="secondary reset-inline" onClick={onReset} aria-label="필터 초기화">
          초기화
        </button>
      </div>
    </section>
  )
}
