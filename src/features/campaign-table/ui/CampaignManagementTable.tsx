import { useEffect, useMemo, useState } from "react"
import type { CampaignStatus } from "../../../entities/campaign/model/types"
import { formatCurrency, formatPercent } from "../../../shared/lib/number"
import { formatPeriod } from "../lib/tableUtils"
import { useCampaignTableState } from "../model/useCampaignTableState"
import type { CampaignTableRowData, SortKey } from "../model/types"
import { CampaignTablePagination } from "./CampaignTablePagination"
import { CampaignTableToolbar } from "./CampaignTableToolbar"

interface CampaignManagementTableProps {
  rows: CampaignTableRowData[]
  onBulkStatusChange: (campaignIds: string[], status: CampaignStatus) => void
}

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "진행중",
  paused: "일시중지",
  ended: "종료",
}

export function CampaignManagementTable({ rows, onBulkStatusChange }: CampaignManagementTableProps) {
  const {
    searchInput,
    setSearchInput,
    searchedRows,
    pagedRows,
    totalPages,
    page,
    setPage,
    toggleSort,
    getSortDirection,
    getSortPriority,
  } = useCampaignTableState(rows)

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<CampaignStatus>("active")

  useEffect(() => {
    const validIds = new Set(rows.map((row) => row.id))
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)))
  }, [rows])

  const pageIds = useMemo(() => pagedRows.map((row) => row.id), [pagedRows])
  const isPageAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  function toggleRowSelection(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]))
  }

  function togglePageSelection(checked: boolean) {
    if (checked) {
      setSelectedIds((prev) => {
        const merged = new Set([...prev, ...pageIds])
        return [...merged]
      })
      return
    }

    setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)))
  }

  function applyBulkStatusChange() {
    if (selectedIds.length === 0) {
      return
    }

    onBulkStatusChange(selectedIds, bulkStatus)
    setSelectedIds([])
  }

  function renderSortBadge(key: SortKey) {
    const direction = getSortDirection(key)
    if (!direction) return ""

    const priority = getSortPriority(key)
    const arrow = direction === "asc" ? "▲" : "▼"
    return `${arrow}${priority ?? ""}`
  }

  return (
    <section className="card">
      <div className="table-header">
        <h2>캠페인 관리 테이블</h2>
        <CampaignTableToolbar
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          bulkStatus={bulkStatus}
          onBulkStatusChange={setBulkStatus}
          selectedCount={selectedIds.length}
          onApplyBulkStatus={applyBulkStatusChange}
        />
      </div>

      <p className="muted table-count">검색 결과 {searchedRows.length}건 / 전체 {rows.length}건</p>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isPageAllSelected}
                  onChange={(event) => togglePageSelection(event.target.checked)}
                  aria-label="현재 페이지 전체 선택"
                />
              </th>
              <th>캠페인명</th>
              <th>상태</th>
              <th>매체</th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("period")}>
                  집행기간 {renderSortBadge("period")}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("totalCost")}>
                  총 집행금액 {renderSortBadge("totalCost")}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("ctr")}>
                  CTR {renderSortBadge("ctr")}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("cpc")}>
                  CPC {renderSortBadge("cpc")}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("roas")}>
                  ROAS {renderSortBadge("roas")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {pagedRows.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-cell">
                  조건에 맞는 캠페인이 없습니다.
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleRowSelection(row.id)}
                      aria-label={`${row.name} 선택`}
                    />
                  </td>
                  <td>{row.name}</td>
                  <td>{STATUS_LABEL[row.status]}</td>
                  <td>{row.platform}</td>
                  <td>{formatPeriod(row.startDate, row.endDate)}</td>
                  <td>{formatCurrency(row.totalCost)}</td>
                  <td>{row.hasStats ? formatPercent(row.ctr) : "-"}</td>
                  <td>{row.hasStats ? formatCurrency(row.cpc) : "-"}</td>
                  <td>{row.hasStats ? formatPercent(row.roas) : "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CampaignTablePagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((prev) => Math.max(1, prev - 1))}
        onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      />
    </section>
  )
}
