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
        <div className="flex w-full max-w-xl items-center px-6 lg:px-20">
          <div className="w-full rounded-2xl bg-white p-8 shadow-2xl">
            {/* STEPS */}
            <div className="mb-6 flex items-center gap-3">
              {[1, 2, 3, 4].map((step, index) => (
                <div
                  key={step}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold
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
            <h1 className="text-2xl font-bold text-slate-900">
              Create your account in seconds
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join Sweden’s smart service platform. Connect with trusted vendors
              and manage everything in one place.
            </p>

            {/* PHONE */}
            <div className="mt-6 space-y-2">
              <Label>Number</Label>
              <div className="flex items-center gap-2 rounded-md border px-3">
                <span className="text-lg">🇸🇪</span>
                <Input
                  className="border-none focus-visible:ring-0"
                  placeholder="Enter your mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                We'll send a secure one-time password (OTP) to verify your number
              </p>
            </div>

            {/* SOCIAL */}
            <div className="mt-6 text-center">
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
            <div className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
              {/* <Checkbox /> */}
              <p>
                By continuing, you agree to our{" "}
                <span className="underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="underline cursor-pointer">
                  Privacy Policy
                </span>
              </p>
            </div>

            {/* CTA */}
            <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700">
              Send OTP
            </Button>
          </div>
        </div>

      
      </div>
    </div>
  )
}
