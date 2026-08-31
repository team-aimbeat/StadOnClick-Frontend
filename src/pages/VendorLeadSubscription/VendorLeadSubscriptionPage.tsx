import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAppDispatch } from "@/app/hooks";
import { DashboardContainer } from "@/components/dashboard";
import TitleBreadCrumbs from "@/components/shared/TitleBreadCrumbs";
import { Skeleton } from "@/components/ui/skeleton";
import { setPageTitle } from "@/features/Layout/themeConfigSlice";
import {
  useGetLeadSubscriptionStatusQuery,
  useListLeadPlansQuery,
  usePurchaseLeadSubscriptionMutation,
} from "@/features/vendorLeadSubscriptions/api/vendorLeadSubscriptions.api";
import {
  tierRank,
  type LeadPlan,
} from "@/features/vendorLeadSubscriptions/types/leadPlans.types";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { PlanCard } from "./PlanCard";
import { SubscriptionStatusBanner } from "./SubscriptionStatusBanner";

const backgroundTexture = (
  <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute left-[-80px] top-10 h-64 w-64 rounded-full bg-black/[0.03] blur-3xl" />
    <div className="absolute right-[-120px] top-24 h-80 w-80 rounded-full bg-black/[0.02] blur-3xl" />
    <div className="absolute left-14 top-1/3 h-48 w-48 rounded-full bg-black/[0.015] blur-3xl" />
    <div className="absolute inset-4 rounded-[32px] border border-white/70 bg-white/40 backdrop-blur-[1px]" />
  </div>
);

const VendorLeadSubscriptionPage = () => {
  const dispatch = useAppDispatch();
  const {
    data: plansData = [],
    isLoading: isPlansLoading,
    isFetching: isPlansFetching,
    error: plansError,
  } = useListLeadPlansQuery();
  const {
    data: subscriptionStatus,
    isLoading: isStatusLoading,
    isFetching: isStatusFetching,
    error: statusError,
  } = useGetLeadSubscriptionStatusQuery();
  const [purchaseLeadSubscription, { isLoading: isPurchasing }] =
    usePurchaseLeadSubscriptionMutation();

  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(setPageTitle("Lead Plans"));
  }, [dispatch]);

  const parseErrorMessage = (error: unknown) =>
    normalizeApiError(error, "Unable to complete the request.").toastMessage;

  const activePlans = useMemo(
    () => plansData.filter((plan) => plan.isActive),
    [plansData]
  );

  const plans = useMemo(
    () => [...activePlans].sort((a, b) => tierRank(a.name) - tierRank(b.name)),
    [activePlans]
  );

  const popularPlanId = useMemo(
    () => plans.find((plan) => plan.name.toUpperCase() === "PRO")?.id ?? null,
    [plans]
  );

  const isLoadingPlans = isPlansLoading || isPlansFetching;
  const isLoadingStatus = isStatusLoading || isStatusFetching;

  const handlePurchase = async (plan: LeadPlan) => {
    const isCurrentPlan =
      subscriptionStatus?.isActive &&
      subscriptionStatus?.planName?.toUpperCase() === plan.name.toUpperCase();

    if (isCurrentPlan || isPurchasing) return;

    setPurchaseError(null);
    setActivePlanId(plan.id);

    try {
      const response = await purchaseLeadSubscription({
        planId: plan.id,
      }).unwrap();
      const redirectUrl = response.url || response.checkoutUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
        return;
      }

      toast.success("Redirecting to checkout...");
    } catch (error) {
      const message = parseErrorMessage(error);
      setPurchaseError(message);
      toast.error(message);
    } finally {
      setActivePlanId(null);
    }
  };

  const hasPlans = plans.length > 0;
  const showSkeleton = isLoadingPlans && !hasPlans;

  const planErrorMessage = plansError ? parseErrorMessage(plansError) : null;
  const statusErrorMessage = statusError
    ? parseErrorMessage(statusError)
    : null;

  return (
    <div className="relative min-h-screen ">
      {backgroundTexture}
      <DashboardContainer className="relative z-10 max-w-7xl pb-16">
        <div className="space-y-3 pt-4">
          <TitleBreadCrumbs
            title="Choose your plan"
            breadCrumbTitle="Leads / Subscription"
            subtitle="Unlock endless possibilities"
            className="w-full"
          />
        </div>

        <SubscriptionStatusBanner
          status={subscriptionStatus}
          isLoading={isLoadingStatus}
          error={statusErrorMessage}
        />

        <section className="mt-10 space-y-4">
          {planErrorMessage && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm font-medium text-amber-800 shadow-sm backdrop-blur-md">
              {planErrorMessage}
            </div>
          )}

          {purchaseError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 shadow-sm backdrop-blur-md">
              {purchaseError}
            </div>
          )}

          {showSkeleton && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md"
                >
                  <Skeleton className="h-6 w-32 rounded-full bg-slate-200/80" />
                  <Skeleton className="mt-3 h-10 w-24 rounded-full bg-slate-200/80" />
                  <div className="mt-6 space-y-3">
                    <Skeleton className="h-4 w-3/4 rounded bg-slate-200/80" />
                    <Skeleton className="h-4 w-2/3 rounded bg-slate-200/80" />
                    <Skeleton className="h-4 w-1/2 rounded bg-slate-200/80" />
                  </div>
                  <Skeleton className="mt-6 h-11 rounded-full bg-slate-200/80" />
                </div>
              ))}
            </div>
          )}

          {!showSkeleton && !hasPlans && (
            <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 text-center shadow-sm backdrop-blur-md">
              <p className="text-lg font-semibold text-slate-900">
                No plans available
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Please contact support.
              </p>
            </div>
          )}

          {!showSkeleton && hasPlans && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              {plans.map((plan) => {
                const isCurrentPlan =
                  subscriptionStatus?.isActive &&
                  subscriptionStatus?.planName?.toUpperCase() ===
                    plan.name.toUpperCase();

                return (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isPopular={plan.id === popularPlanId}
                    isCurrent={isCurrentPlan}
                    disabled={isPurchasing}
                    isProcessing={isPurchasing && activePlanId === plan.id}
                    onSelect={handlePurchase}
                  />
                );
              })}
            </div>
          )}
        </section>
      </DashboardContainer>
    </div>
  );
};

export default VendorLeadSubscriptionPage;
