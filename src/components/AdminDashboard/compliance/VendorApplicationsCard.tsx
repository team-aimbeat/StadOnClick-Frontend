import AdminCardShell from "../AdminCardShell";

const vendorApplications = [
  {
    vendor: "Urban Yoga Studio",
    city: "Gothenburg",
    appliedAt: "Today",
  },
];

const VendorApplicationsCard = () => {
  const hasItems = vendorApplications.length > 0;

  return (
    <AdminCardShell title="Vendor Applications" subtitle="Compliance queue">
      <div className="flex h-full flex-col">
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="grid grid-cols-[1.4fr_auto_auto] items-center gap-3 bg-slate-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            <span>Vendor</span>
            <span>City</span>
            <span>Applied</span>
          </div>
          <div className="divide-y divide-slate-200">
            {hasItems ? (
              vendorApplications.map((application) => (
                <div
                  key={`${application.vendor}-${application.city}`}
                  className="grid grid-cols-[1.4fr_auto_auto] items-center gap-3 px-4 py-3 text-sm text-slate-800"
                >
                  <span className="font-semibold text-slate-900">
                    {application.vendor}
                  </span>
                  <span className="text-slate-700">{application.city}</span>
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {application.appliedAt}
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
      </div>
    </AdminCardShell>
  );
};

export default VendorApplicationsCard;
