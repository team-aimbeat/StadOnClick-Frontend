import { useCallback, useEffect, useState } from "react";
import bgImage1 from "@/assets/user-onboarding/user-onboarding-1.png";
import { OnboardingLayout } from "../components/user-onboarding/OnboardingLayout";
import { OnboardingFormCard } from "../components/user-onboarding/OnboardingFormCard";
import { StepPhone } from "../components/user-onboarding/StepPhone";
import { StepProfile } from "../components/user-onboarding/StepProfile";
import { StepOtp } from "../components/user-onboarding/StepOtp";
import { StepPersonalize } from "../components/user-onboarding/StepPersonalize";
import bgImage2 from "@/assets/user-onboarding/user-onboarding-2.png";
import bgImage3 from "@/assets/user-onboarding/user-onboarding-3.png";
import bgImage4 from "@/assets/user-onboarding/user-onboarding-4.png";
import { useAppDispatch } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
} from "@/features/auth/api/authApi";
import { toast } from "react-hot-toast";
import { useForm, useFormState } from "react-hook-form";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";

type FormValues = {
  phone: string;
  otp: string;
};

export default function SignUp() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");

  const { register, handleSubmit, control, setError, clearErrors, watch, setValue } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { phone: "", otp: "" },
  });
  const { errors, isSubmitting } = useFormState({ control });
  const values = watch();

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [onboardingSessionId, setOnboardingSessionId] = useState<string | null>(
    null
  );

  const handleSendOtp = useCallback(
    async (data: FormValues) => {
      clearErrors(["phone", "otp"]);
      try {
        const res = await sendOtp({ phone: data.phone }).unwrap();
        setOnboardingSessionId(res.sessionId);
        toast.success("OTP sent", { id: "otp-send" });
        setStep(2);
      } catch (err) {
        const { fieldErrors, toastMessage } = normalizeApiError(err, "Failed to send OTP");
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: "server", message });
        });
        toast.error(toastMessage, { id: "otp-error" });
      }
    },
    [clearErrors, sendOtp, setError]
  );

  const handleVerifyOtp = useCallback(
    async (data: FormValues) => {
      clearErrors("otp");

      if (!onboardingSessionId) {
        toast.error("Invalid onboarding session", { id: "otp-session-error" });
        return;
      }

      try {
        await verifyOtp({
          phone: data.phone,
          code: data.otp,
        }).unwrap();

        toast.success("Phone number verified", { id: "otp-verify-success" });
        setStep(3);
      } catch (err) {
        const { fieldErrors, toastMessage } = normalizeApiError(err, "Invalid or expired OTP");

        if (Object.keys(fieldErrors).length === 0) {
          setError("otp", { type: "server", message: toastMessage });
        } else {
          Object.entries(fieldErrors).forEach(([field, message]) => {
            setError(field as keyof FormValues, { type: "server", message });
          });
        }
        toast.error(toastMessage, { id: "otp-verify-error" });
      }
    },
    [clearErrors, onboardingSessionId, setError, verifyOtp]
  );

  const getTitles = () => {
    switch (step) {
      case 1:
        return {
          title: "Create your account in seconds",
          subtitle:
            "Join Sweden's smart service platform. Connect with trusted vendors and manage everything in one place.",
        };
      case 2:
        return {
          title: "Verify your number",
          subtitle:
            "Enter the 6-digit code we sent to your phone to keep your account secure.",
        };
      case 3:
        return {
          title: "Complete Your Basic Profile",
          subtitle:
            "Just a few quick details to help us personalise your experience.",
        };
      case 4:
        return {
          title: "Let’s personalize your experience",
          subtitle: "Help us recommend activities that match your preferences.",
        };
      default:
        return {
          title: "Welcome to StadonClick",
          subtitle:
            "Create an account to manage services, bookings, and vendors in one place.",
        };
    }
  };

  useEffect(() => {
    dispatch(setPageTitle(getTitles().title));
  }, [dispatch, step]);
  useEffect(() => {
    register("phone");
    register("otp");
  }, [register]);

  const getBackgroundImage = () => {
    switch (step) {
      case 1:
        return bgImage1;
      case 2:
        return bgImage2;
      case 3:
        return bgImage3;
      case 4:
        return bgImage4;
      default:
        return bgImage4;
    }
  };
  return (
    <OnboardingLayout
      image={getBackgroundImage()}
      imageTitle={"Your Hub for Swedish Activity\nExperiences"}
      imageSubtitle=""
    >
      <OnboardingFormCard
        step={step}
        total={4}
        title={getTitles().title}
        subtitle={getTitles().subtitle}
        onStepClick={(nextStep) => setStep(nextStep)}
      >
        {step === 1 && (
          <StepPhone
            phone={values.phone}
            onPhoneChange={(value) => setValue("phone", value, { shouldValidate: true })}
            onNext={handleSubmit(handleSendOtp)}
            loading={sendingOtp || isSubmitting}
            errors={errors}
          />
        )}

        {step === 2 && (
          <StepOtp
            otp={values.otp}
            setOtp={(value) => setValue("otp", value, { shouldValidate: true })}
            onBack={() => setStep(1)}
            onNext={handleSubmit(handleVerifyOtp)}
            errors={errors}
            loading={verifyingOtp || isSubmitting}
          />
        )}

        {step === 3 && (
          <StepProfile
            firstName={firstName}
            lastName={lastName}
            userName={userName}
            gender={gender}
            language={language}
            email={email}
            location={location}
            age={age}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setUserName={setUserName}
            setGender={setGender}
            setLanguage={setLanguage}
            setEmail={setEmail}
            setLocation={setLocation}
            setAge={setAge}
            onBack={() => setStep(2)}
            onNext={() => setStep(4)}
          />
        )}

        {step === 4 && (
          <StepPersonalize
            onNext={() => setStep(4)}
            onSkip={() => setStep(4)}
          />
        )}
      </OnboardingFormCard>
    </OnboardingLayout>
  );
}
