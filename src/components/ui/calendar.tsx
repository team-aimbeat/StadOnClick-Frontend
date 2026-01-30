import * as React from "react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"

import "react-day-picker/dist/style.css"

const Calendar = React.forwardRef<HTMLDivElement, DayPickerProps>((props, ref) => {
  const { className, classNames, ...rest } = props

  return (
    <div ref={ref} className={cn("rounded-lg bg-white", className)}>
      <DayPicker
        {...rest}
        className="p-3 [&_.rdp-caption]:text-base [&_.rdp-nav_button]:h-8 [&_.rdp-nav_button]:w-8"
        classNames={{
          button: "h-8 w-8 rounded-md bg-transparent text-sm font-medium text-slate-700 hover:bg-slate-100",
          caption: "flex items-center justify-between text-base font-semibold text-slate-900",
          months: "flex flex-col gap-4",
          nav_button:
            "h-8 w-8 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100",
          table: "w-full border-collapse text-sm",
          ...classNames,
        }}
        styles={{
          caption: { marginBottom: 0 },
          ...rest.styles,
        }}
      />
    </div>
  )
})
Calendar.displayName = "Calendar"

export { Calendar }
