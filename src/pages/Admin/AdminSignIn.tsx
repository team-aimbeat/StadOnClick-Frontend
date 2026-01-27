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

type FormValues = {
  email: string;
  password: string;
};

const ADMIN_ROLES = ["ADMIN", "MODERATOR"] as const;

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
    const isAdmin = roles.includes("ADMIN");
    const isModerator = roles.includes("MODERATOR");
    const isSupportAdmin = roles.includes("SUPPORT_ADMIN");
    const isSupportOnly = isSupportAdmin && !isAdmin && !isModerator;
    const isModeratorOnly = isModerator && !isAdmin && !isSupportAdmin;

    if (!roles.length) return;
    if (isSupportOnly) {
      navigate("/admin/support/inbox", { replace: true });
      return;
    }
    if (isModeratorOnly) {
      navigate("/moderator/dashboard", { replace: true });
      return;
    }
    if (isAdmin || isModerator) {
      navigate("/admin/dashboard", { replace: true });
    }
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
      const isAdmin = user?.roles?.includes("ADMIN");
      const isModerator = user?.roles?.includes("MODERATOR");
      const isSupportAdmin = user?.roles?.includes("SUPPORT_ADMIN");
      const isSupportOnly = Boolean(isSupportAdmin && !isAdmin && !isModerator);
      const isModeratorOnly = Boolean(isModerator && !isAdmin && !isSupportAdmin);

      // 🔐 Frontend guard (still keep backend guard too)
      if (!isElevated && !isSupportOnly) {
        toast.error("Access denied. Admin role required.", {
          id: "admin-login-denied",
        });
        return navigate("/admin/access-denied", { replace: true });
      }

      dispatch(setUser(user));
      toast.success("Signed in successfully", { id: "admin-login-success" });

      if (isSupportOnly) {
        navigate("/admin/support/inbox", { replace: true });
      } else if (isModeratorOnly) {
        navigate("/moderator/dashboard", { replace: true });
      } else {
        navigate("/admin/dashboard", { replace: true });
      }
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
        />

        <div className="mt-4 space-y-2 rounded-xl border border-dashed border-slate-200 p-4 text-center">
          <p className="text-xs text-slate-500">
            Looking for the user sign in instead?
          </p>
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
