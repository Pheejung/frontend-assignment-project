import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export interface DateRange {
  from: string
  to: string
}

export function normalizeDateInput(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }

  const formats = ['YYYY-MM-DD', 'YYYY/MM/DD']
  for (const format of formats) {
    const parsed = dayjs(value, format, true)
    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD')
    }
  }

  return null
}

export function isDateWithinRange(date: string, range: DateRange): boolean {
  return date >= range.from && date <= range.to
}

export function doesDateRangeOverlap(
  left: DateRange,
  right: DateRange,
): boolean {
  return left.from <= right.to && right.from <= left.to
}

export function getCurrentMonthRange(baseDate = dayjs()): DateRange {
  return {
    from: baseDate.startOf('month').format('YYYY-MM-DD'),
    to: baseDate.endOf('month').format('YYYY-MM-DD'),
  }
}
