import type { ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  className?: string
}

export function Badge({ children, className }: BadgeProps) {
  const classes = ["selected-count", className].filter(Boolean).join(" ")
  return <span className={classes}>{children}</span>
}
