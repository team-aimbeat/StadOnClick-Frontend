import { useEffect, useState } from "react"
import bgImage5 from "@/assets/user-onboarding/user-onboarding-5.png"
import { OnboardingLayout } from "../components/user-onboarding/OnboardingLayout"
import { OnboardingFormCard } from "../components/user-onboarding/OnboardingFormCard"
import { StepLogin } from "../components/user-onboarding/StepLogin"
import { useLoginMutation } from "@/features/auth/api/authApi"
import { useAppDispatch } from "@/app/hooks"
import { setUser } from "@/features/auth/authSlice"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"


export default function SignIn() {
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    dispatch(setPageTitle("Sign in"))
  }, [dispatch])

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
