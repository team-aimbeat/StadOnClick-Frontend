import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SponsorshipPlanFormValues = {
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  priorityScore: number;
  impressionCap?: number | null;
  isActive: boolean;
};

type Props = {
  mode: "create" | "edit";
  isOpen: boolean;
  loading?: boolean;
  error?: string | null;
  initialValues?: Partial<SponsorshipPlanFormValues>;
  onClose: () => void;
  onSubmit: (values: SponsorshipPlanFormValues) => void;
};

const DEFAULT_VALUES: SponsorshipPlanFormValues = {
  name: "",
  price: 0,
  currency: "SEK",
  durationDays: 7,
  priorityScore: 1,
  impressionCap: undefined,
  isActive: true,
};

export function SponsorshipPlanFormDialog({
  mode,
  isOpen,
  loading = false,
  error,
  initialValues,
  onClose,
  onSubmit,
}: Props) {
  const defaults = useMemo(
    () => ({
      ...DEFAULT_VALUES,
      ...initialValues,
      currency: "SEK",
      impressionCap:
        initialValues && typeof initialValues.impressionCap === "number"
          ? initialValues.impressionCap
          : undefined,
    }),
    [initialValues]
  );
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SponsorshipPlanFormValues>({
    defaultValues: defaults,
  });

  useEffect(() => {
    if (isOpen) reset(defaults);
  }, [isOpen, defaults, reset]);

  const handleFormSubmit = (values: SponsorshipPlanFormValues) => {
    const cap = values.impressionCap;
    const impressionCap = Number.isFinite(cap as number) ? (cap as number) : undefined;
    const parsed: SponsorshipPlanFormValues = {
      ...values,
      price: Number(values.price),
      durationDays: Number(values.durationDays),
      priorityScore: Number(values.priorityScore),
      impressionCap,
    };
    onSubmit(parsed);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-4xl overflow-hidden border border-slate-200 p-0">
        <DialogHeader className="border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold text-slate-900">
                {mode === "create" ? "Create Sponsorship Plan" : "Edit Sponsorship Plan"}
              </DialogTitle>
              <p className="text-sm text-slate-500">
                Configure pricing, visibility window, and boost priority vendors will purchase.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-[11px] font-semibold uppercase",
                  mode === "create" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                )}
              >
                {mode}
              </span>
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6">
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="name">Plan name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Spotlight, Turbo"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && <p className="text-xs text-rose-600">{errors.name.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value="SEK"
                    readOnly
                    className="bg-slate-100 text-slate-500"
                    {...register("currency")}
                  />
                  {errors.currency && <p className="text-xs text-rose-600">{errors.currency.message}</p>}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    min={0}
                    step="0.01"
                    {...register("price", { required: "Price is required", valueAsNumber: true })}
                  />
                  <p className="text-[11px] text-slate-500">Charge vendors this amount per boost.</p>
                  {errors.price && <p className="text-xs text-rose-600">{errors.price.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="durationDays">Duration (days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min={1}
                    {...register("durationDays", { required: "Duration is required", valueAsNumber: true })}
                  />
                  <div className="flex gap-2 text-[11px] text-slate-500">
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-0.5 hover:border-blue-400"
                      onClick={() => setValue("durationDays", 7, { shouldDirty: true })}
                    >
                      7d
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-0.5 hover:border-blue-400"
                      onClick={() => setValue("durationDays", 14, { shouldDirty: true })}
                    >
                      14d
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-2 py-0.5 hover:border-blue-400"
                      onClick={() => setValue("durationDays", 30, { shouldDirty: true })}
                    >
                      30d
                    </button>
                  </div>
                  {errors.durationDays && (
                    <p className="text-xs text-rose-600">{errors.durationDays.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="priorityScore">Priority score</Label>
                  <Input
                    id="priorityScore"
                    type="number"
                    min={0}
                    step="1"
                    {...register("priorityScore", { required: "Priority is required", valueAsNumber: true })}
                  />
                  <p className="text-[11px] text-slate-500">
                    Higher priority means higher rank in sponsored listings.
                  </p>
                  {errors.priorityScore && (
                    <p className="text-xs text-rose-600">{errors.priorityScore.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="impressionCap">Impression cap (optional)</Label>
                  <Input
                    id="impressionCap"
                    type="number"
                    min={0}
                    placeholder="Leave empty for unlimited"
                    {...register("impressionCap", { valueAsNumber: true })}
                  />
                  <p className="text-[11px] text-slate-500">
                    Stop delivery after this many impressions during the paid window.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Active</p>
                    <p className="text-xs text-slate-500">Only active plans are visible to vendors.</p>
                  </div>
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Preview</p>
              <div className="rounded-lg bg-white p-3 border border-slate-100 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Plan name</span>
                  <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">
                    {mode === "create" ? "Draft" : "Editing"}
                  </span>
                </div>
                <p className="text-base font-bold text-slate-900">{watch("name") || "Your plan"}</p>
                <p className="text-sm text-slate-600">
                  Duration {watch("durationDays") || 0} days • Priority {watch("priorityScore") || 0}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span className="font-semibold">
                    {(watch("currency") || "SEK").toUpperCase()}{" "}
                    {Number(watch("price") ?? 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500">per boost</span>
                </div>
              </div>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• Keep naming consistent with vendor-facing labels.</li>
                <li>• Priority should correlate with price to avoid confusion.</li>
                <li>• Use caps for experiments; leave empty for unlimited delivery.</li>
              </ul>
            </div>
          </div>

          <Separator className="my-5" />
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {mode === "create" ? "Create plan" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SponsorshipPlanFormDialog;
