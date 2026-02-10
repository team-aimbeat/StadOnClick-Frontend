import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "@/app/hooks";
import { setUser } from "@/features/auth/authSlice";
import { useAutoLoginMutation } from "@/features/auth/api/authApi";

export default function VendorAutoLogin() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [autoLogin] = useAutoLoginMutation();
  const [error, setError] = useState<string | null>(null);

  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!token) {
        if (mounted) setError("Missing login token.");
        return;
      }

      try {
        const response = await autoLogin({ token }).unwrap();
        dispatch(setUser(response.user));
        navigate(response.user.nextAction || "/vendor/dashboard", { replace: true });
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.data?.message || "Auto login failed. Please request a new login link.");
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [autoLogin, dispatch, navigate, token]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-24">
      <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        {!error ? (
          <>
            <h1 className="text-xl font-semibold text-slate-900">Signing you in...</h1>
            <p className="mt-2 text-sm text-slate-600">Verifying secure login token.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-rose-700">Auto login failed</h1>
            <p className="mt-2 text-sm text-slate-600">{error}</p>
            <a
              href="/vendor/sign-in"
              className="mt-5 inline-flex rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Go to vendor sign in
            </a>
          </>
        )}
      </div>
    </div>
  );
}
