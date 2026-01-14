import AdminCardShell from "../AdminCardShell";

const RefundRequestsCard = () => {
  return (
    <AdminCardShell title="Refund Requests" subtitle="Finance queue">
      <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-900">
          Refund triage
        </p>
        <p className="text-sm text-slate-600">
          Dedicated space for refund intake, exception handling, and downstream ledger updates.
        </p>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Workflow</span>
          <span className="font-semibold text-slate-800">
            Awaiting API hook-up
          </span>
        </div>
      </div>
    </AdminCardShell>
  );
};

export default RefundRequestsCard;
