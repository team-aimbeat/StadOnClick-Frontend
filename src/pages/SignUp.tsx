import { useState } from "react"
import bgImage from "../assets/user-onboarding/user-onboarding-1.png"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
// import { Checkbox } from "@/components/ui/checkbox"

export default function Signup() {
  const [phone, setPhone] = useState("")

  return (
    <div className="min-h-screen relative">
      {/* BACKGROUND IMAGE */}
      <img
        src={bgImage}
        alt="Onboarding"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/30" />

      {/* CONTENT WRAPPER */}
      <div className="relative z-10 flex min-h-screen">
        {/* LEFT CARD */}
<div className="flex items-center px-6 lg:px-20">
  <div
    className="
      w-[552px]
      h-[658.67px]
      flex flex-col
      space-y-[24px]
      rounded-[12px]
      border border-slate-200
      bg-white
      pt-[35px]
      pb-[35px]
      pl-[20px]
      pr-[20px]
      shadow-2xl
    "
  >
    {/* STEPPER */}
    <div className="relative flex items-center justify-between">
      <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 bg-slate-200" />
      {[1, 2, 3, 4].map((step, index) => (
        <div
          key={step}
          className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold
            ${
              index === 0
                ? "bg-blue-600 text-white"
                : "bg-slate-200 text-slate-600"
            }`}
        >
          {step}
        </div>
      ))}
    </div>

    {/* TITLE */}
    <div>
      <h1 className="text-[32px] font-semibold ">
        Create your account in seconds
      </h1>
      <p className="mt-2 text-[14px] text-muted-foreground">
        Join Sweden’s smart service platform. Connect with trusted vendors and
        manage everything in one place.
      </p>
    </div>

    {/* PHONE */}
   <div className="flex w-full max-w-[488px] flex-col gap-[16px]">
  {/* Label */}
  <Label className="text-sm font-medium text-slate-900">
    Number
  </Label>

  {/* Input */}
  <div className="flex h-[48px] items-center gap-[8px] rounded-[8px] border border-slate-300 px-[12px]">
    <span className="text-lg leading-none">🇸🇪</span>

    <Input
      className="h-full border-none px-0 text-sm focus-visible:ring-0"
      placeholder="Enter your mobile number"
      value={phone}
      onChange={(e) => setPhone(e.target.value)}
    />
  </div>

  {/* Helper text */}
  <p className="text-xs text-muted-foreground">
    We'll send a secure one-time password (OTP) to verify your number
  </p>
</div>


    {/* SOCIAL */}
    <div className="text-center">
      <p className="mb-3 text-sm text-muted-foreground">
        or continue with
      </p>
      <div className="flex justify-center gap-4">
        {["f", "", "G"].map((icon, i) => (
          <button
            key={i}
            className="flex h-10 w-10 items-center justify-center rounded-full border hover:bg-slate-100"
          >
            {icon}
          </button>
        ))}
      </div>
    </div>

    {/* TERMS */}
    <p className="text-sm text-muted-foreground">
      By continuing, you agree to our{" "}
      <span className="underline cursor-pointer">Terms of Service</span> and{" "}
      <span className="underline cursor-pointer">Privacy Policy</span>
    </p>

    {/* CTA */}
    <Button className="w-full bg-blue-600 hover:bg-blue-700">
      Send OTP
    </Button>
  </div>
</div>


      
      </div>
    </div>
  )
}
