import * as React from "react"

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full overflow-auto">{children}</ScrollAreaPrimitive.Viewport>
  </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = "ScrollArea"

const ScrollAreaScrollbar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Scrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Scrollbar>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    className={cn(
      "flex touch-none select-none overflow-hidden rounded-full bg-slate-200 transition-colors",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb className="flex-1 rounded-full bg-slate-900/60" />
  </ScrollAreaPrimitive.Scrollbar>
))
ScrollAreaScrollbar.displayName = "ScrollAreaScrollbar"

const ScrollAreaCorner = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Corner>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Corner>
>(({ className, ...props }, ref) => (
  <ScrollAreaPrimitive.Corner ref={ref} className={cn("bg-slate-200", className)} {...props} />
))
ScrollAreaCorner.displayName = "ScrollAreaCorner"

export { ScrollArea, ScrollAreaScrollbar, ScrollAreaCorner }
