import type { ReactNode } from "react"

type WhiteCardProps = {
  children: ReactNode
  className?: string
}

export default function WhiteCard({ children, className }: WhiteCardProps) {
  const classes = ["rounded-3xl", "bg-slate-100", "shadow-sm", className]
    .filter(Boolean)
    .join(" ")

  return <div className={classes}>{children}</div>
}
