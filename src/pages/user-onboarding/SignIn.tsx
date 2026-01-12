import { useCallback, useEffect, useState } from "react"
import bgImage5 from "@/assets/user-onboarding/user-onboarding-5.png"
import { OnboardingLayout } from "@/components/shared/user-onboarding/OnboardingLayout"
import { OnboardingFormCard } from "@/components/shared/user-onboarding/OnboardingFormCard"
import { StepLogin } from "@/components/shared/user-onboarding/StepLogin"
import { useLoginMutation } from "@/features/auth/api/authApi"
import { useAppDispatch } from "@/app/hooks"
import { setUser } from "@/features/auth/authSlice"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import { toast } from "react-hot-toast"
import { useForm, useFormState } from "react-hook-form"
import { normalizeApiError } from "@/shared/utils/normalizeApiError"
import { Link, useNavigate } from "react-router-dom"

type FormValues = {
  email: string
  password: string
  acceptTerms: boolean
}

export default function SignIn() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [login, { isLoading }] = useLoginMutation()
  const [formError, setFormError] = useState<string | undefined>(undefined)

  const { register, handleSubmit, control, setError, clearErrors, watch, setValue } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { email: "", password: "", acceptTerms: false },
  })
  const { errors, isSubmitting, isValid } = useFormState({ control })
  const values = watch()
  const canSubmit = Boolean(values.email && values.password && values.acceptTerms && isValid)

  useEffect(() => {
    dispatch(setPageTitle("Sign in"))
    register("acceptTerms")
  }, [dispatch, register])

  const onSubmit = useCallback(async (data: FormValues) => {
    setFormError(undefined)
    clearErrors()

    try {
      const response = await login({ email: data.email, password: data.password }).unwrap()
      const user = response?.user ?? response
      dispatch(setUser(user))
      toast.success("Signed in successfully", { id: "login-success" })
      navigate("/marketplace", { replace: true })
    } catch (err) {
      const { fieldErrors, formError: normalizedFormError, toastMessage } = normalizeApiError(
        err,
        "Unable to sign in. Please try again."
      )

      Object.entries(fieldErrors).forEach(([field, message]) => {
        setError(field as keyof FormValues, { type: "server", message })
      })

      setFormError(normalizedFormError)
      toast.error(toastMessage, { id: "login-error" })
      console.error("Login failed", err)
    }
  }, [clearErrors, dispatch, login, navigate, setError])

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
        subtitle="Login to manage services, bookings, and vendors in one place."
        showStepper={false}
      >
        <StepLogin
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={isLoading || isSubmitting}
          errorMessage={formError}
          isValid={canSubmit}
        />
        <div className="space-y-2 rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-sm text-slate-500">Don't have an account yet?</p>
          <p className="text-sm text-[#0b59a2]">
            <a href="/sign-up" className="font-semibold underline transition hover:text-[#094374]">
              Create your StadonClick account
            </a>
          </p>
          <p className="text-xs text-slate-400">
            It&apos;s quick, secure, and lets you manage bookings and vendors in one place.
          </p>
        </div>
      </OnboardingFormCard>
    </OnboardingLayout>
  )
}
