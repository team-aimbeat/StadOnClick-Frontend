import { useState } from "react"
import bgImage5 from "@/assets/user-onboarding/user-onboarding-5.png"
import { OnboardingLayout } from "../components/user-onboarding/OnboardingLayout"
import { OnboardingFormCard } from "../components/user-onboarding/OnboardingFormCard"
import { StepLogin } from "../components/user-onboarding/StepLogin"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <OnboardingLayout
      image={bgImage5}
      imageTitle={"Your Hub for Swedish Activity\nExperiences"}
      imageSubtitle=""
    >
      <OnboardingFormCard
        step={1}
        total={4}
        title="Welcome to StadonClick"
        subtitle="Create an account to manage services, bookings, and vendors in one place."
        showStepper={false}
      >
        <StepLogin
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onSubmit={() => console.log("Continue")}
        />
      </OnboardingFormCard>
    </OnboardingLayout>
  )
}
