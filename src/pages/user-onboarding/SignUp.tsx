import { useCallback, useEffect, useState } from "react";
import bgImage1 from "@/assets/user-onboarding/user-onboarding-1.png";
import { OnboardingLayout } from "@/components/shared/user-onboarding/OnboardingLayout";
import { OnboardingFormCard } from "@/components/shared/user-onboarding/OnboardingFormCard";
import { StepPhone } from "@/components/shared/user-onboarding/StepPhone";
import { StepProfile } from "@/components/shared/user-onboarding/StepProfile";
import { StepOtp } from "@/components/shared/user-onboarding/StepOtp";
import { StepPersonalize } from "@/components/shared/user-onboarding/StepPersonalize";
import { StepRole } from "@/components/shared/user-onboarding/StepRole";
import bgImage2 from "@/assets/user-onboarding/user-onboarding-2.png";
import bgImage3 from "@/assets/user-onboarding/user-onboarding-3.png";
import bgImage4 from "@/assets/user-onboarding/user-onboarding-4.png";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { setUser } from "@/features/auth/authSlice";
import {
  authApi,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useCompleteProfileMutation,
  useResendOtpMutation,
  useGetCitiesQuery,
} from "@/features/auth/api/authApi";
import { toast } from "react-hot-toast";
import { useForm, useFormState } from "react-hook-form";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import type {
  BasicProfileRequest,
  OnboardingRoleEnum,
} from "@/features/auth/types/basicProfile.types";
import type { City } from "@/features/auth/types/city.types";
import { useLocation, useNavigate } from "react-router-dom";

type FormValues = {
  phone: string;
  otp: string;
  firstName: string;
  lastName: string;
  nickName: string;
  email: string;
  gender: string;
  ageGroup: string;
  locale: string;
  password: string;
  confirmPassword: string;
  streetAddress: string;
  cityId: string;
  profileImageUrl: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  role: OnboardingRoleEnum | "";
};

export default function SignUp() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const location = useLocation();
  const navigate = useNavigate();
  const initialStep = (() => {
    const queryValue = Number(new URLSearchParams(location.search).get("step"));
    if (!Number.isNaN(queryValue) && queryValue >= 5) return 5;
    if (!Number.isNaN(queryValue) && queryValue >= 1 && queryValue <= 4) return queryValue;
    return 1;
  })();
  const [step, setStep] = useState(initialStep);

  const { register, handleSubmit, control, setError, clearErrors, watch, setValue } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: {
      phone: "",
      otp: "",
      firstName: "",
      lastName: "",
      nickName: "",
      email: "",
      gender: "",
      ageGroup: "",
      locale: "en-SE",
      password: "",
      confirmPassword: "",
      streetAddress: "",
      cityId: "",
      profileImageUrl: "",
      marketingConsent: false,
      termsAccepted: false,
      role: "",
    },
  });
  const { errors, isSubmitting } = useFormState({ control });
  const values = watch();

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [completeProfile, { isLoading: completingProfile }] = useCompleteProfileMutation();
  const [resendOtp, { isLoading: resendingOtp }] = useResendOtpMutation();
  const { data: citiesData, isFetching: citiesLoading } = useGetCitiesQuery(undefined);
  const cityOptions = (citiesData?.data as City[]) || [];
  const [onboardingSessionId, setOnboardingSessionId] = useState<string | null>(null);

  const handlePersonalizationComplete = () => {
    dispatch(authApi.util.invalidateTags(["User"]));
    if (currentUser) {
      dispatch(setUser({ ...currentUser, status: "ACTIVE" }));
    }
    navigate("/", { replace: true });
  };

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
    [clearErrors, sendOtp, setError],
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
    [clearErrors, onboardingSessionId, setError, verifyOtp],
  );

  const handleCompleteProfile = useCallback(
    async (data: FormValues) => {
      clearErrors();

      if (!onboardingSessionId) {
        toast.error("Invalid onboarding session", { id: "profile-session-error" });
        return;
      }

      if (!data.role) {
        setError("role", { type: "manual", message: "Please select a role." });
        toast.error("Please select a role.", { id: "role-required" });
        return;
      }

      if (!data.termsAccepted) {
        setError("termsAccepted", { type: "manual", message: "You must accept the terms." });
        toast.error("Please accept the terms to continue.", { id: "terms-error" });
        return;
      }

      if (data.password !== data.confirmPassword) {
        setError("confirmPassword", { type: "manual", message: "Passwords do not match." });
        toast.error("Passwords do not match.", { id: "confirm-password-error" });
        return;
      }

      if (!data.firstName) {
        setError("firstName", { type: "manual", message: "First name is required." });
      }
      if (!data.email) {
        setError("email", { type: "manual", message: "Email is required." });
      }
      if (!data.password || data.password.length < 8) {
        setError("password", { type: "manual", message: "Password must be at least 8 characters." });
      }
      if (!data.cityId) {
        setError("cityId", { type: "manual", message: "Select a city." });
      }

      if (!data.firstName || !data.email || !data.password || data.password.length < 8 || !data.cityId) {
        toast.error("Please complete required fields.", { id: "profile-required" });
        return;
      }

      const payload: BasicProfileRequest = {
        onboardingSessionId,
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        nickName: data.nickName || undefined,
        email: data.email,
        gender: (data.gender || undefined) as BasicProfileRequest["gender"],
        ageGroup: (data.ageGroup || undefined) as BasicProfileRequest["ageGroup"],
        locale: data.locale || undefined,
        password: data.password,
        streetAddress: data.streetAddress || undefined,
        cityId: data.cityId || undefined,
        profileImageUrl: data.profileImageUrl || undefined,
        marketingConsent: data.marketingConsent ?? undefined,
        role: data.role,
        termsAccepted: true,
      };

      try {
        const response = await completeProfile(payload).unwrap();
        if (response?.user) {
          dispatch(setUser(response.user as any));
        }
        toast.success("Profile saved", { id: "profile-success" });
        setStep(5);
      } catch (err) {
        const { fieldErrors, toastMessage } = normalizeApiError(err, "Failed to save profile");
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: "server", message });
        });
        toast.error(toastMessage, { id: "profile-error" });
      }
    },
    [clearErrors, completeProfile, onboardingSessionId, setError],
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
          subtitle: "Enter the 6-digit code we sent to your phone to keep your account secure.",
        };
      case 3:
        return {
          title: "Choose your role",
          subtitle: "Tell us if you are joining as a user or vendor.",
        };
      case 4:
        return {
          title: "Complete your basic profile",
          subtitle: "Just a few quick details to help us personalise your experience.",
        };
      case 5:
        return {
          title: "Let's personalize your experience",
          subtitle: "Help us recommend activities that match your preferences.",
        };
      default:
        return {
          title: "Welcome to StadonClick",
          subtitle: "Create an account to manage services, bookings, and vendors in one place.",
        };
    }
  };

  useEffect(() => {
    dispatch(setPageTitle(getTitles().title));
  }, [dispatch, step]);

  useEffect(() => {
    register("phone");
    register("otp");
    register("firstName");
    register("lastName");
    register("nickName");
    register("email");
    register("gender");
    register("ageGroup");
    register("locale");
    register("password");
    register("confirmPassword");
    register("streetAddress");
    register("cityId");
    register("profileImageUrl");
    register("marketingConsent");
    register("termsAccepted");
    register("role");
  }, [register]);

  useEffect(() => {
    const queryValue = Number(new URLSearchParams(location.search).get("step"));
    if (!Number.isNaN(queryValue) && queryValue >= 5) {
      setStep((prev) => Math.max(prev, 5));
    }
  }, [location.search]);

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
      case 5:
        return bgImage4;
      default:
        return bgImage4;
    }
  };

  return (
    <OnboardingLayout image={getBackgroundImage()} imageTitle={"Your Hub for Swedish Activity\nExperiences"} imageSubtitle="">
      <OnboardingFormCard step={step} total={5} title={getTitles().title} subtitle={getTitles().subtitle}>
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
            loading={verifyingOtp || resendingOtp || isSubmitting}
            onResend={async () => {
              try {
                clearErrors("otp");
                await resendOtp({ phone: values.phone }).unwrap();
                toast.success("OTP resent", { id: "otp-resend" });
              } catch (err) {
                const { toastMessage } = normalizeApiError(err, "Failed to resend OTP");
                toast.error(toastMessage, { id: "otp-resend-error" });
              }
            }}
          />
        )}

        {step === 3 && (
          <StepRole
            role={values.role}
            onSelectRole={(role) => setValue("role", role, { shouldValidate: true })}
            errors={errors}
            onBack={() => setStep(2)}
            onNext={() => {
              clearErrors("role");
              if (!values.role) {
                setError("role", { type: "manual", message: "Please select a role." });
                toast.error("Please select a role.", { id: "role-required" });
                return;
              }
              setStep(4);
            }}
          />
        )}

        {step === 4 && (
          <StepProfile
            firstName={values.firstName}
            lastName={values.lastName}
            nickName={values.nickName}
            gender={values.gender}
            locale={values.locale}
            email={values.email}
            streetAddress={values.streetAddress}
            ageGroup={values.ageGroup}
            password={values.password}
            confirmPassword={values.confirmPassword}
            marketingConsent={values.marketingConsent}
            termsAccepted={values.termsAccepted}
            role={values.role}
            setValue={(field, value) => setValue(field as keyof FormValues, value as any, { shouldValidate: true })}
            errors={errors}
            onBack={() => setStep(3)}
            onNext={handleSubmit(handleCompleteProfile)}
            loading={completingProfile || isSubmitting}
            cityId={values.cityId}
            onCitySelect={(val) => setValue("cityId", val, { shouldValidate: true })}
            cityOptions={cityOptions}
            citiesLoading={citiesLoading}
          />
        )}

        {step === 5 && <StepPersonalize onNext={handlePersonalizationComplete} onSkip={handlePersonalizationComplete} />}
      </OnboardingFormCard>
    </OnboardingLayout>
  );
}
