import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TicketCheck,
} from "lucide-react";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import { useGetLeadSubscriptionStatusQuery } from "@/features/vendorLeadSubscriptions/api/vendorLeadSubscriptions.api";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";

const BackgroundTexture = () => (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute left-[-120px] top-16 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
    <div className="absolute right-[-160px] top-24 h-80 w-80 rounded-full bg-sky-200/40 blur-3xl" />
    <div className="absolute left-10 bottom-10 h-64 w-64 rounded-full bg-white/50 blur-3xl" />
  </div>
);

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | JSX.Element;
}) => (
  <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {label}
    </p>
    <div className="mt-2 text-lg font-semibold text-slate-900">{value}</div>
  </div>
);

const SubscriptionSuccessPage = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const {
    data: status,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLeadSubscriptionStatusQuery();

  useEffect(() => {
    dispatch(setPageTitle("Lead Plan Activated"));
  }, [dispatch]);

  useEffect(() => {
    if (sessionId) {
      refetch();
    }
  }, [sessionId, refetch]);

  const statusErrorMessage = error
    ? normalizeApiError(error, "Unable to load your subscription status.")
        .toastMessage
    : null;

  const shortSessionId = useMemo(() => {
    if (!sessionId) return null;
    if (sessionId.length <= 12) return sessionId;
    return `${sessionId.slice(0, 8)}…${sessionId.slice(-6)}`;
  }, [sessionId]);

  const expiresAt = status?.expiresAt
    ? dayjs(status.expiresAt).format("MMM D, YYYY")
    : null;

  const isActive = status?.isActive;
  const isLoadingStatus = isLoading || isFetching;

  const headline = useMemo(() => {
    if (isLoadingStatus) return "Checking your subscription...";
    if (statusErrorMessage) return "We hit a bump confirming your plan.";
    if (isActive) return "Your lead subscription is now live.";
    return "Payment received. Finalizing activation.";
  }, [isActive, isLoadingStatus, statusErrorMessage]);

  const subtext = useMemo(() => {
    if (isLoadingStatus) return "Hold on while we sync your checkout with Stripe.";
    if (statusErrorMessage)
      return "Please retry or head back to your plans to confirm everything looks right.";
    if (isActive)
      return "We refreshed your limits and routing. New leads will start flowing into your dashboard.";
    return "This usually takes a few seconds. Refresh the status if you don't see your plan yet.";
  }, [isActive, isLoadingStatus, statusErrorMessage]);

  return (
    <div className="relative min-h-screen bg-slate-50">
      <BackgroundTexture />
      <DashboardContainer className="relative z-10 max-w-5xl pb-16 pt-10">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-teal-600 to-sky-600 text-white shadow-2xl">
          <div className="relative px-6 py-10 sm:px-10 sm:py-12">
            <div className="absolute inset-0 opacity-40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_38%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.2),transparent_45%)]" />
            </div>
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 shadow-inner backdrop-blur">
                  <CheckCircle2 className="h-10 w-10" strokeWidth={1.6} />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                    Checkout complete
                  </p>
                  <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                    Lead subscription secured
                  </h1>
                  <p className="max-w-2xl text-base text-white/80">{subtext}</p>
                  <div className="flex flex-wrap gap-2">
                    {shortSessionId && (
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                        Session • {shortSessionId}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      <ShieldCheck className="h-4 w-4" />
                      Stripe secured
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
                      <Sparkles className="h-4 w-4" />
                      Auto refresh on return
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-white/60 bg-white/10 text-white hover:bg-white/20"
                  onClick={() => refetch()}
                  disabled={isLoadingStatus}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Refresh status
                </Button>
                <Button asChild className="bg-white text-emerald-800 hover:bg-white/90">
                  <Link to="/vendor/leads">
                    View leads
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Status
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {headline}
                </h2>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                    : "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                }`}
              >
                <TicketCheck className="h-4 w-4" />
                {isActive ? "Active" : "Pending"}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {isLoadingStatus ? (
                <>
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </>
              ) : (
                <>
                  <InfoItem
                    label="Plan"
                    value={status?.planName ? status.planName : "Awaiting update"}
                  />
                  <InfoItem
                    label="Daily allowance"
                    value={
                      status?.leadsPerDay
                        ? `${status.leadsPerDay.toLocaleString()} verified leads`
                        : "Syncing limits"
                    }
                  />
                  <InfoItem
                    label="Expires"
                    value={expiresAt ?? "Generating schedule"}
                  />
                  <InfoItem
                    label="Receipt"
                    value={
                      status?.receiptUrl ? (
                        <a
                          href={status.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-emerald-700 underline-offset-4 hover:underline"
                        >
                          View receipt
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      ) : (
                        "Will be emailed once the charge posts"
                      )
                    }
                  />
                </>
              )}
            </div>

            {statusErrorMessage && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {statusErrorMessage}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link to="/vendor/leads/subscription">
                  Manage lead plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="text-slate-700 hover:text-slate-900"
                onClick={() => refetch()}
              >
                <RefreshCcw className="h-4 w-4" />
                Retry status
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <Clock3 className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    What happens next?
                  </p>
                  <p className="text-sm text-slate-600">
                    We activate the plan, reset your lead quota for today, and
                    open routing for new requests.
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  Monitor new leads under
                  <span className="ml-1 font-semibold text-emerald-700">
                    Leads &gt; Inbox
                  </span>
                  .
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  Download receipts anytime from this page once generated.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  If you do not see your plan within a minute, refresh or
                  contact support.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Need a hand?
                  </p>
                  <p className="text-sm text-slate-600">
                    Our vendor success team can validate the charge or resend
                    the receipt.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild size="sm" variant="outline">
                  <Link to="/vendor/support">
                    Message support
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="text-slate-700">
                  <Link to="/vendor/leads">
                    Return to leads
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </DashboardContainer>
    </div>
  );
};

export default SubscriptionSuccessPage;
