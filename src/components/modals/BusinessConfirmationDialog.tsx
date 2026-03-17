import { BriefcaseBusiness } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type BusinessConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function BusinessConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: BusinessConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 bg-white p-0">
        <div className="relative bg-emerald-700 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_white,_transparent_60%)] opacity-20" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              <BriefcaseBusiness />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Business on StadOnClick</DialogTitle>
              <p className="mt-1 text-sm text-emerald-100">
                Manage your services and grow your bookings
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <DialogDescription className="text-sm leading-relaxed text-slate-600">
            Continue to your business workspace to manage profile, offerings, media, bookings, and
            customer insights.
          </DialogDescription>

          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">+</span>
              Manage services and pricing
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">+</span>
              Track leads, bookings, and payouts
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-600">+</span>
              Complete KYC and profile setup
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Continue to Business
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
