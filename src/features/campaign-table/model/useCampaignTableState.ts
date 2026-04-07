import { useEffect, useMemo, useState } from "react"
import type { CampaignTableRowData, SortDirection, SortKey } from "./types"
import { sortCampaignRows } from "../lib/tableUtils"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

export function useCampaignTableState(rows: CampaignTableRowData[]) {
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("period")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput)
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [searchInput])

  const searchedRows = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (keyword.length === 0) {
      return rows
    }
    return rows.filter((row) => row.name.toLowerCase().includes(keyword))
  }, [rows, searchTerm])

  const sortedRows = useMemo(
    () => sortCampaignRows(searchedRows, sortKey, sortDirection),
    [searchedRows, sortKey, sortDirection],
  )

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sortDirection, sortKey])

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [page, sortedRows])

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
      return
    }

    setSortKey(nextKey)
    setSortDirection("asc")
  }

  return {
    searchInput,
    setSearchInput,
    searchedRows,
    sortedRows,
    pagedRows,
    totalPages,
    page,
    setPage,
    sortKey,
    sortDirection,
    toggleSort,
  }
}
