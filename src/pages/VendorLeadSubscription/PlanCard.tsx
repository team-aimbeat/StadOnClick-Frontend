import { Check, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { tierLabel, type LeadPlan } from "@/features/vendorLeadSubscriptions/types/leadPlans.types";

type PlanCardProps = {
  plan: LeadPlan;
  isPopular?: boolean;
  isCurrent?: boolean;
  disabled?: boolean;
  isProcessing?: boolean;
  onSelect: (plan: LeadPlan) => void;
};

const buildFeatures = (plan: LeadPlan): string[] => {
  const features = [
    `${plan.leadsPerDay} leads per day`,
    `Valid for ${plan.durationDays} days`,
    plan.maxConcurrentLeads && plan.maxConcurrentLeads > 0
      ? `Up to ${plan.maxConcurrentLeads} concurrent leads`
      : "Unlimited concurrent leads",
  ];

  const normalized = plan.name.toUpperCase();
  if (normalized === "PRO") {
    features.push("Priority support");
  }
  if (normalized === "UNLIMITED") {
    features.push("Priority support");
    features.push("High-volume vendor access");
  }

  return features;
};

export function PlanCard({
  plan,
  isPopular,
  isCurrent,
  disabled,
  isProcessing,
  onSelect,
}: PlanCardProps) {
  const planLabel = tierLabel(plan.name);
  const features = buildFeatures(plan);
  const isPro = plan.name.toUpperCase() === "PRO";
  const isUnlimited = plan.name.toUpperCase() === "UNLIMITED";
  const priceParts = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (plan.currency || "USD").toUpperCase(),
    maximumFractionDigits: 0,
  }).formatToParts(plan.price);
  const currencySymbol =
    priceParts.find((part) => part.type === "currency")?.value ||
    (plan.currency || "USD");
  const amount = priceParts
    .filter((part) => part.type === "integer" || part.type === "group")
    .map((part) => part.value)
    .join("");

  const description =
    plan.description ||
    (isPro
      ? "Best for teams that need consistent lead flow and priority routing."
      : isUnlimited
        ? "Unlimited capacity and concierge routing for scaling vendors."
        : "Start receiving verified leads with a flexible daily quota.");

  return (
    <div
      className={cn(
        "group relative flex h-full min-w-[320px] flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md",
        isPopular && "border-slate-300 ring-1 ring-slate-900/10",
        "backdrop-blur-xl"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold tracking-tight text-slate-900">
              {planLabel}
            </p>
            {isCurrent && (
              <Badge className="border-emerald-500/80 bg-emerald-50 text-emerald-700">
                Active
              </Badge>
            )}
          </div>
          <p className="text-base text-slate-600">{description}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {isPopular && (
            <Badge className="bg-slate-900 text-white">Popular</Badge>
          )}
          <div className="text-right">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-semibold text-slate-700">
                {currencySymbol}
              </span>
              <span className="text-6xl font-semibold leading-none text-slate-900">
                {amount}
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600">per month</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-800">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-base text-slate-700">{feature}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <Button
          type="button"
          disabled={disabled || isCurrent}
          onClick={() => onSelect(plan)}
          className={cn(
            "h-11 w-full rounded-full text-sm font-semibold transition",
            isCurrent && "cursor-not-allowed opacity-70",
            isPro
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
            isUnlimited &&
              !isPro &&
              "bg-slate-100 text-slate-900 hover:bg-slate-200"
          )}
        >
          {isCurrent
            ? "Current Plan"
            : isProcessing
              ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirecting...
                </span>
              )
              : "Get started"}
        </Button>
        <p className="text-center text-sm font-medium text-slate-600">
          Secure checkout powered by Stripe
        </p>
      </div>
    </div>
  );
}
