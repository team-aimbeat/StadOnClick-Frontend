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
import { getPostLoginRoute } from "@/lib/authRouting";
import { PortalSwitcher } from "@/components/shared/auth/PortalSwitcher";
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
    if (authUser?.roles?.length) {
      if (!hasVendorAccess(authUser.roles)) {
        navigate("/access-denied", { replace: true });
        return;
      }
      navigate(authUser.nextAction || getPostLoginRoute(authUser.roles), { replace: true });
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
        const isVendor = hasVendorAccess(user?.roles);

        if (!isVendor) {
          toast.error("Access denied. Vendor role required.", {
            id: "vendor-login-denied",
          });
          return navigate("/access-denied", { replace: true });
        }

        dispatch(setUser(user));

        toast.success("Signed in successfully", { id: "vendor-login-success" });

        navigate(user.nextAction || getPostLoginRoute(user.roles ?? []), { replace: true });
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
        <PortalSwitcher current="vendor" />

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
          emailLabel="Business Email"
          emailPlaceholder="owner@yourbusiness.com"
          passwordPlaceholder="Enter your password"
          portalName="Vendor Portal"
        />

      </OnboardingFormCard>
    </OnboardingLayout>
  );
}
