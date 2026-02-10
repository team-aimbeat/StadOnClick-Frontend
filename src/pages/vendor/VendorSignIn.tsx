import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage5 from "@/assets/user-onboarding/user-onboarding-5.png";
import { OnboardingLayout } from "@/components/shared/user-onboarding/OnboardingLayout";
import { OnboardingFormCard } from "@/components/shared/user-onboarding/OnboardingFormCard";
import { useLoginMutation } from "@/features/auth/api/authApi";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setUser } from "@/features/auth/authSlice";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { toast } from "react-hot-toast";
import { useForm, useFormState } from "react-hook-form";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { AdminStepLogin } from "../components/admin-auth/AdminStepLogin";
// You can rename this to VendorStepLogin later, but reuse for now.

type FormValues = {
  email: string;
  password: string;
};

const VENDOR_ROLES = ["VENDOR"] as const;

function hasVendorAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((r) => VENDOR_ROLES.includes(r as any));
}

export default function VendorSignIn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authUser = useAppSelector((s) => s.auth.user);

  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const { register, handleSubmit, control, setError, clearErrors, watch } =
    useForm<FormValues>({
      mode: "onChange",
      defaultValues: { email: "", password: "" },
    });

  const { errors, isSubmitting, isValid } = useFormState({ control });
  const values = watch();

  const canSubmit = useMemo(() => {
    return Boolean(values.email && values.password && isValid);
  }, [values.email, values.password, isValid]);

  useEffect(() => {
    dispatch(setPageTitle("Vendor Sign in"));
  }, [dispatch]);

  // If already vendor, skip login screen
  useEffect(() => {
    if (authUser?.roles?.length && hasVendorAccess(authUser.roles)) {
      navigate(authUser.nextAction || "/vendor/dashboard", { replace: true });
    }
  }, [authUser?.nextAction, authUser?.roles, navigate]);

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setFormError(undefined);
      clearErrors();

      try {
        const response = await login({
          email: data.email,
          password: data.password,
        }).unwrap();

        const user = response?.user ?? response;

        // IMPORTANT: backend MUST include roles in /auth/me
        // If login response doesn't include roles, it will be filled by /auth/me bootstrap.
        dispatch(setUser(user));

        toast.success("Signed in successfully", { id: "vendor-login-success" });

        navigate(user.nextAction || "/vendor/dashboard", { replace: true });
      } catch (err) {
        const { fieldErrors, formError: normalizedFormError, toastMessage } =
          normalizeApiError(err, "Unable to sign in. Please try again.");

        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof FormValues, { type: "server", message });
        });

        setFormError(normalizedFormError);
        toast.error(toastMessage, { id: "vendor-login-error" });
        console.error("Vendor login failed", err);
      }
    },
    [clearErrors, dispatch, login, navigate, setError]
  );

  return (
    <OnboardingLayout
      image={bgImage5}
      imageTitle={"Vendor Console\nStadonClick"}
      imageSubtitle={"Manage services, bookings, leads, and payouts"}
    >
      <OnboardingFormCard
        step={1}
        total={1}
        title="Vendor Sign in"
        subtitle="Login to manage your business operations in one place."
        showStepper={false}
      >
        <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <p className="font-semibold">Vendor portal</p>
          <p className="mt-0.5 text-xs text-blue-800">
            This area is for Vendors only. User accounts cannot access the vendor dashboard.
          </p>
        </div>

        <AdminStepLogin
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={isLoading || isSubmitting}
          errorMessage={formError}
          isValid={canSubmit}
        />

        <div className="mt-4 space-y-2 rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500">Looking for user sign in instead?</p>
          <p className="text-sm text-[#0b59a2]">
            <a
              href="/sign-in"
              className="font-semibold underline transition hover:text-[#094374]"
            >
              Go to User Sign in
            </a>
          </p>
        </div>
      </OnboardingFormCard>
    </OnboardingLayout>
  );
}
