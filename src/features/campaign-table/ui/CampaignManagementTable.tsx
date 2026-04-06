import { useEffect, useMemo, useState } from "react"
import type { CampaignPlatform, CampaignStatus } from "../../../entities/campaign/model/types"
import { formatCurrency, formatPercent } from "../../../shared/lib/number"

export interface CampaignTableRowData {
  id: string
  name: string
  status: CampaignStatus
  platform: CampaignPlatform
  startDate: string
  endDate: string | null
  totalCost: number
  ctr: number
  cpc: number
  roas: number
  hasStats: boolean
}

interface CampaignManagementTableProps {
  rows: CampaignTableRowData[]
  onBulkStatusChange: (campaignIds: string[], status: CampaignStatus) => void
}

type SortKey = "period" | "totalCost" | "ctr" | "cpc" | "roas"
type SortDirection = "asc" | "desc"

const PAGE_SIZE = 10

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active: "진행중",
  paused: "일시중지",
  ended: "종료",
}

const STATUS_OPTIONS: CampaignStatus[] = ["active", "paused", "ended"]

function compareDateRange(
  leftStart: string,
  leftEnd: string | null,
  rightStart: string,
  rightEnd: string | null,
): number {
  const startCompare = leftStart.localeCompare(rightStart)
  if (startCompare !== 0) {
    return startCompare
  }

  const left = leftEnd ?? "9999-12-31"
  const right = rightEnd ?? "9999-12-31"
  return left.localeCompare(right)
}

function formatPeriod(startDate: string, endDate: string | null): string {
  const end = endDate ?? "-"
  return `${startDate} ~ ${end}`
}

export function CampaignManagementTable({
  rows,
  onBulkStatusChange,
}: CampaignManagementTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("period")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [page, setPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkStatus, setBulkStatus] = useState<CampaignStatus>("active")

  const searchedRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (keyword.length === 0) {
      return rows
    }

    return rows.filter((row) => row.name.toLowerCase().includes(keyword))
  }, [rows, searchTerm])

  const sortedRows = useMemo(() => {
    const copied = [...searchedRows]

    copied.sort((left, right) => {
      let compareValue = 0

      if (sortKey === "period") {
        compareValue = compareDateRange(left.startDate, left.endDate, right.startDate, right.endDate)
      }
      if (sortKey === "totalCost") {
        compareValue = left.totalCost - right.totalCost
      }
      if (sortKey === "ctr") {
        compareValue = left.ctr - right.ctr
      }
      if (sortKey === "cpc") {
        compareValue = left.cpc - right.cpc
      }
      if (sortKey === "roas") {
        compareValue = left.roas - right.roas
      }

      if (compareValue === 0) {
        return left.name.localeCompare(right.name)
      }

      return sortDirection === "asc" ? compareValue : compareValue * -1
    })

    return copied
  }, [searchedRows, sortDirection, sortKey])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sortDirection, sortKey])

  useEffect(() => {
    const validIds = new Set(rows.map((row) => row.id))
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)))
  }, [rows])

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [page, sortedRows])

  const pageIds = pagedRows.map((row) => row.id)
  const isPageAllSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id))

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }

    setSortKey(nextKey)
    setSortDirection("asc")
  }

  function toggleRowSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    )
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

  return (
    <section className="card">
      <div className="table-header">
        <h2>캠페인 관리 테이블</h2>
        <div className="table-toolbar">
          <label className="field-inline">
            <span>검색</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="캠페인명 검색"
              aria-label="캠페인명 검색"
            />
          </label>

          <label className="field-inline">
            <span>일괄 상태 변경</span>
            <select
              value={bulkStatus}
              onChange={(event) => setBulkStatus(event.target.value as CampaignStatus)}
              aria-label="일괄 상태"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>

          <button type="button" className="primary" onClick={applyBulkStatusChange}>
            적용 ({selectedIds.length})
          </button>
        </div>
      </div>

      <p className="muted table-count">
        검색 결과 {searchedRows.length}건 / 전체 {rows.length}건
      </p>

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
                  집행기간 {sortKey === "period" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("totalCost")}>
                  총 집행금액 {sortKey === "totalCost" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("ctr")}>
                  CTR {sortKey === "ctr" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("cpc")}>
                  CPC {sortKey === "cpc" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th>
                <button type="button" className="table-sort" onClick={() => toggleSort("roas")}>
                  ROAS {sortKey === "roas" ? (sortDirection === "asc" ? "▲" : "▼") : ""}
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

      <div className="pagination">
        <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page === 1}>
          이전
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={page === totalPages}
        >
          다음
        </button>
      </div>
    </section>
  )
}
