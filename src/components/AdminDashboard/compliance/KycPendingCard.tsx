import AdminCardShell from "../AdminCardShell";

const pendingKyc = [
  {
    vendor: "Wellness Hub",
    document: "Business License",
    submittedAt: "3 days ago",
  },
];

const KycPendingCard = () => {
  const hasItems = pendingKyc.length > 0;

  return (
    <AdminCardShell title="KYC Pending" subtitle="Compliance queue">
      <div className="flex h-full flex-col gap-4">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1.4fr_auto_auto] items-center gap-3 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Vendor</span>
            <span>Document</span>
            <span>Submitted</span>
          </div>
          <div className="divide-y divide-slate-200">
            {hasItems ? (
              pendingKyc.map((kyc) => (
                <div
                  key={`${kyc.vendor}-${kyc.document}`}
                  className="grid grid-cols-[1.4fr_auto_auto] items-center gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-slate-900">
                    {kyc.vendor}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    {kyc.document}
                  </span>
                  <span className="text-slate-600">{kyc.submittedAt}</span>
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                No pending items
              </div>
            )}
          </div>
        </div>
        <p className="mt-auto text-xs font-semibold text-slate-600">
          Compliance review required
        </p>
      </div>
    </AdminCardShell>
  );
};

export default KycPendingCard;
