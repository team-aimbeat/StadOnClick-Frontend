import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Props = {
  firstName: string
  lastName: string
  userName: string
  gender: string
  language: string
  email: string
  location: string
  age: string
  setFirstName: (v: string) => void
  setLastName: (v: string) => void
  setUserName: (v: string) => void
  setGender: (v: string) => void
  setLanguage: (v: string) => void
  setEmail: (v: string) => void
  setLocation: (v: string) => void
  setAge: (v: string) => void
  onNext: () => void
}

export function StepProfile({
  firstName,
  lastName,
  userName,
  gender,
  language,
  email,
  location,
  age,
  setFirstName,
  setLastName,
  setUserName,
  setGender,
  setLanguage,
  setEmail,
  setLocation,
  setAge,
  onNext,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const handleUploadClick = () => fileInputRef.current?.click()

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
            setLocation(line || fallback || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
          } else {
            setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
          }
        } catch (err) {
          setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`)
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
    <div className="space-y-4">
      <button
        type="button"
        onClick={handleUploadClick}
        className="w-full rounded-lg border border-dashed border-[#7AA7FF] bg-[#F2F2F2] px-4 py-3 text-left"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-slate-300">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-lg">+</span>
            )}
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-white bg-[#3289FF] text-[12px] text-white">
              +
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#2E2E2E]">Upload your photo</p>
            <p className="text-[11px] text-slate-500">JPG, PNG, GIF up to 2 MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </button>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 inline-block">First name</Label>
          <Input
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 inline-block">Last name</Label>
          <Input
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 inline-block">What should we call you?</Label>
          <Input
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="User name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div>
          <Label className="mb-1 inline-block">Gender</Label>
          <Input
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="Your gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 inline-block">Language</Label>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-[#4A4A4A] shadow-none focus:border-[#3289FF] focus:outline-none focus:ring-2 focus:ring-[#3289FF]/40 focus:shadow-none focus-visible:shadow-none"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">Language</option>
            <option value="English">English</option>
            <option value="Swedish">Swedish</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <Label className="mb-1 inline-block">Email</Label>
          <Input
            type="email"
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="mb-1 inline-block">Location</Label>
          <Input
            className="h-9 text-sm shadow-none focus:shadow-none focus-visible:shadow-none"
            placeholder="Street, city"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#CFE0FF] bg-white px-2.5 py-1 text-[11px] text-[#3289FF]"
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
        </div>
        <div>
          <Label className="mb-1 inline-block">Age</Label>
          <select
            className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-[#4A4A4A] shadow-none focus:border-[#3289FF] focus:outline-none focus:ring-2 focus:ring-[#3289FF]/40 focus:shadow-none focus-visible:shadow-none"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          >
            <option value="">Age</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45+">45+</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-2 text-[13px] text-[#6B7280]">
        <Checkbox id="terms-profile" className="w-[19px] h-[18px] border-[#404040]" />
        <label htmlFor="terms-profile" className="cursor-pointer">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </label>
      </div>

      <Button
          className="h-[56px] w-full max-w-[487.82px] mx-auto rounded-[10px] bg-[#3B82F6] px-6 text-white"
        disabled={!firstName || !lastName || !email}
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  )
}
