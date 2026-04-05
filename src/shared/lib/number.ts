const DIGIT_PATTERN = /[^0-9.-]/g

export function toNonNegativeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      return fallback
    }
    return value
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(DIGIT_PATTERN, '').trim()
    if (cleaned.length === 0) {
      return fallback
    }

    const parsed = Number(cleaned)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return fallback
    }

    return parsed
  }

  return fallback
}

export function toNonNegativeInteger(value: unknown, fallback = 0): number {
  return Math.round(toNonNegativeNumber(value, fallback))
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value)
}

export function formatCurrency(value: number): string {
  return `${formatNumber(value)}원`
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`
}
