import type { ButtonHTMLAttributes } from "react"

type ButtonVariant = "primary" | "secondary" | "ghost" | "table-sort"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

export function Button({ variant, className, children, ...props }: ButtonProps) {
  const classes = [variant, className].filter(Boolean).join(" ")
  return (
    <button className={classes || undefined} {...props}>
      {children}
    </button>
  )
}
