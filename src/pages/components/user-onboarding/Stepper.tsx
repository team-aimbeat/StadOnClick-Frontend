import { Separator } from "@/components/ui/separator"

type Props = {
  step: number
  total?: number
  onStepClick?: (step: number) => void
}

export function Stepper({ step, total = 4, onStepClick }: Props) {
  return (
    <div className="relative flex items-center justify-between w-full gap-2">
      <Separator className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-slate-200" />

      {Array.from({ length: total }).map((_, i) => {
        const s = i + 1
        const isActive = step >= s
        return (
          <button
            key={s}
            type="button"
            onClick={onStepClick ? () => onStepClick(s) : undefined}
            className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold sm:h-[26px] sm:w-[26px] sm:text-[11px] ${
              isActive
                ? "bg-[#3B82F6] text-white shadow-[0_2px_6px_rgba(59,130,246,0.35)]"
                : "bg-slate-200 text-slate-600"
            } ${onStepClick ? "cursor-pointer" : "cursor-default"}`}
            aria-current={step === s ? "step" : undefined}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}
