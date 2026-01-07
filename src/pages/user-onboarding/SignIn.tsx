import { useCallback, useEffect, useState } from "react"
import bgImage5 from "@/assets/user-onboarding/user-onboarding-5.png"
import { OnboardingLayout } from "../components/user-onboarding/OnboardingLayout"
import { OnboardingFormCard } from "../components/user-onboarding/OnboardingFormCard"
import { StepLogin } from "../components/user-onboarding/StepLogin"
import { useLoginMutation } from "@/features/auth/api/authApi"
import { useAppDispatch } from "@/app/hooks"
import { setUser } from "@/features/auth/authSlice"
import { setPageTitle } from "@/features/Layout/themeConfigSlice"
import { toast } from "react-hot-toast"
import { useForm, useFormState } from "react-hook-form"
import { normalizeApiError } from "@/shared/utils/normalizeApiError"

type FormValues = {
  email: string
  password: string
  acceptTerms: boolean
}

export default function SignIn() {
  const dispatch = useAppDispatch()
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
      if (response?.user) {
        dispatch(setUser(response.user))
      } else {
        dispatch(setUser(response))
      }
      toast.success("Signed in successfully", { id: "login-success" })
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
  }, [clearErrors, dispatch, login, setError])

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
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={isLoading || isSubmitting}
          errorMessage={formError}
          isValid={canSubmit}
          acceptTermsChecked={values.acceptTerms}
          setAcceptTerms={(value) => setValue("acceptTerms", value, { shouldValidate: true })}
        />
      </OnboardingFormCard>
    </OnboardingLayout>
  )
}
