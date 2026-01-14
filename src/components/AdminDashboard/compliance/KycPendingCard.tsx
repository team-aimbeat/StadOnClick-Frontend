import AdminCardShell from "../AdminCardShell";

const KycPendingCard = () => {
  return (
    <AdminCardShell title="KYC Pending" subtitle="Compliance queue">
      <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-900">
          Identity verification backlog
        </p>
        <p className="text-sm text-slate-600">
          Holds KYC files requiring manual review, escalation, or third-party checks.
        </p>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Current state</span>
          <span className="font-semibold text-slate-800">Queue reserved</span>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default KycPendingCard;
