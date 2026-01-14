import AdminCardShell from "../AdminCardShell";

const PendingPayoutsCard = () => {
  return (
    <AdminCardShell title="Pending Payouts" subtitle="Finance queue">
      <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-900">
          Disbursement staging
        </p>
        <p className="text-sm text-slate-600">
          Reserved for payouts awaiting treasury approval, reconciliation, and release workflows.
        </p>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Queue status</span>
          <span className="font-semibold text-slate-800">
            Integration pending
          </span>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default PendingPayoutsCard;
