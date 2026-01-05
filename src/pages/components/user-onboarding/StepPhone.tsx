import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import facebookIcon from "@/assets/icons/facebook.png"
import appleIcon from "@/assets/icons/apple.png"
import googleIcon from "@/assets/icons/google.png"

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
const minDigits = 7
const maxDigits = 15

export function StepPhone({ phone, setPhone, onNext }: Props) {
  const digitsOnly = phone.replace(/\D/g, "")
  const isValidPhone =
    digitsOnly.length >= minDigits && digitsOnly.length <= maxDigits

  const handlePhoneChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(event.target.value)
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Number</Label>

        <div className="flex items-center rounded-lg border border-[#4A4A4A] bg-white px-3 py-2 shadow-sm w-full">
          <div className="px-1 text-sm font-semibold text-[#4A4A4A] whitespace-nowrap">
            {countryCode}
          </div>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <Input
            type="tel"
            inputMode="tel"
            className="flex-1 border-none focus-visible:ring-0 px-0 text-base"
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
        <Checkbox className="w-[19px] h-[18px] border-[#404040]" />
        <span>
          By continuing, you agree to our{" "}
          <span className="font-semibold text-[#3289FF]">Terms of Service</span>{" "}
          &{" "}
          <span className="font-semibold text-[#3289FF]">Privacy Policy</span>
        </span>
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
