import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage5 from "@/assets/user-onboarding/user-onboarding-1.png";
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

type FormValues = {
  email: string;
  password: string;
};

const ADMIN_ROLES = ["ADMIN", "SUPPORT_ADMIN", "MODERATOR"] as const;

function hasAdminAccess(roles?: string[]) {
  if (!roles?.length) return false;
  return roles.some((r) => ADMIN_ROLES.includes(r as any));
}

export default function AdminSignIn() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const authUser = useAppSelector(authslice => authslice.auth.user);

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
    dispatch(setPageTitle("Admin Sign in"));
  }, [dispatch]);

  useEffect(() => {
    const roles = authUser?.roles ?? [];
    if (!roles.length) return;
    if (!hasAdminAccess(roles)) {
      navigate("/admin/access-denied", { replace: true });
      return;
    }
    navigate(getPostLoginRoute(roles), { replace: true });
  }, [authUser?.roles, navigate]);

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

      const isElevated = hasAdminAccess(user?.roles);

      // 🔐 Frontend guard (still keep backend guard too)
      if (!isElevated) {
        toast.error("Access denied. Admin role required.", {
          id: "admin-login-denied",
        });
        return navigate("/admin/access-denied", { replace: true });
      }

      dispatch(setUser(user));
      toast.success("Signed in successfully", { id: "admin-login-success" });

      navigate(getPostLoginRoute(user?.roles ?? []), { replace: true });
    } catch (err) {
      const { fieldErrors, formError: normalizedFormError, toastMessage } =
        normalizeApiError(err, "Unable to sign in. Please try again.");

      Object.entries(fieldErrors).forEach(([field, message]) => {
        setError(field as keyof FormValues, { type: "server", message });
      });

      setFormError(normalizedFormError);
      toast.error(toastMessage, { id: "admin-login-error" });
      console.error("Admin login failed", err);
    }
  },
  [clearErrors, dispatch, login, navigate, setError]
);


  return (
    <OnboardingLayout
      image={bgImage5}
      imageTitle={"Admin Console\nStadonClick"}
      imageSubtitle={"Secure access for platform operations"}
    >
      <OnboardingFormCard
        step={1}
        total={1}
        title="Admin Sign in"
        subtitle="Login to manage vendors, approvals, KYC, lead plans, and platform settings."
        showStepper={false}
      >
        <PortalSwitcher current="admin" />

        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          <p className="font-semibold">Restricted access</p>
          <p className="mt-0.5 text-xs text-rose-700">
            This portal is for Admins and Moderators only. All activity is audited.
          </p>
        </div>

        <AdminStepLogin
          register={register}
          errors={errors}
          onSubmit={handleSubmit(onSubmit)}
          loading={isLoading || isSubmitting}
          errorMessage={formError}
          isValid={canSubmit}
          emailLabel="Work Email"
          emailPlaceholder="name@stadonclick.com"
          passwordPlaceholder="Enter your password"
        />

      </OnboardingFormCard>
    </OnboardingLayout>
  );
}
