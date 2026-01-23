import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { BarChart3, CalendarDays, Layers, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { LeadPlanTier } from "@/features/adminLeads/types/leadPlans.types";

type BillingPeriod = "monthly" | "annual";

export type LeadPlanFormValues = {
  name: LeadPlanTier;
  price: number;
  currency: string;
  leadsPerDay: number;
  durationDays: number;
  maxConcurrentLeads?: number;
  isActive: boolean;
};

type LeadPlanFormDialogProps = {
  mode: "create" | "edit";
  isOpen: boolean;
  loading?: boolean;
  error?: string | null;
  existingPlanNames: LeadPlanTier[];
  initialValues?: Partial<LeadPlanFormValues>;
  onClose: () => void;
  onSubmit: (values: LeadPlanFormValues) => void;
};

const DEFAULT_VALUES: LeadPlanFormValues = {
  name: "BASIC",
  price: 0,
  currency: "SEK",
  leadsPerDay: 10,
  durationDays: 30,
  maxConcurrentLeads: undefined,
  isActive: true,
};

const PLAN_TIERS: LeadPlanTier[] = ["BASIC", "PRO", "UNLIMITED"];

const TIER_META: Record<
  LeadPlanTier,
  { label: string; tagline: string; bullets: string[]; badge?: string }
> = {
  BASIC: {
    label: "Basic",
    tagline: "Starter vendors",
    bullets: ["Verified leads", "Easy onboarding"],
  },
  PRO: {
    label: "Pro",
    tagline: "Growing businesses",
    bullets: ["Priority routing", "Receipts & invoices"],
    badge: "Recommended",
  },
  UNLIMITED: {
    label: "Unlimited",
    tagline: "High volume teams",
    bullets: ["Unlimited reach", "Scaling support"],
  },
};

const ensureFiniteNumber = (value: number) => Number.isFinite(value) || "Enter a valid number.";
const ensureWholeNumber = (label: string) => (value: number) => {
  if (!Number.isFinite(value)) return `Enter a valid ${label.toLowerCase()}.`;
  if (!Number.isInteger(value)) return `${label} must be a whole number.`;
  return true;
};

const formatPreview = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "-";

export default function LeadPlanFormDialog({
  mode,
  isOpen,
  loading = false,
  error,
  existingPlanNames,
  initialValues,
  onClose,
  onSubmit,
}: LeadPlanFormDialogProps) {
  const mergedDefaults = useMemo(
    () => ({ ...DEFAULT_VALUES, ...initialValues, currency: "SEK" }),
    [initialValues]
  );
  const isCreateMode = mode === "create";
  const tierLocked = !isCreateMode;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LeadPlanFormValues>({
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    if (isOpen) {
      reset(mergedDefaults);
      if (isCreateMode && isTierDisabled(mergedDefaults.name)) {
        const firstAvailable = PLAN_TIERS.find((tier) => !existingPlanNames.includes(tier));
        if (firstAvailable) setValue("name", firstAvailable);
      }
    }
  }, [isOpen, mergedDefaults, reset, isCreateMode, existingPlanNames, setValue]);

  const currentValues = watch();

  useEffect(() => {
    if (currentValues.currency !== "SEK") {
      setValue("currency", "SEK");
    }
    if (currentValues.name !== "UNLIMITED" && currentValues.maxConcurrentLeads !== undefined) {
      setValue("maxConcurrentLeads", undefined, { shouldDirty: true });
    }
  }, [currentValues.name, currentValues.currency, currentValues.maxConcurrentLeads, setValue]);

  const handleFormSubmit = (values: LeadPlanFormValues) => {
    if (isTierDisabled(values.name)) {
      setError("name", {
        type: "manual",
        message: "This tier already exists. Choose another tier.",
      });
      return;
    }

    const maxConcurrentLeads =
      values.name === "UNLIMITED" &&
      typeof values.maxConcurrentLeads === "number" &&
      !Number.isNaN(values.maxConcurrentLeads)
        ? values.maxConcurrentLeads
        : undefined;

    const safeValues: LeadPlanFormValues = { ...values, maxConcurrentLeads };
    onSubmit(safeValues);
  };

  const isTierDisabled = (tier: LeadPlanTier) =>
    isCreateMode && existingPlanNames.includes(tier);

  const effectiveMonthly =
    currentValues.durationDays > 0
      ? Math.round(((currentValues.price ?? 0) / currentValues.durationDays) * 30)
      : 0;

  const billingPeriod: BillingPeriod = "monthly";

  const resolvePrice = (plan: { price?: number }) => {
    const base = Number(plan.price ?? 0);
    if (billingPeriod === "monthly") return base;
    const annual = base * 12 * 0.85; // 15% off
    return Math.round(annual);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl w-full overflow-hidden border border-[#E8ECF3] p-0 shadow-2xl">
        <div className="max-h-[82vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b border-[#E8ECF3] px-6 pb-4 pt-6 md:px-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-semibold text-slate-900">
                  {isCreateMode ? "Create Lead Plan" : "Edit Lead Plan"}
                </DialogTitle>
                <p className="text-sm text-slate-500">
                  Configure pricing, daily caps, and vendor eligibility.
                </p>
                {error && <p className="text-sm text-rose-600">{error}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-[#E8ECF3] bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase text-slate-700">
                  {currentValues.name || "BASIC"}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                    currentValues.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {currentValues.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 pb-6 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
              <div className="space-y-6">
                {/* Tier selection */}
                <section className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Plan tier</p>
                      <p className="text-xs text-slate-500">
                        Choose a tier. Tiers are unique.
                      </p>
                    </div>
                    {tierLocked && (
                      <span className="text-[11px] font-semibold text-slate-500">Tier locked in edit mode</span>
                    )}
                  </div>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: "Select a plan tier." }}
                    render={({ field }) => (
                      <div className="grid gap-3 md:grid-cols-3">
                        {PLAN_TIERS.map((tier) => {
                          const config = TIER_META[tier];
                          const isSelected = field.value === tier;
                          const disabled = tierLocked || isTierDisabled(tier);

                          return (
                            <button
                              type="button"
                              key={tier}
                              onClick={() => !disabled && field.onChange(tier)}
                              disabled={disabled}
                              className={`flex h-full flex-col rounded-2xl border p-4 text-left transition ${
                                isSelected
                                  ? "border-[#0B59A2] bg-[#0B59A2]/5 shadow-sm"
                                  : "border-[#E8ECF3] bg-white hover:border-[#0B59A2]/40"
                              } ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-0.5"}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{config.label}</p>
                                  <p className="text-xs text-slate-500">{config.tagline}</p>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  {config.badge && (
                                    <span className="rounded-full bg-[#FECB00]/30 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#0B59A2]">
                                      {config.badge}
                                    </span>
                                  )}
                                  {disabled && (
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                      Already created
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ul className="mt-3 space-y-1 text-[11px] text-slate-600">
                                {config.bullets.map((item) => (
                                  <li key={item} className="flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-[#0B59A2]" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-auto pt-4 text-[11px] font-semibold text-slate-600">
                                {isSelected ? "Selected" : disabled ? "Unavailable" : "Select tier"}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
                </section>

                {/* Pricing */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Pricing</p>
                      <p className="text-xs text-slate-500">Set subscription price and cycle.</p>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      Charged every {formatPreview(currentValues.durationDays)} days
                    </span>
                  </div>
                  <div className="grid gap-4 rounded-[16px] border border-[#E8ECF3] bg-white p-4 shadow-sm md:grid-cols-[1.3fr_0.7fr]">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold text-slate-900">
                        Price
                      </Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase text-slate-700">
                          {currentValues.currency || "SEK"}
                        </div>
                        <Input
                          id="price"
                          type="number"
                          min={0}
                          step={0.01}
                          className="h-14 pl-20 text-right text-3xl font-semibold tracking-tight"
                          placeholder="500"
                          {...register("price", {
                            required: "Price is required.",
                            min: { value: 0, message: "Price must be at least 0." },
                            valueAsNumber: true,
                            validate: (value) => ensureFiniteNumber(value),
                          })}
                          disabled={loading}
                        />
                      </div>
                      {errors.price ? (
                        <p className="text-xs text-rose-600">{errors.price.message}</p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Effective monthly ~ {currentValues.currency} {effectiveMonthly.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-900">Currency</Label>
                      <div className="rounded-xl border border-[#E8ECF3] bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                        SEK
                      </div>
                      <p className="text-xs text-slate-500">Locked to SEK.</p>
                    </div>
                  </div>
                </section>

                {/* Usage caps */}
                <section className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Usage caps</p>
                    <p className="text-xs text-slate-500">Set lead quotas and safety caps.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="flex h-full flex-col rounded-2xl border border-[#E8ECF3] bg-slate-50 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-[#0B59A2]" />
                          Leads per day
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Input
                          type="number"
                          min={1}
                          className="bg-white"
                          {...register("leadsPerDay", {
                            required: "Leads per day is required.",
                            min: { value: 1, message: "Value must be at least 1." },
                            valueAsNumber: true,
                            validate: ensureWholeNumber("Leads per day"),
                          })}
                          disabled={loading}
                        />
                        {errors.leadsPerDay ? (
                          <p className="text-xs text-rose-600">{errors.leadsPerDay.message}</p>
                        ) : (
                          <p className="text-xs text-slate-500">Maximum daily lead delivery.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex h-full flex-col rounded-2xl border border-[#E8ECF3] bg-slate-50 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-[#0B59A2]" />
                          Duration days
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Input
                          type="number"
                          min={1}
                          className="bg-white"
                          {...register("durationDays", {
                            required: "Duration is required.",
                            min: { value: 1, message: "Duration must be at least 1 day." },
                            valueAsNumber: true,
                            validate: ensureWholeNumber("Duration days"),
                          })}
                          disabled={loading}
                        />
                        {errors.durationDays ? (
                          <p className="text-xs text-rose-600">{errors.durationDays.message}</p>
                        ) : (
                          <p className="text-xs text-slate-500">Billing cycle length in days.</p>
                        )}
                      </div>
                    </div>

                    <div className="flex h-full flex-col rounded-2xl border border-[#E8ECF3] bg-slate-50 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#0B59A2]" />
                          Max concurrent leads
                        </div>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          Optional
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Input
                          type="number"
                          min={1}
                          className="bg-white"
                          {...register("maxConcurrentLeads", {
                            setValueAs: (value) =>
                              value === "" || value === undefined ? undefined : Number(value),
                            validate: (value) => {
                              if (value === undefined) return true;
                              if (!Number.isFinite(value)) return "Enter a valid number.";
                              if (!Number.isInteger(value)) return "Must be a whole number.";
                              return value >= 1 || "Must be at least 1 if provided.";
                            },
                          })}
                          disabled={loading || currentValues.name !== "UNLIMITED"}
                          placeholder={currentValues.name === "UNLIMITED" ? "Unlimited" : "Not required"}
                        />
                        {errors.maxConcurrentLeads ? (
                          <p className="text-xs text-rose-600">{errors.maxConcurrentLeads.message}</p>
                        ) : (
                          <p className="text-xs text-slate-500">
                            {currentValues.name === "UNLIMITED"
                              ? "Optional safety cap recommended for unlimited tiers."
                              : "Not required for this tier."}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Visibility */}
                <section className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Publish state</p>
                    <p className="text-xs text-slate-500">Unpublished plans cannot be purchased by vendors.</p>
                  </div>
                  <div
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm ${
                      currentValues.isActive ? "border-emerald-200 bg-emerald-50" : "border-[#E8ECF3] bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">Publish plan</p>
                      <p className="text-xs text-slate-600">Control whether vendors see this plan at checkout.</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          currentValues.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {currentValues.isActive ? "Published" : "Unpublished"}
                      </span>
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={loading}
                          />
                        )}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Preview */}
              <aside className="space-y-4 lg:sticky lg:top-4 self-start">
                <div className="mt-4 rounded-[16px] border border-[#E8ECF3] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Plan preview</p>
                      <p className="text-xs text-slate-500">Vendor checkout view</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-700">
                      {currentValues.name}
                    </span>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">
                        {formatPreview(resolvePrice(currentValues))}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {currentValues.currency} / {currentValues.durationDays || 0} days
                      </span>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Leads / day</span>
                        <span className="font-semibold">{formatPreview(currentValues.leadsPerDay)}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Duration</span>
                        <span className="font-semibold">{formatPreview(currentValues.durationDays)} days</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Concurrent leads</span>
                        <span className="font-semibold">
                          {currentValues.name === "UNLIMITED"
                            ? currentValues.maxConcurrentLeads ?? "Unlimited"
                            : "Not applicable"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Status</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            currentValues.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {currentValues.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">Vendors see this summary during checkout.</p>
                  </div>
                </div>
              </aside>
            </div>

            <DialogFooter className="mt-6 flex flex-col gap-3 border-t border-[#E8ECF3] bg-white pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">Changes apply immediately.</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? isCreateMode
                      ? "Creating..."
                      : "Saving..."
                    : isCreateMode
                    ? "Create plan"
                    : "Save changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
