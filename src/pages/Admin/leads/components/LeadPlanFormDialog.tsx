import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Badge,
  BarChart3,
  CalendarDays,
  Crown,
  Layers,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LeadPlanTier } from "@/features/adminLeads/types/leadPlans.types";

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
  maxConcurrentLeads: 1,
  isActive: true,
};

const PLAN_TIERS: LeadPlanTier[] = ["BASIC", "PRO", "UNLIMITED"];

const TIER_CONFIG: Record<
  LeadPlanTier,
  { label: string; description: string; badge?: string }
> = {
  BASIC: { label: "Basic", description: "For new vendors validating demand" },
  PRO: { label: "Pro", description: "Most popular for growing teams", badge: "Popular" },
  UNLIMITED: { label: "Unlimited", description: "High volume & nationwide reach", badge: "High volume" },
};

const ensureFiniteNumber = (value: number) => {
  return Number.isFinite(value) || "Enter a valid number.";
};

const ensureWholeNumber = (label: string) => (value: number) => {
  if (!Number.isFinite(value)) {
    return `Enter a valid ${label.toLowerCase()}.`;
  }

  if (!Number.isInteger(value)) {
    return `${label} must be a whole number.`;
  }

  return true;
};

const formatPreview = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value.toLocaleString() : "—";

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
        if (firstAvailable) {
          setValue("name", firstAvailable);
        }
      }
    }
  }, [isOpen, mergedDefaults, reset, isCreateMode, existingPlanNames, setValue]);

  const currentValues = watch();

  // Ensure unlimited tiers always start with a sensible default cap.
  useEffect(() => {
    if (currentValues.name === "UNLIMITED") {
      if (
        currentValues.maxConcurrentLeads === undefined ||
        currentValues.maxConcurrentLeads === null ||
        Number.isNaN(currentValues.maxConcurrentLeads)
      ) {
        setValue("maxConcurrentLeads", 1, { shouldDirty: true });
      }
    } else if (currentValues.maxConcurrentLeads !== undefined) {
      setValue("maxConcurrentLeads", undefined, { shouldDirty: true });
    }
    if (currentValues.currency !== "SEK") {
      setValue("currency", "SEK");
    }
  }, [currentValues.name, currentValues.maxConcurrentLeads, currentValues.currency, setValue]);

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl border border-slate-200 p-0 shadow-2xl">
        <div className="max-h-[80vh] overflow-y-auto">
          <DialogHeader className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 md:px-8">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {isCreateMode ? "Create Lead Plan" : "Edit Lead Plan"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500">
                Configure pricing, limits, and visibility for vendor subscriptions.
              </DialogDescription>
              {error && <p className="text-sm text-rose-600">{error}</p>}
            </div>
            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase text-slate-700 md:inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              {currentValues.name || "BASIC"}
            </div>
          </DialogHeader>

          <Separator />

          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 pb-6 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <section className="mt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Plan Tier & Pricing</p>
                      <p className="text-xs text-slate-500">Choose a tier and set billing amount.</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Controller
                      name="name"
                      control={control}
                      rules={{ required: "Select a plan tier." }}
                      render={({ field }) => (
                        <>
                          {PLAN_TIERS.map((tier) => {
                            const config = TIER_CONFIG[tier];
                            const isSelected = field.value === tier;
                            const disabled = isTierDisabled(tier);
                            return (
                              <button
                                type="button"
                                key={tier}
                                onClick={() => !disabled && field.onChange(tier)}
                                className={`group flex flex-col rounded-2xl border p-4 text-left transition ${
                                  isSelected
                                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                    : "border-slate-200 bg-white hover:border-indigo-200"
                                } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
                                disabled={disabled}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Crown className="h-4 w-4 text-amber-500" />
                                    <p className="text-sm font-semibold text-slate-900">
                                      {config.label}
                                    </p>
                                  </div>
                                  {config.badge && (
                                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                                      {config.badge}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-2 text-xs text-slate-500">{config.description}</p>
                                <div className="mt-3 flex items-center justify-between text-[11px] font-medium">
                                  <span className="text-slate-600">
                                    {disabled ? "Already created" : isSelected ? "Selected" : "Select tier"}
                                  </span>
                                  <span
                                    className={`h-2 w-2 rounded-full transition ${
                                      isSelected ? "bg-indigo-500 shadow-[0_0_0_6px_rgba(99,102,241,0.15)]" : "bg-slate-300"
                                    }`}
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </>
                      )}
                    />
                    {errors.name && (
                      <p className="col-span-full text-xs text-rose-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-semibold text-slate-900">
                        Price
                      </Label>
                      <div className="relative">
                        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold uppercase text-slate-600">
                          {currentValues.currency || "SEK"}
                        </div>
                        <Input
                          id="price"
                          type="number"
                          placeholder="299"
                          min={0}
                          step={0.01}
                          className="pl-16 text-lg font-semibold"
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
                          Charged every billing cycle. Vendors pay: {currentValues.currency || "SEK"}{" "}
                          {formatPreview(currentValues.price)} / {formatPreview(currentValues.durationDays)} days
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-semibold text-slate-900">
                        Currency
                      </Label>
                      <Input
                        id="currency"
                        placeholder="SEK"
                        className="uppercase"
                        readOnly
                        value="SEK"
                        {...register("currency")}
                      />
                      <p className="text-xs text-slate-500">Locked to SEK for now.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Limits & Duration</p>
                    <p className="text-xs text-slate-500">
                      Define delivery caps and billing cycle.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-indigo-500" />
                          Leads / Day
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Input
                          id="leadsPerDay"
                          type="number"
                          min={1}
                          {...register("leadsPerDay", {
                            required: "Leads per day is required.",
                            min: { value: 1, message: "Value must be at least 1." },
                            valueAsNumber: true,
                            validate: (value) => ensureWholeNumber("Leads per day")(value),
                          })}
                          disabled={loading}
                        />
                        <div className="mt-auto">
                          {errors.leadsPerDay ? (
                            <p className="text-xs text-rose-600">{errors.leadsPerDay.message}</p>
                          ) : (
                            <p className="text-xs text-slate-500">Max leads a vendor can receive each day.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4 text-indigo-500" />
                          Duration (days)
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        <Input
                          id="durationDays"
                          type="number"
                          min={1}
                          {...register("durationDays", {
                            required: "Duration is required.",
                            min: { value: 1, message: "Duration must be at least 1 day." },
                            valueAsNumber: true,
                            validate: (value) => ensureWholeNumber("Duration days")(value),
                          })}
                          disabled={loading}
                        />
                        <div className="mt-auto">
                          {errors.durationDays ? (
                            <p className="text-xs text-rose-600">{errors.durationDays.message}</p>
                          ) : (
                            <p className="text-xs text-slate-500">Billing cycle length.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {currentValues.name === "UNLIMITED" && (
                      <div className="flex h-full min-h-[190px] flex-col rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-indigo-500" />
                            Concurrent Leads
                          </div>
                          <Badge className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                            Optional
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-2">
                          <Input
                            id="maxConcurrentLeads"
                            type="number"
                            min={1}
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
                            disabled={loading}
                          />
                          <div className="mt-auto space-y-1">
                            {errors.maxConcurrentLeads ? (
                              <p className="text-xs text-rose-600">{errors.maxConcurrentLeads.message}</p>
                            ) : (
                              <p className="text-xs text-slate-500">
                                Hard cap for unlimited tiers (optional).
                              </p>
                            )}
                            {!currentValues.maxConcurrentLeads && (
                              <p className="text-xs font-semibold text-amber-600">
                                Optional safety cap recommended for unlimited tiers.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <Separator />

                <section className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Visibility</p>
                    <p className="text-xs text-slate-500">
                      Control whether vendors can purchase this plan.
                    </p>
                  </div>
                  <div
                    className={`flex items-center justify-between gap-4 rounded-2xl border p-4 shadow-sm ${
                      currentValues.isActive
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900">Plan visibility</p>
                      <p className="text-xs text-slate-600">
                        Inactive plans are hidden from vendors and cannot be purchased.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          currentValues.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {currentValues.isActive ? "Active" : "Inactive"}
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

              <aside className="space-y-4 lg:sticky lg:top-4 self-start">
                <div className="mt-2 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Plan preview</p>
                      <p className="text-xs text-slate-500">Live summary as you configure.</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase text-slate-700 shadow-sm">
                      {currentValues.name}
                    </span>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Price</span>
                      <span className="text-base font-semibold text-slate-900">
                        {currentValues.currency} {formatPreview(currentValues.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Duration</span>
                      <span className="font-semibold text-slate-900">
                        {formatPreview(currentValues.durationDays)} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Leads / day</span>
                      <span className="font-semibold text-slate-900">
                        {formatPreview(currentValues.leadsPerDay)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Concurrent cap</span>
                      <span className="font-semibold text-slate-900">
                        {currentValues.name === "UNLIMITED"
                          ? currentValues.maxConcurrentLeads ?? "No cap set"
                          : "Not applicable"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Status</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                          currentValues.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {currentValues.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <DialogFooter className="mt-6 flex flex-col gap-2 border-t border-slate-200 bg-white pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Changes apply immediately to vendor checkout.
              </div>
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
                    ? "Create Plan"
                    : "Save Changes"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
