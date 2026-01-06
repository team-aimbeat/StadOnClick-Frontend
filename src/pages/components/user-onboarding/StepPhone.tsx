import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import facebookIcon from "@/assets/icons/facebook.png"
import appleIcon from "@/assets/icons/apple.png"
import googleIcon from "@/assets/icons/google.png"
import { useState } from "react"

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

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>{countryNameByCode[countryCode] ?? "Country"}</Label>

        <div className="flex items-center rounded-lg border border-[#bdbdbd] bg-white px-3 py-2 shadow-sm w-full">
          <div className="flex h-[18px] w-[26px] items-center justify-center rounded-sm border border-[#c9c9c9] bg-[#1e5aa6]">
            <div className="h-[14px] w-[3px] bg-[#f8d23c]" />
            <div className="ml-[2px] h-[3px] w-[14px] bg-[#f8d23c]" />
          </div>
          <div className="mx-3 h-5 w-px bg-[#c9c9c9]" />
          <Input
            type="tel"
            inputMode="tel"
            className="flex-1 border-none focus-visible:ring-0 !p-0 text-base"
            placeholder="Enter your mobile number"
            value={phone}
            onChange={handlePhoneChange}
          />
        </div>


        <p className="text-[13px] text-[#282828]">
          We&apos;ll send you a secure one-time password (OTP) to verify your number.
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
