import type { CampaignTableRowData, SortDirection, SortKey } from "../model/types"

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

export function sortCampaignRows(
  rows: CampaignTableRowData[],
  sortKey: SortKey,
  sortDirection: SortDirection,
): CampaignTableRowData[] {
  const copied = [...rows]

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
}
