import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import facebookIcon from "@/assets/icons/facebook.png"
import appleIcon from "@/assets/icons/apple.png"
import googleIcon from "@/assets/icons/google.png"
import type { FieldErrors } from "react-hook-form"
import type { UseFormRegister } from "react-hook-form"

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
  register: UseFormRegister<any>
  errors: FieldErrors
  onSubmit?: () => void
  loading?: boolean
  errorMessage?: string
  isValid?: boolean
  acceptTermsChecked?: boolean
  setAcceptTerms?: (v: boolean) => void
}

export function StepLogin({
  register,
  errors,
  onSubmit,
  loading = false,
  errorMessage,
  isValid = false,
  acceptTermsChecked = false,
  setAcceptTerms,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-800">Email</Label>
        <Input
          type="email"
          className="h-12 rounded-lg border border-slate-200 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#0b59a2]/30 focus-visible:border-[#0b59a2]"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email?.message ? (
          <p className="text-sm text-red-600">{String(errors.email.message)}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-800">Password</Label>
          <button
            type="button"
            className="text-xs font-semibold text-[#0b59a2] hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <Input
          type="password"
          className="h-12 rounded-lg border border-slate-200 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#0b59a2]/30 focus-visible:border-[#0b59a2]"
          placeholder="********"
          {...register("password")}
        />
        {errors.password?.message ? (
          <p className="text-sm text-red-600">{String(errors.password.message)}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or continue with</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {socialIcons.map((icon) => (
            <a
              key={icon.href}
              href={icon.href}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:border-[#0b59a2]/50 hover:shadow"
            >
              <img
                src={icon.src}
                alt={icon.alt}
                className="h-[22px] w-[22px] object-contain"
              />
            </a>
          ))}
        </div>
      </div>

    

      <div className="min-h-[20px]">
        {errorMessage ? (
          <p className="text-sm text-red-600">{errorMessage}</p>
        ) : null}
      </div>

      <Button
        className="h-[52px] w-full max-w-[480px] mx-auto text-[16px]"
        disabled={!isValid || loading}
        onClick={onSubmit}
      >
        {loading ? "Signing in..." : "Continue"}
      </Button>
    </div>
  )
}
