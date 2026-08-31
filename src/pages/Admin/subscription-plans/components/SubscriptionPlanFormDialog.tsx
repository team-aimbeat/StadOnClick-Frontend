import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Sparkles, CalendarDays, Calculator } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type SubscriptionPlanFormValues = {
  planName: string;
  price: number;
  currency: string;
  durationDays: number;
  description: string;
  perks: string[];
  status: "ACTIVE" | "INACTIVE";
};

type SubscriptionPlanFormDialogProps = {
  mode: "create" | "edit";
  isOpen: boolean;
  loading?: boolean;
  error?: string | null;
  initialValues?: Partial<SubscriptionPlanFormValues>;
  onClose: () => void;
  onSubmit: (values: SubscriptionPlanFormValues) => void;
};

const DEFAULT_VALUES: SubscriptionPlanFormValues = {
  planName: "",
  price: 0,
  currency: "SEK",
  durationDays: 30,
  description: "",
  perks: [],
  status: "ACTIVE",
};

export default function SubscriptionPlanFormDialog({
  mode,
  isOpen,
  loading = false,
  error,
  initialValues,
  onClose,
  onSubmit,
}: SubscriptionPlanFormDialogProps) {
  const mergedDefaults = useMemo(
    () => ({ ...DEFAULT_VALUES, ...initialValues }),
    [initialValues]
  );
  const isCreateMode = mode === "create";

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SubscriptionPlanFormValues>({
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    if (isOpen) {
      reset(mergedDefaults);
    }
  }, [isOpen, mergedDefaults, reset]);

  const currentValues = watch();

  const handleFormSubmit = (data: SubscriptionPlanFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full border border-[#E8ECF3] p-0 shadow-2xl overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto bg-white">
          <DialogHeader className="border-b border-[#E8ECF3] px-6 pb-4 pt-6 md:px-8">
            <div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {isCreateMode ? "Create Subscription Plan" : "Edit Subscription Plan"}
              </DialogTitle>
              <p className="text-sm text-slate-500">
                Configure pricing and perks for premium users.
              </p>
              {error && <p className="mt-2 text-sm text-rose-600 font-medium">{error}</p>}
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="px-6 py-6 md:px-8 space-y-6">
            <div className="grid gap-6">
              {/* Plan Name */}
              <div className="space-y-2">
                <Label htmlFor="planName" className="text-sm font-semibold">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g. Premium 月額"
                  {...register("planName", { required: "Plan name is required" })}
                  disabled={loading}
                />
                {errors.planName && <p className="text-xs text-rose-600">{errors.planName.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the plan benefits..."
                  className="min-h-[100px]"
                  {...register("description")}
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-semibold">Price (SEK)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">SEK</span>
                    <Input
                      id="price"
                      type="number"
                      className="pl-12"
                      {...register("price", { 
                        required: "Price is required",
                        min: { value: 0, message: "Price cannot be negative" },
                        valueAsNumber: true
                      })}
                      disabled={loading}
                    />
                  </div>
                  {errors.price && <p className="text-xs text-rose-600">{errors.price.message}</p>}
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="durationDays" className="text-sm font-semibold">Duration (Days)</Label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="durationDays"
                      type="number"
                      className="pl-10"
                      {...register("durationDays", { 
                        required: "Duration is required",
                        min: { value: 1, message: "Duration must be at least 1 day" },
                        valueAsNumber: true
                      })}
                      disabled={loading}
                    />
                  </div>
                  {errors.durationDays && <p className="text-xs text-rose-600">{errors.durationDays.message}</p>}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E8ECF3] bg-slate-50">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold">Active Status</Label>
                  <p className="text-xs text-slate-500">Enable or disable this plan</p>
                </div>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value === "ACTIVE"}
                      onCheckedChange={(checked) => field.onChange(checked ? "ACTIVE" : "INACTIVE")}
                      disabled={loading}
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-[#E8ECF3] gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isCreateMode ? "Create Plan" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
