import { memo, useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TbX, TbEye, TbEyeOff } from "react-icons/tb"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FieldErrors } from "react-hook-form"
import { AgeGroupEnum, GenderEnum } from "@/features/auth/types/basicProfile.types"

const ageGroupOptions = [
  { value: AgeGroupEnum.AGE_16_19, label: "16-19" },
  { value: AgeGroupEnum.AGE_20_24, label: "20-24" },
  { value: AgeGroupEnum.AGE_25_34, label: "25-34" },
  { value: AgeGroupEnum.AGE_35_44, label: "35-44" },
  { value: AgeGroupEnum.AGE_45_54, label: "45-54" },
  { value: AgeGroupEnum.AGE_55_64, label: "55-64" },
  { value: AgeGroupEnum.AGE_65_PLUS, label: "65+" },
]

const genderOptions = [
  { value: GenderEnum.MALE, label: "Male" },
  { value: GenderEnum.FEMALE, label: "Female" },
  { value: GenderEnum.NON_BINARY, label: "Non-binary" },
  { value: GenderEnum.PREFER_NOT_TO_SAY, label: "Prefer not to say" },
]

type Props = {
  firstName: string
  lastName: string
  nickName: string
  gender: string
  locale: string
  email: string
  streetAddress: string
  ageGroup: string
  password: string
  confirmPassword: string
  cityId: string
  cityOptions: { id: string; name: string; municipality: string; county: string }[]
  onCitySelect: (v: string) => void
  citiesLoading?: boolean
  marketingConsent: boolean
  termsAccepted: boolean
  role?: string
  setValue: <T extends string | boolean>(field: string, value: T, opts?: { shouldValidate?: boolean }) => void
  errors: FieldErrors
  onBack?: () => void
  onNext: () => void
  loading?: boolean
}

function StepProfileComponent({
  firstName,
  lastName,
  nickName,
  gender,
  locale,
  email,
  streetAddress,
  ageGroup,
  password,
  confirmPassword,
  cityId,
  cityOptions,
  onCitySelect,
  citiesLoading = false,
  marketingConsent,
  termsAccepted,
  role,
  setValue,
  errors,
  onBack,
  onNext,
  loading = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const handleUploadClick = () => fileInputRef.current?.click()
  const handleRemovePhoto = () => {
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setValue("profileImageUrl", "" as any, { shouldValidate: true })
  }
  const formatLocale = (value: string) => {
    const trimmed = value.trim()
    if (!trimmed.includes("-")) return trimmed
    const [lang, region] = trimmed.split("-")
    return `${(lang || "").toLowerCase()}-${(region || "").toUpperCase()}`
  }

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl)
      }
    }
  }, [photoUrl])

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const nextUrl = URL.createObjectURL(file)
    setPhotoUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev)
      }
      return nextUrl
    })
    // Placeholder: in a real flow, we'd upload and set profileImageUrl; keep preview only for now.
  }

  const handleUseLocation = () => {
    setLocationError(null)
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          )
          if (response.ok) {
            const data = await response.json()
            const address = data.address || {}
            const city =
              address.city || address.town || address.village || address.county
            const line = [address.road, city].filter(Boolean).join(", ")
            const fallback = [city, address.country].filter(Boolean).join(", ")
            setValue("streetAddress", (line || fallback || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`) as any, {
              shouldValidate: true,
            })
          } else {
            setValue("streetAddress", `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` as any, { shouldValidate: true })
          }
        } catch (err) {
          setValue("streetAddress", `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` as any, { shouldValidate: true })
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setLocationError("Unable to fetch your location.")
        setIsLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-[#3289FF] hover:underline"
          >
            Back
          </button>
        ) : (
          <span />
        )}
      </div>

      <div className="w-full rounded-lg border border-dashed border-[#7AA7FF] bg-[#F2F2F2] px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-300"
            >
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg">+</span>
              )}
            </button>
            {photoUrl ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemovePhoto()
                }}
                className="absolute right-0 bottom-0  flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-red-600 text-base shadow hover:bg-red-50"
                aria-label="Remove photo"
              >
                <TbX className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold text-[#2E2E2E]">Upload your photo</p>
            <p className="text-[11px] text-slate-500">JPG, PNG, GIF up to 2 MB</p>
            <button
              type="button"
              onClick={handleUploadClick}
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#3289FF] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-[#2a72d1]"
            >
              Choose file
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="mb-1 inline-block">First name</Label>
          <Input
            className="h-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#3289FF]/40"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setValue("firstName", e.target.value, { shouldValidate: true })}
          />
          {errors.firstName?.message ? (
            <p className="text-xs text-red-600">{String(errors.firstName.message)}</p>
          ) : null}
        </div>
        <div>
          <Label className="mb-1 inline-block">Last name</Label>
          <Input
            className="h-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#3289FF]/40"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setValue("lastName", e.target.value, { shouldValidate: true })}
          />
          {errors.lastName?.message ? (
            <p className="text-xs text-red-600">{String(errors.lastName.message)}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <Label className="mb-1 inline-block">Role</Label>
          <Input
            className="h-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#3289FF]/40"
            value={role === "VENDOR" ? "Vendor" : role === "USER" ? "User" : ""}
            placeholder="Select role in previous step"
            disabled
          />
        </div>
        <div>
          <Label className="mb-1 inline-block">What should we call you?</Label>
          <Input
            className="h-10 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-[#3289FF]/40"
            placeholder="Nickname"
            value={nickName}
            onChange={(e) => setValue("nickName", e.target.value, { shouldValidate: true })}
          />
          {errors.nickName?.message ? (
            <p className="text-xs text-red-600">{String(errors.nickName.message)}</p>
          ) : null}
        </div>
        <div>
          <Label className="mb-1 inline-block">Gender</Label>
          <Select
            value={gender}
            onValueChange={(val) => setValue("gender", val as any, { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Select gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.gender?.message ? (
            <p className="text-xs text-red-600">{String(errors.gender.message)}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 inline-block">Locale</Label>
          <Select
            value={locale}
            onValueChange={(val) => setValue("locale", formatLocale(val), { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Select locale">
              <SelectValue placeholder="Select locale" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-SE">English (Sweden)</SelectItem>
              <SelectItem value="sv-SE">Swedish (Sweden)</SelectItem>
              <SelectItem value="en-GB">English (UK)</SelectItem>
              <SelectItem value="en-US">English (US)</SelectItem>
            </SelectContent>
          </Select>
          {errors.locale?.message ? (
            <p className="text-xs text-red-600">{String(errors.locale.message)}</p>
          ) : null}
          <p className="text-xs text-slate-500">Language–region format (e.g. en-SE).</p>
        </div>
        <div>
          <Label className="mb-1 inline-block">Email</Label>
          <Input
            type="email"
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setValue("email", e.target.value, { shouldValidate: true })}
          />
          {errors.email?.message ? (
            <p className="text-xs text-red-600">{String(errors.email.message)}</p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="mb-1 inline-block">Street address</Label>
          <Input
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="Street, city"
            value={streetAddress}
            onChange={(e) => setValue("streetAddress", e.target.value, { shouldValidate: true })}
          />
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white px-2.5 py-1 text-[11px] text-[#3289FF]"
            onClick={handleUseLocation}
            disabled={isLocating}
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#3289FF]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3289FF]" />
            </span>
            {isLocating ? "Locating..." : "Current location"}
          </button>
          {locationError ? (
            <p className="mt-1 text-[11px] text-[#E63946]">{locationError}</p>
          ) : null}
          {errors.streetAddress?.message ? (
            <p className="text-xs text-red-600">{String(errors.streetAddress.message)}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label className="mb-1 inline-block">City</Label>
          <Select
            value={cityId}
            onValueChange={(val) => onCitySelect(val)}
          >
            <SelectTrigger aria-label="Select city">
              <SelectValue placeholder={cityOptions.length ? "Select city" : "No cities found"} />
            </SelectTrigger>
            <SelectContent className="max-h-48 overflow-y-auto">
              {citiesLoading ? (
                <SelectItem disabled value="__loading__">Loading...</SelectItem>
              ) : cityOptions.length === 0 ? (
                <SelectItem disabled value="__empty__">No results</SelectItem>
              ) : (
                cityOptions.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-medium text-[#1F2937]">{city.name}</span>
                      <span className="text-xs text-slate-500">
                        {[city.municipality, city.county].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.cityId?.message ? (
            <p className="text-xs text-red-600">{String(errors.cityId.message)}</p>
          ) : null}
          <p className="text-xs text-slate-500">Select your city from the list.</p>
        </div>
        <div>
          <Label className="mb-1 inline-block">Age group</Label>
          <Select
            value={ageGroup}
            onValueChange={(val) => setValue("ageGroup", val as any, { shouldValidate: true })}
          >
            <SelectTrigger aria-label="Select age group">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              {ageGroupOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.ageGroup?.message ? (
            <p className="text-xs text-red-600">{String(errors.ageGroup.message)}</p>
          ) : null}
          <p className="text-xs text-slate-500">We use this to tailor recommendations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label className="mb-1 inline-block">Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              className="h-10 text-sm shadow-sm pr-10 focus-visible:ring-2 focus-visible:ring-[#3289FF]/40"
              placeholder="********"
              value={password}
              onChange={(e) => setValue("password", e.target.value, { shouldValidate: true })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <TbEyeOff className="h-5 w-5" /> : <TbEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password?.message ? (
            <p className="text-xs text-red-600">{String(errors.password.message)}</p>
          ) : password && password.length < 8 ? (
            <p className="text-xs text-red-600">Password must be at least 8 characters.</p>
          ) : null}
        </div>
        <div>
          <Label className="mb-1 inline-block">Confirm password</Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              className="h-10 text-sm shadow-sm pr-10 focus-visible:ring-2 focus-visible:ring-[#3289FF]/40"
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setValue("confirmPassword", e.target.value, { shouldValidate: true })}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-2 flex items-center text-slate-500 hover:text-slate-700"
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
            >
              {showConfirmPassword ? <TbEyeOff className="h-5 w-5" /> : <TbEye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword?.message ? (
            <p className="text-xs text-red-600">{String(errors.confirmPassword.message)}</p>
          ) : null}
        </div>
    
      </div>

      <div className="flex items-start gap-2 text-[13px] text-[#6B7280]">
        <Checkbox
          id="terms-profile"
          className="w-[19px] h-[18px] border-[#404040]"
          checked={termsAccepted}
          onCheckedChange={(checked) => setValue("termsAccepted", checked === true, { shouldValidate: true })}
        />
        <label htmlFor="terms-profile" className="cursor-pointer">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </label>
      </div>
      {errors.termsAccepted?.message ? (
        <p className="text-xs text-red-600">{String(errors.termsAccepted.message)}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <Button variant="outline" onClick={onBack} className="px-4">
            Back
          </Button>
        ) : (
          <span />
        )}
        <Button
          className="h-[52px] w-full sm:w-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
          disabled={
            !role ||
            !firstName ||
            !email ||
            !cityId ||
            !password ||
            password.length < 8 ||
            password !== confirmPassword ||
            !termsAccepted ||
            loading
          }
          onClick={onNext}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  )
}

export const StepProfile = memo(StepProfileComponent)
