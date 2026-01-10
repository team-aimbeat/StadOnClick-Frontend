import React from "react";
import { HiChevronLeft, HiDocumentCheck } from "react-icons/hi2";
import check_in from "@/assets/Images/check_in.png";

type KycStatusCardProps = {
  status: "pending" | "approved" | "rejected";
  onBack: () => void;
  onAction: () => void;
};

const statusCopy: Record<KycStatusCardProps["status"], { label: string; tone: string; message: string }> = {
  pending: {
    label: "Under review",
    tone: "text-blue-600 border-blue-200 bg-blue-50",
    message: "Our team is reviewing your documents. This usually takes 1-2 business days.",
  },
  approved: {
    label: "Verified",
    tone: "text-emerald-600 border-emerald-200 bg-emerald-50",
    message: "All documents have been verified. You can continue setting up services.",
  },
  rejected: {
    label: "Needs more info",
    tone: "text-rose-600 border-rose-200 bg-rose-50",
    message: "Some documents need attention. Please upload them again.",
  },
};

const actionCopy: Record<KycStatusCardProps["status"], { primary: string; secondary: string }> = {
  pending: { primary: "Complete your KYC", secondary: "Back" },
  approved: { primary: "Continue setup", secondary: "Back" },
  rejected: { primary: "Upload documents", secondary: "Back" },
};

const KycStatusCard: React.FC<KycStatusCardProps> = ({ status, onBack, onAction }) => {
  const copy = statusCopy[status];
  const actions = actionCopy[status];

  return (
    <div className="max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
      <div className="space-y-4 text-center text-slate-700">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-300 px-5 py-1 text-xs font-semibold uppercase text-blue-600">
          <HiDocumentCheck className="h-4 w-4" />
          {copy.label}
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Business verification in progress</h2>
        <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          Congrats! Your documents have been submitted successfully.
         <img src={check_in} className="w-8 h-8"/> </div>
        <p className="text-sm text-slate-500">{copy.message}</p>
      </div>
      <div className="mt-6 border-t border-slate-200 pt-5 text-left text-slate-600">
        <p className="mb-2 text-sm font-semibold text-slate-900">What happens next</p>
        <ul className="space-y-2 text-sm text-slate-500">
          <li>We verify your business and ownership details.</li>
          <li>You'll be notified if any action is required.</li>
          <li>Once approved, you can continue setting up your services.</li>
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-full border border-blue-300 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:border-blue-400"
        >
          <HiChevronLeft className="mr-2 h-4 w-4" />
          {actions.secondary}
        </button>
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-11 min-w-[180px] items-center justify-center rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          {actions.primary}
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        Need help? Contact support if your status doesn't change after 2 days.
      </p>
    </div>
  );
};

export default KycStatusCard;
