import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateOfferingPayload,
  useCreateOfferingMutation,
} from "@/services/vendorOfferingsApi";
import { normalizeApiError } from "@/shared/utils/normalizeApiError";
import { DEAL_DURATION_OPTIONS, calculateDiscountPercent } from "@/utils/deals";

type AddOfferingFormValues = {
  name: string;
  description: string;
  basePrice: number;
  salePrice: number;
  dealMode: "duration" | "endTime";
  dealDurationHours?: number | null;
  dealEndTime?: string;
  maxQuantity?: number | null;
};

type AddOfferingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string;
  onCreated?: () => void;
};

export function AddOfferingDialog({
  open,
  onOpenChange,
  serviceId,
  onCreated,
}: AddOfferingDialogProps) {
  const [createOffering, { isLoading }] = useCreateOfferingMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AddOfferingFormValues>({
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      salePrice: 0,
      dealMode: "duration",
      dealDurationHours: Number(DEAL_DURATION_OPTIONS[0].value),
      dealEndTime: "",
      maxQuantity: null,
    },
  });

  const basePrice = watch("basePrice");
  const salePrice = watch("salePrice");
  const dealMode = watch("dealMode");
  const discountPercent = calculateDiscountPercent(basePrice, salePrice);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  useEffect(() => {
    if (open && basePrice && !salePrice) {
      setValue("salePrice", basePrice, { shouldDirty: true });
    }
  }, [basePrice, open, salePrice, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const payload: CreateOfferingPayload = {
        serviceId,
        name: values.name.trim(),
        description: (values.description ?? "").trim(),
        basePrice: Number(values.basePrice),
        salePrice: Number(values.salePrice),
        dealDurationHours:
          values.dealMode === "duration"
            ? Number(values.dealDurationHours)
            : undefined,
        dealEndTime:
          values.dealMode === "endTime" && values.dealEndTime
            ? new Date(values.dealEndTime).toISOString()
            : undefined,
        maxQuantity:
          values.maxQuantity == null || Number.isNaN(Number(values.maxQuantity))
            ? null
            : Number(values.maxQuantity),
      };

      if (!payload.name) {
        toast.error("Offering name is required.");
        return;
      }

      if (payload.salePrice >= payload.basePrice) {
        toast.error("Sale price must be less than base price.");
        return;
      }

      if (values.dealMode === "duration" && !payload.dealDurationHours) {
        toast.error("Select a deal duration.");
        return;
      }

      if (values.dealMode === "endTime" && !payload.dealEndTime) {
        toast.error("Select a custom deal end time.");
        return;
      }

      await createOffering(payload).unwrap();
      toast.success("Offering created");
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      const normalized = normalizeApiError(error, "Unable to create offering");
      toast.error(normalized.toastMessage);
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add offering</DialogTitle>
          <DialogDescription>
            Create a new offering under your existing service.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="offering-name">Name</Label>
            <Input
              id="offering-name"
              placeholder="e.g. Standard package"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name?.message ? (
              <p className="text-xs text-rose-600">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offering-description">Description</Label>
            <Textarea
              id="offering-description"
              placeholder="Short details about what’s included"
              rows={4}
              {...register("description")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="offering-base-price">Base price</Label>
              <Input
                id="offering-base-price"
                type="number"
                min={0}
                step="0.01"
                {...register("basePrice", {
                  valueAsNumber: true,
                  required: "Base price is required",
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
              />
              {errors.basePrice?.message ? (
                <p className="text-xs text-rose-600">{errors.basePrice.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="offering-sale-price">Sale price</Label>
              <Input
                id="offering-sale-price"
                type="number"
                min={0}
                step="0.01"
                {...register("salePrice", {
                  valueAsNumber: true,
                  required: "Sale price is required",
                  min: { value: 0, message: "Must be 0 or greater" },
                })}
              />
              {errors.salePrice?.message ? (
                <p className="text-xs text-rose-600">{errors.salePrice.message}</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50/70 p-4">
            <p className="text-sm font-semibold text-slate-900">Limited Time Deal</p>
            <p className="mt-1 text-xs text-slate-600">
              Set how long the discounted sale price should stay active.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="offering-deal-mode">Deal mode</Label>
                <select
                  id="offering-deal-mode"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...register("dealMode")}
                >
                  <option value="duration">Choose duration</option>
                  <option value="endTime">Custom end time</option>
                </select>
              </div>

              {dealMode === "duration" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="offering-deal-duration">Deal duration</Label>
                  <select
                    id="offering-deal-duration"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...register("dealDurationHours", {
                      setValueAs: (value) =>
                        value === "" || value == null ? null : Number(value),
                    })}
                  >
                    {DEAL_DURATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="offering-deal-end-time">Deal end time</Label>
                  <Input
                    id="offering-deal-end-time"
                    type="datetime-local"
                    {...register("dealEndTime")}
                  />
                </div>
              )}
            </div>

            <div className="mt-4 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-orange-600">
              Discount Preview: {discountPercent > 0 ? `🔥 ${discountPercent}% OFF` : "Set a lower sale price"}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="offering-max-qty">Max quantity (optional)</Label>
            <Input
              id="offering-max-qty"
              type="number"
              min={1}
              step="1"
              placeholder="Leave blank for no limit"
              {...register("maxQuantity", {
                setValueAs: (v) => {
                  if (v === "" || v == null) return null;
                  const num = Number(v);
                  return Number.isNaN(num) ? null : num;
                },
                min: { value: 1, message: "Must be at least 1" },
              })}
            />
            {errors.maxQuantity?.message ? (
              <p className="text-xs text-rose-600">{errors.maxQuantity.message}</p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create offering"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
