import { useEffect, useMemo, useState } from "react"
import type { CampaignTableRowData, SortDirection, SortKey, SortRule } from "./types"
import { sortCampaignRows } from "../lib/tableUtils"

const PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

const DEFAULT_SORT_RULES: SortRule[] = [{ key: "period", direction: "asc" }]

export function useCampaignTableState(rows: CampaignTableRowData[]) {
  const [searchInput, setSearchInput] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortRules, setSortRules] = useState<SortRule[]>(DEFAULT_SORT_RULES)
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

  const sortedRows = useMemo(() => sortCampaignRows(searchedRows, sortRules), [searchedRows, sortRules])

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [searchTerm, sortRules])

  const pagedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sortedRows.slice(start, start + PAGE_SIZE)
  }, [page, sortedRows])

  function toggleSort(nextKey: SortKey) {
    setSortRules((prev) => {
      const index = prev.findIndex((rule) => rule.key === nextKey)

      if (index === -1) {
        return [...prev, { key: nextKey, direction: "asc" }]
      }

      const current = prev[index]
      if (!current) {
        return prev
      }

      if (current.direction === "asc") {
        const next = [...prev]
        next[index] = { key: nextKey, direction: "desc" }
        return next
      }

      return prev.filter((rule) => rule.key !== nextKey)
    })
  }

  function getSortDirection(key: SortKey): SortDirection | null {
    const rule = sortRules.find((item) => item.key === key)
    return rule?.direction ?? null
  }

  function getSortPriority(key: SortKey): number | null {
    const index = sortRules.findIndex((item) => item.key === key)
    return index === -1 ? null : index + 1
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
    sortRules,
    toggleSort,
    getSortDirection,
    getSortPriority,
  }
}
