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

type AddOfferingFormValues = {
  name: string;
  description: string;
  basePrice: number;
  salePrice: number;
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
      maxQuantity: null,
    },
  });

  const basePrice = watch("basePrice");
  const salePrice = watch("salePrice");

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
        maxQuantity:
          values.maxQuantity == null || Number.isNaN(Number(values.maxQuantity))
            ? null
            : Number(values.maxQuantity),
      };

      if (!payload.name) {
        toast.error("Offering name is required.");
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
