import { Button } from "@/components/ui/button"

type Props = {
  buttonLabel?: string
  onNext?: () => void
}

export function StepSuccess({ buttonLabel = "Go to Dashboard", onNext }: Props) {
  return (
    <div className="space-y-4 text-center">
      <h2 className="text-2xl font-semibold text-green-600">
         Account Created!
      </h2>

      <p className="text-slate-500">
        Your account has been successfully created.
      </p>

      <Button
        className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
        onClick={onNext}
      >
        {buttonLabel}
      </Button>
    </div>
  )
}
