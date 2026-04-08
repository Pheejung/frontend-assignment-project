import type { ReactNode } from "react"

type ChipVariant = "chip" | "segment"

interface ChipProps {
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  children: ReactNode
  variant?: ChipVariant
  "aria-pressed"?: boolean
  "aria-label"?: string
}

const BASE_CLASS: Record<ChipVariant, string> = {
  chip: "chip",
  segment: "top3-segment",
}

export function Chip({
  active = false,
  disabled,
  onClick,
  children,
  variant = "chip",
  "aria-pressed": ariapressed,
  "aria-label": ariaLabel,
}: ChipProps) {
  const base = BASE_CLASS[variant]
  const className = active ? `${base} active` : base

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={ariapressed}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}
