import AdminCardShell from "../AdminCardShell";

const pendingPayouts = [
  {
    vendor: "Nordic Spa AB",
    amount: "SEK 12,400",
    requestedAt: "2 hours ago",
    status: "Pending",
  },
  {
    vendor: "Stockholm Fitness",
    amount: "SEK 8,950",
    requestedAt: "Yesterday",
    status: "Pending",
  },
];

const PendingPayoutsCard = () => {
  const hasItems = pendingPayouts.length > 0;

  return (
    <AdminCardShell title="Pending Payouts" subtitle="Finance queue">
      <div className="flex h-full flex-col gap-4">
        <div className="overflow-hidden rounded border border-slate-200">
          <div className="grid grid-cols-[1.6fr_auto_auto_auto] items-center gap-3 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Vendor</span>
            <span>Amount</span>
            <span>Requested</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-slate-200">
            {hasItems ? (
              pendingPayouts.map((payout) => (
                <div
                  key={`${payout.vendor}-${payout.amount}`}
                  className="grid grid-cols-[1.6fr_auto_auto_auto] items-center gap-3 px-4 py-3 text-sm text-slate-800"
                >
                  <span className="font-semibold text-slate-900">
                    {payout.vendor}
                  </span>
                  <span className="font-medium text-slate-800">
                    {payout.amount}
                  </span>
                  <span className="text-slate-600">{payout.requestedAt}</span>
                  <span className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {payout.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No pending items
              </div>
            )}
          </div>
        </div>
        {hasItems && (
          <p className="mt-auto text-xs font-semibold text-slate-500">
            Approvals coming soon
          </p>
        )}
      </div>
    </AdminCardShell>
  );
};

export default PendingPayoutsCard;
