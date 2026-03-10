import * as React from "react"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef<
  React.ElementRef<"nav">,
  React.ComponentPropsWithoutRef<"nav">
>(({ className, ...props }, ref) => (
  <nav
    ref={ref}
    aria-label="Breadcrumb"
    className={cn("flex items-center gap-1 text-sm text-slate-500", className)}
    {...props}
  />
))
Breadcrumb.displayName = "Breadcrumb"

function BreadcrumbItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("flex items-center gap-1 text-slate-500", className)} {...props}>
      {children}
    </span>
  )
}

const BreadcrumbLink = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, ...props }, ref) => (
  <a
    ref={ref}
    className={cn("text-slate-500 transition-colors hover:text-slate-900", className)}
    {...props}
  />
))
BreadcrumbLink.displayName = "BreadcrumbLink"

function BreadcrumbSeparator({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("text-slate-300", className)} aria-hidden="true" {...props}>
      {'>'}
    </span>
  )
}

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator }
