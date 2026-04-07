import type { CampaignTableRowData, SortDirection, SortKey, SortRule } from "../model/types"

export function formatPeriod(startDate: string, endDate: string | null): string {
  const end = endDate ?? "-"
  return `${startDate} ~ ${end}`
}

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

function compareBySortKey(left: CampaignTableRowData, right: CampaignTableRowData, sortKey: SortKey): number {
  if (sortKey === "period") {
    return compareDateRange(left.startDate, left.endDate, right.startDate, right.endDate)
  }
  if (sortKey === "totalCost") {
    return left.totalCost - right.totalCost
  }
  if (sortKey === "ctr") {
    return left.ctr - right.ctr
  }
  if (sortKey === "cpc") {
    return left.cpc - right.cpc
  }
  return left.roas - right.roas
}

function applyDirection(value: number, direction: SortDirection): number {
  return direction === "asc" ? value : value * -1
}

export function sortCampaignRows(rows: CampaignTableRowData[], sortRules: SortRule[]): CampaignTableRowData[] {
  const copied = [...rows]

  if (sortRules.length === 0) {
    return copied
  }

  copied.sort((left, right) => {
    for (const rule of sortRules) {
      const compared = compareBySortKey(left, right, rule.key)
      if (compared !== 0) {
        return applyDirection(compared, rule.direction)
      }
    }

    const nameCompare = left.name.localeCompare(right.name)
    if (nameCompare !== 0) {
      return nameCompare
    }

    return left.id.localeCompare(right.id)
  })

  return copied
}
