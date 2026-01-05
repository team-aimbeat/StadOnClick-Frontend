import { Button } from "@/components/ui/button"
import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type ReactNode,
} from "react"

type Props = {
  otp: string
  setOtp: (v: string) => void
  onBack: () => void
  onNext: () => void
}

const OTP_LENGTH = 6

export function StepOtp({ otp, setOtp, onBack, onNext }: Props) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  const [localOtp, setLocalOtp] = useState(otp)

  useEffect(() => {
    setLocalOtp(otp)
  }, [otp])

  const otpArray = Array.from({ length: OTP_LENGTH }, (_, idx) => localOtp[idx] ?? "")
  const digitsOnly = localOtp.replace(/\D/g, "")
  const isComplete = digitsOnly.length === OTP_LENGTH

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault()
    if (!isComplete) return
    onNext()
  }

  const applyDigits = (digits: string, index: number) => {
    if (!digits) {
      const updated = [...otpArray]
      updated[index] = ""
      const nextValue = updated.join("").slice(0, OTP_LENGTH)
      setLocalOtp(nextValue)
      setOtp(nextValue)
      return
    }

    const updated = [...otpArray]
    let writeIndex = index

    for (let i = 0; i < digits.length && writeIndex < OTP_LENGTH; i += 1) {
      updated[writeIndex] = digits[i]
      writeIndex += 1
    }

    const nextValue = updated.join("").slice(0, OTP_LENGTH)
    setLocalOtp(nextValue)
    setOtp(nextValue)

    const nextFocusIndex = Math.min(index + digits.length, OTP_LENGTH - 1)
    if (nextFocusIndex < OTP_LENGTH) {
      inputsRef.current[nextFocusIndex]?.focus()
    }
  }

  const handleChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, "")
    applyDigits(digits, index)
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "")
    if (!digits) return
    event.preventDefault()
    applyDigits(digits, index)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace" && !otpArray[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const renderInputs = () => {
    const nodes: ReactNode[] = []

    for (let index = 0; index < OTP_LENGTH; index += 1) {
      nodes.push(
        <input
          key={`otp-${index}`}
          ref={(el) => {
            inputsRef.current[index] = el
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          pattern="[0-9]*"
          autoFocus={index === 0}
          maxLength={1}
          value={otpArray[index]}
          onChange={(e) => handleChange(e.target.value, index)}
          onPaste={(e) => handlePaste(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="h-11 w-11 rounded-lg border border-slate-200 bg-white text-center text-base font-semibold text-[#1F2937] caret-[#1F2937] placeholder-transparent transition focus:border-[#3289FF] focus:outline-none focus:ring-2 focus:ring-[#3289FF]/40 sm:h-12 sm:w-12"
          aria-label={`OTP digit ${index + 1}`}
        />,
      )
    }

    return nodes
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Verify your number</h3>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {renderInputs()}
      </div>
      <p className="text-sm text-gray-500 mt-1 text-center sm:text-left">
        Enter the 6-digit code we sent you.
      </p>

      <p className="text-sm text-gray-600">
        Didn&apos;t receive the code?{" "}
        <button
          type="button"
          className="text-[#3289FF] font-semibold hover:underline focus-visible:outline-none"
        >
          Resend OTP
        </button>
      </p>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="submit"
          className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
          disabled={!isComplete}
        >
          Verify &amp; Continue
        </Button>
      </div>
    </form>
  )
}
