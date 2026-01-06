import { Stepper } from "./Stepper"

type Props = {
  step: number
  title: string
  subtitle: string
  total?: number
  onStepClick?: (step: number) => void
  showStepper?: boolean
  children: React.ReactNode
}

export function OnboardingFormCard({
  step,
  title,
  subtitle,
  total = 4,
  onStepClick,
  showStepper = true,
  children,
}: Props) {
  return (
    <div className="w-full max-w-[560px] md:w-[520px] lg:w-[560px] mx-auto lg:mx-0 lg:ml-[55px] lg:mt-[53px] rounded-xl bg-white p-5 sm:p-6 shadow-2xl space-y-[34px]">
      {showStepper ? (
        <Stepper step={step} total={total} onStepClick={onStepClick} />
      ) : null}

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-[32px] font-semibold text-[#4A4A4A]">
          {title}
        </h1>
        <p className="text-sm sm:text-[14px] text-[#4A4A4A]">{subtitle}</p>
      </div>

      {children}
    </div>
  )
}
