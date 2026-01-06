import { useEffect, useState } from "react";
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
import { useSendOtpMutation } from "@/features/auth/api/authApi";

export default function SignUp() {
  const dispatch = useAppDispatch();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [gender, setGender] = useState("");
  const [language, setLanguage] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");

  const [sendOtp, { isLoading: sendingOtp, error }] = useSendOtpMutation();
  const handleSendOtp = async () => {
    try {
      await sendOtp({ phone }).unwrap();
      setStep(2);
    } catch (err: any) {
      alert(err?.data?.error ?? "Failed to send OTP");
    }
  };
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
            phone={phone}
            setPhone={setPhone}
            onNext={handleSendOtp}
            loading={sendingOtp}
          />
        )}

        {step === 2 && (
          <StepOtp
            otp={otp}
            setOtp={setOtp}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
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
