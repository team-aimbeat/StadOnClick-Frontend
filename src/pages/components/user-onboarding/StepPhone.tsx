import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import facebookIcon from "@/assets/icons/facebook.png"
import appleIcon from "@/assets/icons/apple.png"
import googleIcon from "@/assets/icons/google.png"
import swedenFlag from "@/assets/icons/flag-sweden.svg"

type SocialIcon = {
  src: string
  alt: string
  href: string
}

const socialIcons: SocialIcon[] = [
  { src: facebookIcon, alt: "Facebook", href: "https://www.facebook.com" },
  { src: appleIcon, alt: "Apple", href: "https://www.apple.com" },
  { src: googleIcon, alt: "Google", href: "https://www.google.com" },
]

type Props = {
  phone: string
  setPhone: (v: string) => void
  onNext: () => void
}

const countryCode = "+46"
const countryNameByCode: Record<string, string> = {
  "+46": "Sweden",
}
const minDigits = 7
const maxDigits = 15

export function StepPhone({ phone, setPhone, onNext }: Props) {
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const digitsOnly = phone.replace(/\D/g, "")
  const isValidPhone =
    digitsOnly.length >= minDigits && digitsOnly.length <= maxDigits

  const handlePhoneChange = (rawValue: string) => {
    const raw = rawValue
    const sanitized = raw
      .replace(/[^\d+]/g, "")
      .replace(/(?!^)\+/g, "")
    setPhone(sanitized)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">
          Phone number ({countryNameByCode[countryCode] ?? "Country"})
        </Label>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
            <img src={swedenFlag} alt="Sweden flag" className="h-4 w-6 rounded-[2px] object-cover" />
            <span className="text-sm font-semibold text-slate-800">{countryCode}</span>
          </div>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="flex-1 border-none px-0 text-base shadow-none focus-visible:ring-0"
            placeholder="708 123 456"
            value={phone.replace(countryCode, "")}
            onChange={(event) => handlePhoneChange(`${countryCode}${event.target.value}`)}
          />
        </div>

        <p className="text-[13px] text-slate-700">
          We&apos;ll text you a one-time code to verify your number.
        </p>
        {!isValidPhone && phone.length > 0 && (
          <p className="text-[12px] text-red-600">
            Enter a valid phone number ({minDigits}-{maxDigits} digits).
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#454545] justify-center">
        <span className="text-sm text-slate-500">or continue with</span>
      </div>

      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {socialIcons.map((icon) => (
          <a
            key={icon.href}
            href={icon.href}
            target="_blank"
            rel="noreferrer"
            className="flex h-[41.46px] w-[41.46px] items-center justify-center"
            aria-label={`Continue with ${icon.alt}`}
          >
            <img src={icon.src} alt={icon.alt} className="object-contain" />
          </a>
        ))}
      </div>

      <div className="flex items-start gap-3 text-[12px] text-[#242426]">
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
          className="w-[19px] h-[18px] border-[#404040]"
        />
        <label htmlFor="terms" className="cursor-pointer">
          By continuing, you agree to our{" "}
          <span className="font-semibold text-[#3289FF]">Terms of Service</span>{" "}
          &{" "}
          <span className="font-semibold text-[#3289FF]">Privacy Policy</span>
        </label>
      </div>

      <Button
        className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] bg-[#3B82F6] px-6 text-[16px] text-white"
        disabled={!isValidPhone}
        onClick={onNext}
      >
        Send OTP
      </Button>
    </div>
  )
}
