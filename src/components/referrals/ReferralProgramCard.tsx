import { useMemo } from "react";

import { useAppSelector } from "@/app/hooks";
import { useGetMyReferralSummaryQuery } from "@/features/referrals/api/referralApi";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function ReferralProgramCard() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useGetMyReferralSummaryQuery(undefined, {
    skip: !user,
  });

  const referralLink = useMemo(() => {
    if (!data?.referralCode) return "";
    if (typeof window === "undefined") return `/sign-up?ref=${data.referralCode}`;
    return `${window.location.origin}/sign-up?ref=${data.referralCode}`;
  }, [data?.referralCode]);

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
  };

  if (!user) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Referral Program</h3>

      {isLoading ? (
        <p className="mt-3 text-sm text-slate-500">Loading referral summary...</p>
      ) : (
        <>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Referral code" value={data?.referralCode || "-"} />
            <Stat label="Total referrals" value={String(data?.totalReferrals ?? 0)} />
            <Stat label="Successful" value={String(data?.successfulReferrals ?? 0)} />
            <Stat
              label="Total earned"
              value={currency.format(data?.totalRewardEarned ?? 0)}
            />
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Wallet balance</p>
            <p className="text-xl font-semibold text-slate-900">
              {currency.format(data?.walletBalance ?? 0)}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              readOnly
              value={referralLink}
              className="min-w-[260px] flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            />
            <button
              type="button"
              onClick={copyLink}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Copy referral link
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
