import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  email: string
  password: string
  setEmail: (v: string) => void
  setPassword: (v: string) => void
  onSubmit?: () => void
}

export function StepLogin({
  email,
  password,
  setEmail,
  setPassword,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm text-[#2E2E2E]">Email</Label>
        <Input
          type="email"
          className="h-11 rounded-[8px] border border-[#ADADAD] text-sm"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-[#2E2E2E]">Password</Label>
        <div className="relative">
          <Input
            type="password"
            className="h-11 rounded-[8px] border border-[#ADADAD] pr-10 text-sm"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
            aria-label="Toggle password visibility"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              <path d="M3 3l18 18" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="text-[12px] text-[#E63946] hover:underline"
        >
          Forgot Password ?
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[14px] text-[#454545] justify-center">
        <span className="text-sm text-slate-500">or continue with</span>
      </div>

      <div className="flex items-center justify-center gap-4 sm:gap-6">
        {socialIcons.map((icon, index) => (
          <a
            key={index}
            href={icon.href}
            target="_blank"
            rel="noreferrer"
            className="flex h-[41.46px] w-[41.46px] items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm"
          >
            <img
              src={icon.src}
              alt={icon.alt}
              className="h-[22px] w-[22px] object-contain"
            />
          </a>
        ))}
        <span className="hidden sm:block h-px w-24 border-t border-dashed border-slate-300" />
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
        disabled={!email || !password}
        onClick={onSubmit}
      >
        Continue
      </Button>
    </div>
  )
}
