import { Megaphone } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type AffiliateProgramConfirmationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export default function AffiliateProgramConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: AffiliateProgramConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-3xl border-0 bg-white p-0">
        <div className="relative bg-blue-800 px-6 py-8 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_white,_transparent_60%)] opacity-20" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 text-2xl backdrop-blur-md">
              <Megaphone />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Become an Affiliate</DialogTitle>
              <p className="mt-1 text-sm text-indigo-100">
                Turn your network into recurring revenue
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 px-6 py-6">
          <DialogDescription className="text-sm leading-relaxed text-slate-600">
            Unlock your affiliate dashboard and start earning commission for every successful
            booking made through your referral link.
          </DialogDescription>

          <div className="relative rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Earning Potential
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900">Up to 10% Commission</p>
            <p className="mt-1 text-xs text-slate-500">On every completed booking</p>
          </div>

          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">+</span>
              Unique referral tracking link
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">+</span>
              Real-time commission analytics
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">+</span>
              Transparent payout reporting
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
              className="flex-1 rounded-xl bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Activate and Start Earning
            </button>
          </div>

          <p className="pt-1 text-center text-xs text-slate-400">
            You can manage or disable affiliate access anytime.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
