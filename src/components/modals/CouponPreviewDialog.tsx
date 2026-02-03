import * as React from "react";
import dayjs from "dayjs";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Coupon = {
  code: string;
  title: string;
  discount: number;
  minOrder: number;
  maxUses: number;
  expiry: string;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
};

type Props = {
  open: boolean;
  previewGradient?: string;
  coupon?: Coupon;
  onOpenChange: (open: boolean) => void;
};

export function CouponPreviewDialog({
  open,
  coupon,
  previewGradient = "from-slate-900 to-red-600",
  onOpenChange,
}: Props) {
  const validUntilLabel = coupon
    ? dayjs(coupon.expiry).format("MMMM YYYY")
    : "MMMM YYYY";
  const displayDiscount = coupon?.discount ?? 0;
  const minOrderText = coupon?.minOrder ? `INR ${coupon.minOrder}` : "INR --";
  const maxUsesText = coupon?.maxUses != null ? coupon.maxUses.toString() : "--";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Coupon preview</DialogTitle>
            <DialogClose />
          </div>
          <DialogDescription>
            View the coupon design before sharing it with your customers.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex justify-center">
          <div className="relative w-full max-w-xl">
            <div className="relative flex overflow-hidden rounded-[26px] ">
                <span
                  className="pointer-events-none absolute top-1/2 left-[-16px] h-10 w-10 -translate-y-1/2 rounded-full bg-white"
                  aria-hidden
                />
              <div className="flex w-36 flex-col items-center justify-between gap-1 border-r border-slate-200 bg-gray-200 px-4 py-5 text-center">
                <p className="text-md uppercase tracking-[0.25em] font-semibold text-slate-900">shopping coupon</p>
                <p className="text-3xl font-black text-slate-900 leading-tight">{displayDiscount}% OFF</p>
                
                <div className="space-y-0.5 text-md text-slate-500/80 ">
                  <p>Min order {minOrderText}</p>
                  <p>Max uses {maxUsesText}</p>
                </div>
              </div>

              <div className="flex items-stretch px-0.5 ">
                <div className="flex h-full flex-col items-center justify-center gap-1 py-2">
                  {Array.from({ length: 19 }).map((_, index) => (
                    <span
                      key={index}
                      className="h-2 w-2 rounded-full bg-amber-400/90"
                      aria-hidden
                    />
                  ))}
                </div>
              </div>

              <div
                className={`relative flex flex-1 flex-col gap-5 bg-gradient-to-r ${previewGradient} px-8 py-6 text-white`}
              >

                <span
                  className="pointer-events-none absolute top-1/2 right-[-16px] h-10 w-10 -translate-y-1/2 rounded-full bg-white"
                  aria-hidden
                />
                <div className="space-y-2">
                  <p className="text-xl uppercase tracking-[0.25em] text-white/80">stadonclick.com</p>
                  <p className="text-3xl font-black tracking-tight">{coupon?.title ?? "OFFER"}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-white/80">
                    Valid until <span className="font-semibold text-white">{validUntilLabel}</span>
                  </p>
                  <p className="text-lg font-semibold tracking-[0.25em]">Code : {coupon?.code ?? "CODE"}</p>
                  <p className="text-sm text-white/80">
                    Apply the code at checkout to unlock the offer. Terms may apply.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
