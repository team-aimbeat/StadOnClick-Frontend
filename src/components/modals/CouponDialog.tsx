import * as React from "react";
import { HiOutlineXMark } from "react-icons/hi2";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type CouponFormValues = {
  code: string;
  title: string;
  discount: number;
  minOrder: number;
  maxUses: number;
  expiry: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CouponFormValues) => Promise<string | undefined>;
};

export function CouponDialog({ open, onOpenChange, onSubmit }: Props) {
  const [values, setValues] = React.useState<CouponFormValues>({
    code: "",
    title: "",
    discount: 10,
    minOrder: 0,
    maxUses: 1,
    expiry: "",
  });
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!open) {
      setValues({
        code: "",
        title: "",
        discount: 10,
        minOrder: 0,
        maxUses: 1,
        expiry: "",
      });
      setError(undefined);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!values.code.trim() || !values.title.trim() || !values.expiry) {
      setError("All fields are required.");
      return;
    }

    if (values.discount <= 0 || values.minOrder < 0 || values.maxUses <= 0) {
      setError("Numeric values must be positive.");
      return;
    }

    const submitError = await onSubmit(values);
    if (submitError) {
      setError(submitError);
      return;
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Publish coupon</DialogTitle>
            <DialogClose aria-label="Close">
              <HiOutlineXMark className="h-4 w-4" />
            </DialogClose>
          </div>
          <DialogDescription>Share a new savings coupon with your customers.</DialogDescription>
        </DialogHeader>

        <form id="coupon-form" className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="coupon-code">Coupon code</Label>
            <Input
              id="coupon-code"
              maxLength={12}
              value={values.code}
              onChange={(event) => setValues({ ...values, code: event.target.value })}
              placeholder="SUMMER24"
            />
          </div>
          <div>
            <Label htmlFor="coupon-title">Title</Label>
            <Input
              id="coupon-title"
              value={values.title}
              onChange={(event) => setValues({ ...values, title: event.target.value })}
              placeholder="Special offer"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="coupon-discount">Discount %</Label>
              <Input
                id="coupon-discount"
                type="number"
                min={1}
                value={values.discount}
                onChange={(event) =>
                  setValues({ ...values, discount: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="coupon-min-order">Min order</Label>
              <Input
                id="coupon-min-order"
                type="number"
                min={0}
                value={values.minOrder}
                onChange={(event) =>
                  setValues({ ...values, minOrder: Number(event.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="coupon-max-uses">Max uses</Label>
              <Input
                id="coupon-max-uses"
                type="number"
                min={1}
                value={values.maxUses}
                onChange={(event) =>
                  setValues({ ...values, maxUses: Number(event.target.value) })
                }
              />
            </div>
          </div>
          <div>
            <Label htmlFor="coupon-expiry">Expiry</Label>
            <Input
              id="coupon-expiry"
              type="date"
              value={values.expiry}
              onChange={(event) => setValues({ ...values, expiry: event.target.value })}
            />
          </div>
          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
        </form>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="coupon-form">
            Publish coupon
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
