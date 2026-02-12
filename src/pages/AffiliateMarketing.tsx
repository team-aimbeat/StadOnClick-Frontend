import { useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { authApi, useRefreshMutation } from "@/features/auth/api/authApi";
import { setUser } from "@/features/auth/authSlice";
import { useActivateAffiliateMutation } from "@/features/affiliate/api/affiliateApi";

export default function AffiliateMarketing() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isAffiliate = (user?.roles ?? []).includes("AFFILIATE");
  const [activateAffiliate, { data, isLoading }] = useActivateAffiliateMutation();
  const [refreshSession] = useRefreshMutation();
  const autoActivationTriggeredRef = useRef(false);

  useEffect(() => {
    if (!user) {
      navigate("/sign-in", { replace: true });
      return;
    }
    if (isAffiliate) {
      navigate("/affiliate/dashboard", { replace: true });
      return;
    }
  }, [isAffiliate, navigate, user]);

  const referralLink = useMemo(() => data?.data?.referralLink ?? "", [data?.data?.referralLink]);

  const handleActivate = async () => {
    try {
      const result = await activateAffiliate().unwrap();
      await refreshSession().unwrap();
      const me = await dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true })).unwrap();
      if (me?.user) {
        dispatch(setUser(me.user as any));
      }
      toast.success("Affiliate program activated");
      if (result?.data?.referralLink) {
        await navigator.clipboard.writeText(result.data.referralLink);
      }
      navigate("/affiliate/dashboard", { replace: true });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to activate affiliate program");
    }
  };

  useEffect(() => {
    if (!user || isAffiliate || autoActivationTriggeredRef.current) {
      return;
    }

    autoActivationTriggeredRef.current = true;
    void handleActivate();
  }, [isAffiliate, user]);

  const handleShare = async () => {
    if (!referralLink) return;
    if (navigator.share) {
      await navigator.share({
        title: "Join StadOnClick",
        text: "Sign up using my affiliate referral link",
        url: referralLink,
      });
      return;
    }
    await navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied");
  };

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Affiliate Program</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Become an Affiliate Marketer</h1>
        <p className="mt-4 text-slate-600">
          Activate your affiliate account and get your unique referral link for StadOnClick signups.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Referral Link</label>
            <input
              readOnly
              value={referralLink}
              placeholder="Activate to generate your referral link"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            />
          </div>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleActivate}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {isLoading ? "Activating..." : "Activate Affiliate"}
          </button>
        </div>

        {referralLink ? (
          <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[auto_1fr]">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}`}
              alt="Referral QR code"
              className="h-[180px] w-[180px] rounded-xl border border-slate-200 bg-white p-2"
            />
            <div className="space-y-3">
              <p className="text-sm font-semibold text-slate-800">Share your referral link</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(referralLink);
                    toast.success("Referral link copied");
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Share
                </button>
                <Link
                  to="/affiliate/dashboard"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Open Dashboard
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
